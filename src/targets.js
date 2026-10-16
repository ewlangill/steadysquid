export const HEAVY = Object.freeze({ fps: 60, firstChargeFrames: 48, fullChargeFrames: 72, firstBurstFrames: 80, fullBurstFrames: 160, shotIntervalFrames: 4, damage: 30 });
export class TargetField {
  constructor(count = 5) { this.count = count; this.reset(); }
  reset() { this.pops = 0; this.lastPopFrames = null; this.targets = Array.from({ length: this.count }, () => ({ hp: 100, generation: 0, firstHit: null, poppedAt: null, lastHit: -100 })); }
  tick(frame) { for (const target of this.targets) if (target.hp === 0 && frame >= target.poppedAt + 90) { target.hp = 100; target.generation++; target.firstHit = null; target.poppedAt = null; target.lastHit = -100; } }
  hit(index, frame, damage = HEAVY.damage) {
    const target = this.targets[index];
    if (!target || target.hp <= 0 || !Number.isFinite(damage) || damage <= 0) return false;
    if (target.firstHit === null) target.firstHit = frame;
    target.lastHit = frame; target.hp = Math.max(0, target.hp - damage);
    if (target.hp === 0) { target.poppedAt = frame; this.lastPopFrames = frame - target.firstHit; this.pops++; return true; }
    return false;
  }
}
