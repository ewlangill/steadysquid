import { random01 } from './random.js?v=98ca43af8df8e2a9';
export function generateLayout(seed, count = 5, radius = 0.32) {
  const points = [];
  for (let attempt = 0; attempt < 512 && points.length < count; attempt++) {
    const depth = 6.5 + random01(seed, attempt * 3) * 5.5;
    const p = { x: (random01(seed, attempt * 3 + 1) - 0.5) * 0.86 * depth,
      y: 0.8 + random01(seed, attempt * 3 + 2) * 2.3, z: -depth };
    const yaw = Math.atan2(p.x, depth), pitch = Math.atan2(p.y - 1.6, depth), angle = Math.asin(radius / depth);
    if (points.every(q => Math.hypot(yaw - Math.atan2(q.x, -q.z), pitch - Math.atan2(q.y - 1.6, -q.z)) > angle + Math.asin(radius / -q.z) + 0.045)) points.push(p);
  }
  if (points.length !== count) return Array.from({ length: count }, (_, i) => {
    const depth = 8 + random01(seed, i + 9000) * 3;
    return { x: (i - (count - 1) / 2) * 0.21 * depth, y: 1.4 + (i % 2) * 0.7, z: -depth };
  });
  return points;
}
