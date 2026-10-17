// Trainer response, not a verified mapping to Splatoon's -5..+5 settings.
export const STICK_RADIANS_PER_SECOND = 2;
export const PROGCC_DPS_PER_COUNT = 2000 / 32768; // Existing provisional normalization; firmware gain is already present.
const clamp = (v, limit) => Number.isFinite(v) ? Math.max(-limit, Math.min(limit, v)) : 0;
export function aimDelta(report, dt, settings = {}) {
  const zero = { gyroYaw: 0, gyroPitch: 0, stickYaw: 0, stickPitch: 0, yaw: 0, pitch: 0 };
  if (!report || !Number.isFinite(dt) || dt <= 0 || dt > 0.1) return zero;
  const mode = settings.aimMode ?? 'motion', motion = settings.controller !== 'gamepad' && report.hasGyro !== false && mode !== 'sticks';
  const gain = v => Number.isFinite(v) ? Math.max(0.2, Math.min(4, v)) : 1;
  const scale = (report.gyroDps ? 1 : PROGCC_DPS_PER_COUNT) * Math.PI / 180 * gain(settings.gyroGain) * dt;
  const limit = report.gyroDps ? 4000 : 32768, axis = settings.yawAxis === 'y' ? 'y' : 'z';
  const gyroYaw = motion ? clamp(report.gyro?.[axis], limit) * scale * (settings.invertX ? -1 : 1) : 0;
  const gyroPitch = motion ? clamp(report.gyro?.x, limit) * scale * ((settings.invertY ?? true) ? -1 : 1) : 0;
  // Adapters/firmware already normalize their sticks. Do not add another deadzone here.
  const curve = v => Math.sign(v) * Math.pow(Math.abs(v), settings.stickCurve === 'precision' ? 1.5 : 1);
  const stickScale = STICK_RADIANS_PER_SECOND * gain(settings.stickGain) * dt;
  const stickYaw = -curve(clamp(report.stickX, 1)) * stickScale * (settings.stickInvertX ? -1 : 1);
  const stickPitch = !motion || mode === 'combined' ? curve(clamp(report.stickY, 1)) * stickScale * (settings.stickInvertY ? -1 : 1) : 0;
  return { gyroYaw, gyroPitch, stickYaw, stickPitch, yaw: gyroYaw + stickYaw, pitch: gyroPitch + stickPitch };
}

// Five-second local measurement. Keep only angular totals, never raw controller samples.
export class InputCheck {
  constructor() { this.state = 'ready'; }
  start(now) { this.state = 'measuring'; this.startAt = this.lastTo = now; this.covered = 0; this.samples = 0; this.totals = { gyroYaw: 0, gyroPitch: 0, stickYaw: 0, stickPitch: 0 }; this.message = ''; }
  sample(delta, dt, now) {
    if (this.state !== 'measuring' || !Number.isFinite(dt) || dt <= 0 || dt > 0.1 || !Number.isFinite(now)) return;
    const to = Math.min(now, this.startAt + 5000), seconds = Math.max(0, to - Math.max(now - dt * 1000, this.startAt, this.lastTo)) / 1000;
    if (seconds) {
      this.lastTo = to; this.covered += seconds; this.samples++;
      for (const key of Object.keys(this.totals)) this.totals[key] += (Number.isFinite(delta[key]) ? delta[key] : 0) * seconds / dt;
    }
    this.poll(now);
  }
  poll(now) {
    if (this.state !== 'measuring' || now < this.startAt + 5000) return;
    this.state = this.covered >= 4.5 ? 'complete' : 'incomplete';
    this.message = this.state === 'incomplete' ? 'Not enough fresh input. Reconnect or keep this tab active, then measure again.' : '';
  }
  cancel(message = 'Measurement cancelled.') { if (this.state !== 'ready') { this.state = 'cancelled'; this.message = message; } }
  get degrees() { return Object.fromEntries(Object.entries(this.totals ?? {}).map(([key, value]) => [key, value * 180 / Math.PI])); }
}
