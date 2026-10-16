export const ROUTINES = {
  transfer: { label: '04 / Burst transfer', title: 'Burst transfer', hint: 'Targets stay in place. Land four hits to pop one, then aim at another target while the burst continues.' },
  smooth: { label: '01 / Steady stream', title: 'Steady stream', hint: 'Track the moving targets while charging and firing. Each target takes four hits.' },
  reactive: { label: '02 / Direction changes', title: 'Direction changes', hint: 'Track targets as they move back and forth. Follow each change of direction. Each target takes four hits.' },
  acquire: { label: '03 / Acquire + hold', title: 'Acquire + hold', hint: 'Aim at the target with the blue outline for at least 0.2 seconds. The ring shrinks until the selected target changes, every four seconds at 1× speed. All targets can be hit.' },
};
const random = (seed, index) => {
  let n = (seed ^ Math.imul(index + 1, 0x9e3779b9)) >>> 0;
  n = Math.imul(n ^ (n >>> 16), 0x21f0aaad); n = Math.imul(n ^ (n >>> 15), 0x735a2d97);
  return ((n ^ (n >>> 15)) >>> 0) / 4294967296;
};
export function drillTarget(routine, time, speed = 1, seed = 1) {
  const t = Math.max(0, time) * speed;
  if (routine === 'transfer') return { x: 0, y: 1.6, z: -8, id: 0 };
  if (routine === 'reactive') {
    const step = Math.floor(t / 1.15), f = (t / 1.15) - step;
    const point = i => ({ x: (i % 2 ? 1 : -1) * (0.8 + random(seed, i * 2) * 2.2), y: 1.3 + random(seed, i * 2 + 1) * 0.9 });
    const a = point(step), b = point(step + 1);
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, z: -8, id: 0 };
  }
  if (routine === 'acquire') {
    const id = Math.floor(t / 4), local = t % 4;
    return { x: (id % 2 ? 1 : -1) * (1.2 + random(seed, id * 2) * 1.4) + Math.sin(local * 0.8) * 0.25,
      y: 1.1 + random(seed, id * 2 + 1) * 1.2, z: -8, id };
  }
  const phase = random(seed, 0) * Math.PI * 2;
  return { x: Math.sin(t * 0.65 + phase) * 3, y: 1.6 + Math.sin(t * 0.31 + phase) * 0.25, z: -8, id: 0 };
}
export class Acquisition {
  constructor() { this.reset(); }
  reset() { this.id = null; this.attempts = 0; this.times = []; this.elapsed = 0; this.dwell = 0; this.acquired = false; }
  observe(id, dt, onTarget) {
    if (!Number.isFinite(dt) || dt <= 0) return;
    if (this.id !== id) { this.id = id; this.attempts++; this.elapsed = 0; this.dwell = 0; this.acquired = false; }
    this.elapsed += dt; this.dwell = onTarget ? this.dwell + dt : 0;
    if (!this.acquired && this.dwell >= 0.2 - 1e-9) { this.acquired = true; this.times.push(this.elapsed); }
  }
  get mean() { return this.times.length ? this.times.reduce((a, b) => a + b, 0) / this.times.length : null; }
}

// Shared clock for target selection and its shrinking countdown ring.
export function targetCue(time, speed = 1) {
  const cycles = Math.max(0, time) * speed / 4;
  const slot = Math.floor(cycles);
  return { slot, remaining: 1 - (cycles - slot) };
}
