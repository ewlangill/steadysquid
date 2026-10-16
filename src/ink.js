import { random01 } from './random.js?v=8b31b167417c27ac';
// Original approximation informed by each preset's spread limits; game RNG/bias is not reproduced.
export function shotSpread(seed, serial, burstShot = serial, profile = { yaw: 3.3, pitch: 1.6, speedRandom: 0.12 }) {
  const n = serial * 4, wide = random01(seed, n) < Math.min(0.3, 0.1 + burstShot * 0.02);
  const radius = Math.sqrt(random01(seed, n + 1)) * (profile.family === 'shooter' || wide ? 1 : 0.4), angle = random01(seed, n + 2) * Math.PI * 2;
  return { yaw: Math.cos(angle) * radius * profile.yaw * Math.PI / 180, pitch: Math.sin(angle) * radius * profile.pitch * Math.PI / 180,
    speed: 1 + (random01(seed, n + 3) * 2 - 1) * profile.speedRandom };
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
  launch(origin, direction, speed = 2.1, damage = 30) {
    if (this.drops.length >= this.limit) this.drops.shift();
    this.drops.push({ id: this.serial++, position: [...origin], previous: [...origin], velocity: direction.map(v => v * speed), age: 0, damage });
  }
  step(targets, radius) {
    const impacts = [], survivors = [];
    this.splashes = this.splashes.filter(s => ++s.age < s.life);
    for (const drop of this.drops) {
      const a = drop.position, b = a.map((v, i) => v + drop.velocity[i]); drop.previous = [...a]; drop.age++;
      let best = null;
      const offer = hit => { if (hit.t >= 0 && hit.t <= 1 && (!best || hit.t < best.t)) best = hit; };
      targets.forEach((target, index) => { if (target.alive) { const t = segmentSphere(a, b, target.position, radius + 0.035); if (t !== null) offer({ t, index }); } });
      if (b[1] <= 0.03 && a[1] > 0.03) offer({ t: (0.03 - a[1]) / (b[1] - a[1]), index: -1, normal: [0, 1, 0] });
      if (b[2] <= -14.85 && a[2] > -14.85) offer({ t: (-14.85 - a[2]) / (b[2] - a[2]), index: -1, normal: [0, 0, 1] });
      if (best) {
        const point = a.map((v, i) => v + (b[i] - v) * best.t);
        const normal = best.normal || point.map((v, i) => v - targets[best.index].position[i]);
        const length = Math.hypot(...normal) || 1;
        this.splashes.push({ point, normal: normal.map(v => v / length), age: 0, life: best.index < 0 ? 240 : 10, id: drop.id });
        if (this.splashes.length > 96) this.splashes.shift();
        impacts.push({ index: best.index, point, id: drop.id, damage: drop.damage }); continue;
      }
      drop.position = b;
      if (drop.age >= 8) { drop.velocity[0] *= 0.985; drop.velocity[2] *= 0.985; drop.velocity[1] -= 0.025; }
      if (drop.age < 90 && Math.abs(b[0]) < 25 && b[1] > -2 && b[1] < 20) survivors.push(drop);
    }
    this.drops = survivors; return impacts;
  }
}
