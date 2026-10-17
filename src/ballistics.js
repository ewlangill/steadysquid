// Explicit v11.3 bounds/times; drag phases and interpolation are original approximations.
const profiles = {
  heavy: { straightFrames: 8, brakeSpeed: 1.5105, minDamage: 15, reduceStart: 11, reduceEnd: 19 },
  mini: { straightFrames: 8, brakeSpeed: 1.105, minDamage: 16, reduceStart: 11, reduceEnd: 19 },
  splattershot: { straightFrames: 4, brakeSpeed: 1.493, minDamage: 18, reduceStart: 8, reduceEnd: 40 },
  nzap85: { straightFrames: 4, brakeSpeed: 1.4495, minDamage: 15, reduceStart: 8, reduceEnd: 24 },
  splattershotpro: { straightFrames: 3, brakeSpeed: 2.2698, minDamage: 22.5, reduceStart: 7, reduceEnd: 23 },
};
export function projectileSpec(id, charge = 1) {
  if (id === 'splatcharger') {
    const t = Math.max(0, Math.min(1, (charge * 60 - 8) / 52));
    return { straightFrames: Infinity, gravity: 0, brakeDrag: 1, freeDrag: 1, brakeSpeed: Infinity,
      maxDistance: 9.033 + t * (24.037 - 9.033), pierce: charge >= 1, radius: 0.125, charger: true,
      damage: charge >= 1 ? 160 : 40 + t * 40 };
  }
  return { ...profiles[id], gravity: 0.016, brakeDrag: 0.64, freeDrag: 0.98, freeSpeed: 0.12 };
}
export function damageAtAge(maximum, age, spec) {
  if (!Number.isFinite(spec?.reduceStart) || !Number.isFinite(spec?.reduceEnd)) return maximum;
  const t = Math.max(0, Math.min(1, (age - spec.reduceStart) / (spec.reduceEnd - spec.reduceStart)));
  return Math.round((maximum + (spec.minDamage - maximum) * t) * 10) / 10;
}
export function advanceVelocity(drop) {
  const p = drop.spec;
  if (drop.age < p.straightFrames) return;
  if (drop.age === p.straightFrames) {
    const speed = Math.hypot(...drop.velocity), factor = Math.min(1, p.brakeSpeed / speed);
    drop.velocity = drop.velocity.map(v => v * factor);
  }
  if (Math.hypot(...drop.velocity) <= (p.freeSpeed ?? 0)) drop.freeFlight = true;
  const drag = drop.freeFlight ? p.freeDrag : p.brakeDrag;
  drop.velocity = drop.velocity.map(v => v * drag);
  drop.velocity[1] -= p.gravity;
}
