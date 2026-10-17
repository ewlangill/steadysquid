import { random01 } from './random.js?v=6e85ad94e5ae793e';
// Original tracking motion, not extracted Splatoon player physics.
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const ramp = 0.12;
function ease(u) {
  if (u < ramp) return u * u / (2 * ramp * (1 - ramp));
  if (u > 1 - ramp) return 1 - (1 - u) ** 2 / (2 * ramp * (1 - ramp));
  return (u - ramp / 2) / (1 - ramp);
}
export function createChasePath(seed = 1, arcDegrees = 120) {
  const halfArc = clamp(Number.isFinite(arcDegrees) ? arcDegrees : 120, 20, 180) * Math.PI / 360;
  const segments = [];
  let from = { yaw: 0, y: 1.5, distance: 8 }, at = 0;
  for (let i = 0; at < 125; i++) {
    const rand = n => random01(seed, i * 8 + n);
    const sign = from.yaw > 0 ? -1 : from.yaw < 0 ? 1 : rand(0) < 0.5 ? -1 : 1;
    const feint = i % 4 === 2;
    const yaw = feint ? clamp(from.yaw + sign * halfArc * (0.12 + rand(1) * 0.25), -halfArc, halfArc) : sign * halfArc * (i % 5 === 0 ? 1 : 0.35 + rand(1) * 0.65);
    const to = { yaw, y: 0.95 + rand(2) * 0.8, distance: 6.5 + rand(3) * 3 };
    // Wider travel takes longer; spread cannot create an untrackable teleport.
    const duration = Math.max(0.5 + rand(4) * 0.65, Math.abs(yaw - from.yaw) / (1.05 * (1 - ramp)), Math.abs(to.distance - from.distance) / 2.5);
    segments.push({ from, to, start: at, end: at + duration, hop: rand(5) < 0.25 ? 0.22 : 0 });
    at += duration; from = to;
  }
  return segments;
}
export function chasePosition(path, time, speed = 1) {
  const t = clamp((Number.isFinite(time) ? time : 0) * clamp(speed, 0.4, 2), 0, path.at(-1).end);
  const segment = path.find(s => t <= s.end) || path.at(-1);
  const u = clamp((t - segment.start) / (segment.end - segment.start), 0, 1), f = ease(u);
  const yaw = segment.from.yaw + (segment.to.yaw - segment.from.yaw) * f;
  const distance = segment.from.distance + (segment.to.distance - segment.from.distance) * f;
  return { x: Math.sin(yaw) * distance, y: segment.from.y + (segment.to.y - segment.from.y) * f + segment.hop * Math.sin(Math.PI * u) ** 2, z: -Math.cos(yaw) * distance };
}
export const targetEnabled = (routine, index) => routine !== 'chase' || index === 0;
