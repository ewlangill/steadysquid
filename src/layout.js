import { random01 } from './random.js?v=d9185c8df1f1c09e';
export const DEFAULT_ARC_DEGREES = 120;
export function generateLayout(seed, count = 5, radius = 0.32, arcDegrees = DEFAULT_ARC_DEGREES) {
  const arc = Math.max(20, Math.min(180, Number.isFinite(arcDegrees) ? arcDegrees : DEFAULT_ARC_DEGREES)) * Math.PI / 180;
  const points = [], step = count > 1 ? arc / (count - 1) : 0;
  for (let i = 0; i < count; i++) {
    let best = null, bestSeparation = -Infinity;
    for (let attempt = 0; attempt < 128; attempt++) {
      const n = i * 512 + attempt * 3;
      const distance = 6.5 + random01(seed, n) * 5.5;
      const yaw = count === 1 ? 0 : -arc / 2 + i * step + (i === 0 || i === count - 1 ? 0 : (random01(seed, n + 1) - 0.5) * step * 0.36);
      const y = 0.8 + random01(seed, n + 2) * 2.3;
      const p = { x: Math.sin(yaw) * distance, y, z: -Math.cos(yaw) * distance, yaw, distance,
        motionLimit: i === 0 || i === count - 1 ? 0 : step * 0.18 };
      const pitch = Math.atan2(y - 1.6, distance), angle = Math.asin(radius / distance);
      const separation = points.length ? Math.min(...points.map(q => Math.hypot(yaw - q.yaw, pitch - Math.atan2(q.y - 1.6, q.distance)) - angle - Math.asin(radius / q.distance))) : Infinity;
      if (separation > bestSeparation) { best = p; bestSeparation = separation; }
      if (separation > 0.01) break;
    }
    points.push(best);
  }
  return points;
}
export function targetPosition(base, motion) {
  const offset = Math.max(-base.motionLimit, Math.min(base.motionLimit, Math.atan2(motion.x * 0.18, base.distance)));
  const yaw = base.yaw + offset;
  return { x: Math.sin(yaw) * base.distance, y: base.y + (motion.y - 1.6) * 0.5, z: -Math.cos(yaw) * base.distance };
}
