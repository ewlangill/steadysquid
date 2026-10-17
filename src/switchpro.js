// Original wired HID adapter. Protocol references and limits: docs/SOURCES.md.
export function sensorCalibration(data) {
  if (!(data instanceof DataView) || data.byteLength < 24) return null;
  const offset = [], gain = [];
  for (let i = 0; i < 3; i++) {
    const o = data.getInt16(12+i*2,true), span = data.getInt16(18+i*2,true)-o;
    if (Math.abs(o)>5000 || span<5000 || span>30000) return null;
    offset.push(o); gain.push(936/span);
  }
  return { offset, gain };
}
const pair = (v,n) => [v.getUint8(n) | (v.getUint8(n+1)&15)<<8, v.getUint8(n+1)>>4 | v.getUint8(n+2)<<4];
export function rightStickCalibration(v) {
  if (!(v instanceof DataView) || v.byteLength<9) return null;
  const [x,y] = pair(v,0), [minX,minY] = pair(v,3), [maxX,maxY] = pair(v,6);
  return [x,y].every(n=>n>256&&n<3840) && [minX,minY,maxX,maxY].every(n=>n>128&&n<3500) ? {x,y,minX,minY,maxX,maxY} : null;
}
const axis = (n,center,lo,hi) => { const v=Math.max(-1,Math.min(1,(n-center)/(n<center?lo:hi))); return Math.abs(v)<0.12?0:Math.sign(v)*(Math.abs(v)-0.12)/0.88; };
export function decodeSwitchReport(view,cal,stick,bias=[0,0,0]) {
  // WebHID separates the report ID from its data; this is report 0x30's payload.
  if (!(view instanceof DataView) || view.byteLength<48 || !cal || !stick) return null;
  const gyro = [0,0,0];
  for(let sample=0;sample<3;sample++) for(let i=0;i<3;i++) gyro[i]+=(view.getInt16(18+sample*12+i*2,true)-cal.offset[i])*cal.gain[i]/3;
  const [x,y] = pair(view,8);
  return {gyro:{x:gyro[0]-bias[0],y:gyro[1]-bias[1],z:gyro[2]-bias[2]},gyroDps:true,stickX:axis(x,stick.x,stick.minX,stick.maxX),stickY:axis(y,stick.y,stick.minY,stick.maxY),zr:!!(view.getUint8(2)&128),recenter:!!(view.getUint8(2)&1),pause:!!(view.getUint8(3)&2)};
}
export class SwitchPro {
  constructor(onReport,onStatus,hid=globalThis.navigator?.hid) {
    this.onReport=onReport;this.onStatus=onStatus;this.hid=hid;this.device=null;this.counter=0;this.ready=false;this.bias=[0,0,0];
    this.input=e=>this.receive(e);
    hid?.addEventListener('disconnect',e=>{if(e.device===this.device)this.close('Switch Pro disconnected');});
  }
  receive(e) {
    if(e.device!==this.device)return;
    if(this.pending?.match(e)){this.pending.resolve(e.data);return;}
    if(e.reportId!==0x30 || !this.ready)return;
    const report=decodeSwitchReport(e.data,this.cal,this.stick,this.bias);
    if(!report)return;
    if(this.zero) {
      const raw=decodeSwitchReport(e.data,this.cal,this.stick);
      const values=Object.values(raw.gyro);
      if(values.some(n=>Math.abs(n)>3)) {this.zero.reject(new Error('Keep the controller still, then try Zero motion again.'));this.zero=null;}
      else {this.zero.count++;values.forEach((v,i)=>this.zero.sum[i]+=v);if(performance.now()-this.zero.start>=700){this.bias=this.zero.sum.map(v=>v/this.zero.count);this.zero.resolve();this.zero=null;}}
    }
    this.onReport(report,performance.now());
  }
  async exchange(reportId,bytes,match) {
    let timer;
    const reply=new Promise((resolve,reject)=>{timer=setTimeout(()=>reject(new Error('Switch Pro did not reply. Reconnect the USB cable and try again.')),1800);this.pending={match,resolve,reject};});
    try {const payload=new Uint8Array(63);payload.set(bytes);await this.device.sendReport(reportId,payload);return await reply;}
    catch(error){this.pending?.reject(error);await reply.catch(()=>{});throw error;}
    finally{clearTimeout(timer);this.pending=null;}
  }
  command(id,args=[]) {
    return this.exchange(1,[this.counter++&15,0,1,0x40,0x40,0,1,0x40,0x40,id,...args],e=>e.reportId===0x21&&e.data.byteLength>=14&&e.data.getUint8(13)===id).then(v=>{if(!(v.getUint8(12)&128))throw new Error('Switch Pro rejected the input command.');return v;});
  }
  async read(address,length) {
    const v=await this.command(0x10,[address&255,address>>8&255,address>>16&255,address>>>24,length]);
    if(v.byteLength<19+length || v.getUint32(14,true)!==address || v.getUint8(18)!==length)throw new Error('Switch Pro calibration reply was incomplete.');
    return new DataView(v.buffer,v.byteOffset+19,length);
  }
  async connect() {
    if(!this.hid)throw new Error('Switch Pro motion needs WebHID in desktop Chrome or Edge.');
    const paired=await this.hid.getDevices();
    const device=paired.find(d=>d.vendorId===0x057e&&d.productId===0x2009) || (await this.hid.requestDevice({filters:[{vendorId:0x057e,productId:0x2009}]}))[0];
    if(!device)throw new DOMException('No controller selected','NotFoundError');
    if(!device.collections?.some(c=>c.outputReports?.some(r=>r.reportId===0x80)))throw new Error('Choose the original Switch Pro connected by USB. Wireless is not supported by this preview.');
    this.device=device;this.ready=false;this.counter=0;this.bias=[0,0,0];
    try {
      if(!device.opened)await device.open();device.addEventListener('inputreport',this.input);
      for(const code of [2,3,2])await this.exchange(0x80,[code],e=>e.reportId===0x81&&e.data.byteLength>0&&e.data.getUint8(0)===code);
      const usb=new Uint8Array(63);usb[0]=4;await device.sendReport(0x80,usb);
      const factory=await this.read(0x6020,24),user=await this.read(0x8026,26);
      this.cal=user.getUint16(0,true)===0xa1b2?sensorCalibration(new DataView(user.buffer,user.byteOffset+2,24)):null;
      this.cal ||= sensorCalibration(factory);
      const fs=await this.read(0x6046,9),us=await this.read(0x801b,11);
      this.stick=us.getUint16(0,true)===0xa1b2?rightStickCalibration(new DataView(us.buffer,us.byteOffset+2,9)):null;
      this.stick ||= rightStickCalibration(fs);
      if(!this.cal||!this.stick)throw new Error('Valid Switch Pro sensor/stick calibration could not be read.');
      await this.command(0x40,[1]);await this.command(3,[0x30]);this.ready=true;
      this.onStatus('Switch Pro connected · wired preview. Motion direction needs your check.');
    }catch(error){await this.close();throw error;}
  }
  async zeroMotion() {
    if(!this.ready)throw new Error('Connect Switch Pro first.');
    if(this.zero)throw new Error('Motion calibration is already running.');
    let timer;
    try {await new Promise((resolve,reject)=>{timer=setTimeout(()=>{this.zero=null;reject(new Error('No fresh motion samples. Reconnect and try again.'));},2500);this.zero={start:performance.now(),sum:[0,0,0],count:0,resolve,reject};});}
    finally{clearTimeout(timer);this.zero=null;}
  }
  async close(message='Switch Pro disconnected') {
    const d=this.device;this.device=null;this.ready=false;
    this.pending?.reject(new Error('Controller disconnected'));this.zero?.reject(new Error('Controller disconnected'));this.zero=null;
    if(d){d.removeEventListener('inputreport',this.input);try{const v=new Uint8Array(63);v[0]=5;await d.sendReport(0x80,v);await d.close();}catch{try{await d.close();}catch{}}}
    this.onStatus(message);
  }
}
