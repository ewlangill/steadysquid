// Original visual timing only. These dimensions never define damage/collision radii.
export function blastVisual(age, life, distance) {
  if (![age, life, distance].every(Number.isFinite) || life <= 0 || age < 0 || age >= life || distance < 0.45) return null;
  const t = age / life, ease = 1 - (1 - t) ** 3;
  // Cap apparent radius near the camera, keeping the central aiming area readable.
  const size = Math.min(0.9, distance * 0.075);
  return { radius: size * (0.18 + 0.82 * ease), bead: size * 0.11 * (1 - t) ** 1.5,
    opacity: (1 - t) ** 2, rotation: t * 0.35 };
}
