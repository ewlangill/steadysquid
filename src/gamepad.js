export function gamepadReport(pad) {
  if(!pad?.connected||pad.mapping!=='standard')return null;
  const axis=n=>{const v=Number.isFinite(n)?Math.max(-1,Math.min(1,n)):0;return Math.abs(v)<0.12?0:Math.sign(v)*(Math.abs(v)-0.12)/0.88;};
  return {gyro:{x:0,y:0,z:0},gyroDps:true,stickX:axis(pad.axes[2]),stickY:-axis(pad.axes[3]),zr:!!pad.buttons[7]?.pressed,recenter:!!pad.buttons[3]?.pressed,pause:!!pad.buttons[9]?.pressed};
}
export class BrowserGamepad {
  constructor(onReport,onStatus,nav=globalThis.navigator){this.onReport=onReport;this.onStatus=onStatus;this.nav=nav;this.device=null;}
  async connect(){if(!this.nav?.getGamepads)throw new Error('Gamepad input is unavailable in this browser.');const pad=[...this.nav.getGamepads()].find(p=>p?.connected&&p.mapping==='standard');if(!pad)throw new Error('Connect a controller and press a button, then try Connect again. A standard browser mapping is required.');this.device={index:pad.index};this.timer=setInterval(()=>{const p=this.nav.getGamepads()[this.device?.index];const r=gamepadReport(p);if(!r){this.close('Gamepad disconnected');return;}this.onReport(r,performance.now());},8);this.onStatus('Gamepad connected · sticks/buttons only; no motion.');}
  async close(message='Gamepad disconnected'){clearInterval(this.timer);this.device=null;this.onStatus(message);}
}
