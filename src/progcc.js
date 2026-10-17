// Original adapter for the pinned HOJA wire protocol; see docs/SOURCES.md.
export function decodeReport(view) {
  if (!(view instanceof DataView) || view.byteLength < 53 || view.getUint8(0) !== 255) return null;
  const input = n => view.getUint8(17 + n);
  return {
    gyro: { x: view.getInt16(9, true), y: view.getInt16(11, true), z: view.getInt16(13, true) },
    accel: { x: view.getInt16(3, true), y: view.getInt16(5, true), z: view.getInt16(7, true) },
    zr: !!(input(12) & 128) || (input(13) & 127) >= 64,
    recenter: !!(input(2) & 128), pause: !!(input(18) & 128),
    stickX: Math.max(-1, Math.min(1, ((input(32) & 127) - (input(33) & 127)) / 64)),
    stickY: Math.max(-1, Math.min(1, ((input(34) & 127) - (input(35) & 127)) / 64)),
  };
}
export class MotionInput {
  constructor() { this.reset(); }
  reset() { this.lastAt = null; this.previous = null; }
  get live() { return this.lastAt !== null; }
  sample(report, now) {
    const dt = this.lastAt === null ? 0 : (now - this.lastAt) / 1000;
    const continuous = dt > 0 && dt <= 0.1;
    const old = continuous ? this.previous : null;
    this.lastAt = now; this.previous = report;
    return {
      dt: continuous ? dt : 0,
      lostContinuity: dt > 0.1 || dt < 0,
      press: !!old && report.zr && !old.zr,
      release: !!old && !report.zr && old.zr,
      recenter: !!old && report.recenter && !old.recenter,
      pause: !!old && report.pause && !old.pause,
    };
  }
  stale(now) { return this.lastAt !== null && now - this.lastAt > 400; }
}
export class ProGCC {
  constructor(onReport, onStatus, usb = globalThis.navigator?.usb) {
    this.usb = usb; this.onReport = onReport; this.onStatus = onStatus; this.device = null;
    this.disconnectHandler = event => { if (event.device === this.device) this.close('Controller disconnected'); };
    usb?.addEventListener('disconnect', this.disconnectHandler);
  }
  async connect() {
    if (!this.usb) throw new Error('Open this local page in Chrome or Edge for controller USB access.');
    const paired = await this.usb.getDevices?.() || [];
    const known = paired.find(d => d.vendorId === 0x2e8a && [0x10c6, 0x10df].includes(d.productId));
    const device = known || await this.usb.requestDevice({ filters: [
      { vendorId: 0x2e8a, productId: 0x10c6 }, { vendorId: 0x2e8a, productId: 0x10df },
      { vendorId: 0x057e, productId: 0x2009 },
    ] });
    try {
      await device.open(); await device.selectConfiguration(1); await device.claimInterface(1);
      this.device = device;
      // Only select the temporary raw input stream. No settings writes or calibration commands.
      const result = await device.transferOut(2, new Uint8Array([5, 0, 255]));
      if (result.status !== 'ok') throw new Error('Could not start the controller input stream.');
      this.onStatus('Waiting for controller reports'); this.read(device);
    } catch (error) { await this.close(); try { await device.close(); } catch {} throw error; }
  }
  async read(device) {
    try {
      while (this.device === device) {
        const result = await device.transferIn(2, 64);
        if (this.device !== device) return;
        if (result.status !== 'ok') throw new Error('Controller USB read stopped. Reconnect to try again.');
        const report = decodeReport(result.data);
        if (report) this.onReport(report, performance.now());
      }
    } catch (error) { if (this.device === device) await this.close(error.message); }
  }
  async close(message = 'Controller disconnected') {
    const device = this.device; this.device = null;
    this.onStatus(message);
    if (device) { try { await device.close(); } catch {} }
  }
}

// The Plus button is a primary session control; no controller settings are written.
export function controllerSessionAction(state) {
  if (state === 'ready' || state === 'complete') return 'start';
  if (state === 'running' || state === 'paused') return 'pause';
  return null;
}
