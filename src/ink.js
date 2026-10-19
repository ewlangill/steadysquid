import { random01 } from './random.js?v=93b6d62bd518957c';
import { advanceVelocity, damageAtAge } from './ballistics.js?v=93b6d62bd518957c';
// Heavy uses community-reconstructed per-axis bias curves; other spread remains approximate. See SOURCES.md.
export function shotSpread(seed, serial, burstShot = serial, profile = { yaw: 3.3, pitch: 1.6, speedRandom: 0.12 }, shooterBias) {
  const n = serial * 4, shooter = profile.family === 'shooter';
  if (profile.angularModel === 'splatling-power') {
    // Per-axis community reconstruction: no shooter-like burst widening for Heavy.
    return { yaw: biasedSigned(random01(seed, n), profile.yawBias) * profile.yaw * Math.PI / 180,
      pitch: biasedSigned(random01(seed, n + 1), profile.pitchBias) * profile.pitch * Math.PI / 180,
      speed: speedVariation(random01(seed, n + 3), profile) };
  }
  const wideChance = shooter ? shooterBias ?? Math.min(0.3, (profile.biasMin ?? 0.01) + burstShot * (profile.biasStep ?? 0.01)) : Math.min(0.3, 0.1 + burstShot * 0.02);
  const wide = random01(seed, n) < wideChance;
  const radius = Math.sqrt(random01(seed, n + 1)) * (wide ? 1 : shooter ? 0.2 : 0.4), angle = random01(seed, n + 2) * Math.PI * 2;
  return { yaw: Math.cos(angle) * radius * profile.yaw * Math.PI / 180, pitch: Math.sin(angle) * radius * profile.pitch * Math.PI / 180,
    speed: speedVariation(random01(seed, n + 3), profile) };
}
// Preserve the seeded stream and legacy presets. Bias shapes magnitude, not its bounds.
function biasedSigned(sample, bias) {
  const signed = sample * 2 - 1;
  return Math.sign(signed) * Math.abs(signed) ** (Math.log(bias) / Math.log(0.5));
}
function speedVariation(sample, profile) {
  const deviation = profile.speedRandomBias === undefined ? sample * 2 - 1 : biasedSigned(sample, profile.speedRandomBias);
  return 1 + deviation * profile.speedRandom;
}
export function spreadDirection(forward, right, up, spread) {
  const out = forward.map((v, i) => v + right[i] * Math.tan(spread.yaw) + up[i] * Math.tan(spread.pitch));
  const length = Math.hypot(...out); return out.map(v => v / length);
}
// Swept segment/sphere test prevents a fast droplet skipping through a target.
export function segmentSphere(a, b, center, radius) {
  const d = b.map((v, i) => v - a[i]), o = a.map((v, i) => v - center[i]);
  const aa = d.reduce((s, v) => s + v * v, 0), bb = 2 * o.reduce((s, v, i) => s + v * d[i], 0), cc = o.reduce((s, v) => s + v * v, 0) - radius * radius;
  if (cc <= 0) return 0; if (!aa) return null;
  const disc = bb * bb - 4 * aa * cc; if (disc < 0) return null;
  const t = (-bb - Math.sqrt(disc)) / (2 * aa); return t >= 0 && t <= 1 ? t : null;
}
export class InkCloud {
  constructor(limit = 64) { this.limit = limit; this.reset(); }
  reset() { this.drops = []; this.splashes = []; this.serial = 0; }
  launch(origin, direction, speed = 2.1, damage = 30, spec = null) {
    if (this.drops.length >= this.limit) this.drops.shift();
    this.drops.push({ id: this.serial++, position: [...origin], previous: [...origin], velocity: direction.map(v => v * speed), age: 0, damage, spec, distance: 0, hitTargets: new Set() });
  }
  step(targets, radius) {
    const impacts = [], survivors = [];
    this.splashes = this.splashes.filter(s => ++s.age < s.life);
    for (const drop of this.drops) {
      const a = drop.position, stepLength = Math.hypot(...drop.velocity), left = Math.max(0, (drop.spec?.maxDistance ?? Infinity) - drop.distance);
      const fraction = Math.min(1, left / stepLength), b = a.map((v, i) => v + drop.velocity[i] * fraction);
      drop.previous = [...a]; drop.age++;
      const candidates = [];
      const offer = hit => { if (hit.t >= 0 && hit.t <= 1) candidates.push(hit); };
      targets.forEach((target, index) => { if (target.alive && !drop.hitTargets.has(index)) { const t = segmentSphere(a, b, target.position, radius + (drop.spec?.radius ?? 0.035)); if (t !== null) offer({ t, index }); } });
      const fieldRadius = drop.spec?.fieldRadius, field = Number.isFinite(fieldRadius) && fieldRadius >= 0;
      const floorY = field ? fieldRadius : 0.03, wallZ = field ? -15 + fieldRadius : -14.85;
      if (field && a[1] <= floorY) offer({ t: 0, index: -1, normal: [0, 1, 0] });
      else if (b[1] <= floorY && a[1] > floorY) offer({ t: (floorY - a[1]) / (b[1] - a[1]), index: -1, normal: [0, 1, 0] });
      if (field && a[2] <= wallZ) offer({ t: 0, index: -1, normal: [0, 0, 1] });
      else if (b[2] <= wallZ && a[2] > wallZ) offer({ t: (wallZ - a[2]) / (b[2] - a[2]), index: -1, normal: [0, 0, 1] });
      let stopped = false;
      for (const best of candidates.sort((x, y) => x.t - y.t)) {
        const point = a.map((v, i) => v + (b[i] - v) * best.t);
        const normal = best.normal || point.map((v, i) => v - targets[best.index].position[i]);
        const length = Math.hypot(...normal) || 1;
        // Environment collision sweeps the projectile center; paint belongs on the surface.
        const contact = field && best.index < 0 ? point.map((v, i) => v - normal[i] * fieldRadius) : point;
        if (field && best.index < 0) contact[best.normal[1] ? 1 : 2] = best.normal[1] ? 0 : -15;
        this.splashes.push({ point: contact, normal: normal.map(v => v / length), age: 0, life: best.index < 0 ? 240 : 10, id: drop.id });
        if (this.splashes.length > 96) this.splashes.shift();
        impacts.push({ index: best.index, point: contact, id: drop.id, damage: damageAtAge(drop.damage, drop.age - 1 + best.t * fraction, drop.spec) });
        if (best.index >= 0) drop.hitTargets.add(best.index);
        if (best.index < 0 || !drop.spec?.pierce) { stopped = true; break; }
      }
      if (stopped) continue;
      drop.position = b;
      drop.distance += stepLength * fraction;
      if (drop.spec) advanceVelocity(drop);
      else if (drop.age >= 8) { drop.velocity[0] *= 0.985; drop.velocity[2] *= 0.985; drop.velocity[1] -= 0.025; }
      if (fraction === 1 && drop.distance < (drop.spec?.maxDistance ?? Infinity) && drop.age < 90 && Math.abs(b[0]) < 25 && b[1] > -2 && b[1] < 20) survivors.push(drop);
    }
    this.drops = survivors; return impacts;
  }
}

// Standing-only reconstruction: parameter bounds are sourced; mixture and ceiling are original.
export class ShooterSpread {
  reset() { this.bias = null; this.lastFrame = null; }
  constructor() { this.reset(); }
  sample(frame, profile) {
    const minimum = profile.biasMin ?? 0.01;
    if (this.bias === null) this.bias = minimum;
    if (this.lastFrame !== null) this.bias = Math.max(minimum, this.bias - Math.max(0, frame - this.lastFrame - profile.repeatFrames) * (profile.biasRecovery ?? 0.005));
    const chance = this.bias;
    this.bias = Math.min(0.3, this.bias + (profile.biasStep ?? 0.01)); this.lastFrame = frame;
    return chance;
  }
}
