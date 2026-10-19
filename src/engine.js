import { WEAPONS } from './weapons.js?v=93b6d62bd518957c';
export const SESSION_SECONDS = 60;
export class Splatling {
  constructor(profile = WEAPONS.heavy) { this.profile = profile; this.reset(); }
  reset() { this.phase = 'idle'; this.charge = 0; this.remaining = 0; this.chargeFrames = 0; this.shotCharge = 0; this.burstFrames = 0; this.fireFrame = 0; this.fraction = 0; this.held = false; }
  beginCharge() { this.phase = 'charging'; this.charge = 0; this.chargeFrames = 0; this.remaining = 0; }
  press() { this.held = true; if (this.phase === 'idle') this.beginCharge(); }
  release() {
    this.held = false;
    if (this.phase !== 'charging') return;
    const f = this.chargeFrames, p = this.profile;
    this.burstFrames = Math.floor(f <= p.firstChargeFrames ? f / p.firstChargeFrames * p.firstBurstFrames : p.firstBurstFrames + (f - p.firstChargeFrames) / (p.fullChargeFrames - p.firstChargeFrames) * (p.fullBurstFrames - p.firstBurstFrames));
    this.remaining = this.burstFrames / 60; this.phase = this.burstFrames > 0 ? 'firing' : 'idle'; this.fireFrame = 0; this.fraction = 0;
  }
  step(dt) {
    if (!Number.isFinite(dt) || dt <= 0) return { firingSeconds: 0, shots: 0 };
    this.fraction += dt * 60;
    const ticks = Math.floor(this.fraction + 1e-9); this.fraction = Math.max(0, this.fraction - ticks);
    let firingFrames = 0, shots = 0;
    for (let i = 0; i < ticks; i++) {
      if (this.phase === 'charging') {
        const p = this.profile;
        this.chargeFrames = Math.min(p.fullChargeFrames, this.chargeFrames + 1);
        this.charge = this.chargeFrames <= p.firstChargeFrames ? this.chargeFrames / p.firstChargeFrames * 0.5 : 0.5 + (this.chargeFrames - p.firstChargeFrames) / (p.fullChargeFrames - p.firstChargeFrames) * 0.5;
      } else if (this.phase === 'firing') {
        // Capture before the last burst tick clears charge or queues another charge.
        if (this.fireFrame % this.profile.shotIntervalFrames === 0) { this.shotCharge = this.charge; shots++; }
        this.fireFrame++; firingFrames++; this.burstFrames--;
        this.remaining = this.burstFrames / 60;
        if (this.burstFrames <= 0) { this.phase = 'idle'; this.charge = 0; if (this.held) this.beginCharge(); }
      }
    }
    return { firingSeconds: firingFrames / 60, shots };
  }
}
// Cadence/startup are provisional trainer settings until inherited game defaults are verified.
export class Shooter {
  constructor({ repeatFrames = 6, startupFrames = 3 } = {}) {
    this.repeatFrames = Number.isInteger(repeatFrames) && repeatFrames >= 1 ? repeatFrames : 6;
    this.startupFrames = Number.isInteger(startupFrames) && startupFrames >= 1 ? startupFrames : 3;
    this.reset();
  }
  reset() { this.phase = 'idle'; this.held = false; this.charge = 0; this.remaining = 0; this.fireFrame = 0; this.fraction = 0; this.cooldown = 0; this.startup = 0; }
  press() { if (this.held) return; this.held = true; this.phase = 'firing'; this.startup = this.startupFrames; }
  release() { this.held = false; this.phase = 'idle'; this.startup = 0; }
  step(dt) {
    if (!Number.isFinite(dt) || dt <= 0) return { firingSeconds: 0, shots: 0 };
    this.fraction += dt * 60;
    const ticks = Math.floor(this.fraction + 1e-9); this.fraction = Math.max(0, this.fraction - ticks);
    let shots = 0, firingFrames = 0;
    for (let i = 0; i < ticks; i++) {
      this.cooldown = Math.max(0, this.cooldown - 1);
      if (!this.held) continue;
      firingFrames++; this.startup = Math.max(0, this.startup - 1);
      if (!this.startup && !this.cooldown) { shots++; this.fireFrame++; this.cooldown = this.repeatFrames; }
    }
    return { shots, firingSeconds: firingFrames / 60 };
  }
}
export class Charger {
  constructor(profile = WEAPONS.splatcharger) { this.profile = profile; this.reset(); }
  reset() { this.phase = 'idle'; this.held = false; this.charge = 0; this.chargeFrames = 0; this.shotCharge = 0; this.remaining = 0; this.fireFrame = 0; this.fraction = 0; }
  press() { if (this.held) return; this.held = true; if (this.phase === 'idle') { this.phase = 'charging'; this.chargeFrames = 0; this.charge = 0; } }
  release() { this.held = false; }
  step(dt) {
    if (!Number.isFinite(dt) || dt <= 0) return { shots: 0, firingSeconds: 0 };
    this.fraction += dt * 60; const ticks = Math.floor(this.fraction + 1e-9); this.fraction = Math.max(0, this.fraction - ticks);
    let shots = 0;
    for (let i = 0; i < ticks; i++) {
      if (this.phase === 'firing') { this.phase = this.held ? 'charging' : 'idle'; this.chargeFrames = 0; this.charge = 0; }
      if (this.phase !== 'charging') continue;
      if (this.held || this.chargeFrames < this.profile.minChargeFrames) this.chargeFrames = Math.min(this.profile.fullChargeFrames, this.chargeFrames + 1);
      this.charge = this.chargeFrames / this.profile.fullChargeFrames;
      if (!this.held && this.chargeFrames >= this.profile.minChargeFrames) {
        this.shotCharge = this.charge; this.phase = 'firing'; this.fireFrame++; shots++;
      }
    }
    return { shots, firingSeconds: shots / 60 };
  }
}
export class Session {
  constructor(weaponId = 'heavy') { this.setWeapon(weaponId); }
  setWeapon(id) { this.weaponId = Object.hasOwn(WEAPONS, id) ? id : 'heavy'; const p = WEAPONS[this.weaponId]; this.weapon = p.family === 'splatling' ? new Splatling(p) : p.family === 'charger' ? new Charger(p) : new Shooter(p); this.reset(); }
  reset() { this.elapsed = 0; this.onTarget = 0; this.fireTime = 0; this.fireOnTarget = 0; this.errorSum = 0; this.shots = 0; this.hits = 0; this.lastShotCharge = 0; this.state = 'ready'; this.weapon.reset(); }
  start() { this.reset(); this.state = 'running'; }
  pause() { if (this.state === 'running') { this.state = 'paused'; this.weapon.reset(); } }
  resume() { if (this.state === 'paused') this.state = 'running'; }
  press() { if (this.state === 'running') this.weapon.press(); }
  release() { if (this.state === 'running') this.weapon.release(); }
  step(dt, onTarget, angularError, scoreInstantHits = true) {
    if (this.state !== 'running' || !Number.isFinite(dt) || dt <= 0) return;
    dt = Math.min(dt, SESSION_SECONDS - this.elapsed);
    const fire = this.weapon.step(dt);
    this.elapsed += dt;
    this.onTarget += onTarget ? dt : 0;
    this.fireTime += fire.firingSeconds;
    this.fireOnTarget += onTarget ? fire.firingSeconds : 0;
    this.errorSum += (Number.isFinite(angularError) ? Math.max(0, angularError) : 0) * dt;
    if (fire.shots) this.lastShotCharge = this.weapon.shotCharge ?? this.weapon.charge;
    this.shots += fire.shots;
    this.hits += scoreInstantHits && onTarget ? fire.shots : 0;
    if (this.elapsed >= SESSION_SECONDS - 1e-9) { this.state = 'complete'; this.weapon.reset(); }
  }
  get tracking() { return this.elapsed > 0 ? this.onTarget / this.elapsed : null; }
  get firingTracking() { return this.fireTime > 0 ? this.fireOnTarget / this.fireTime : null; }
  get angularError() { return this.elapsed > 0 ? this.errorSum / this.elapsed : null; }
}
export function targetAt(time, speed = 1) { return { x: Math.sin(time * 0.65 * speed) * 3, y: 1.6 + Math.sin(time * 0.31 * speed) * 0.25, z: -8 }; }
export function summarizeFrames(samples) {
  if (!samples.length) return null;
  const sorted = [...samples].sort((a, b) => a - b);
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  return { fps: 1000 / mean, p95: sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1)], stalls: samples.filter(t => t > 25).length };
}
