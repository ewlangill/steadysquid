export const WEAPONS = Object.freeze({
  nzap85: Object.freeze({ name: "N-ZAP '85", family: 'shooter', repeatFrames: 5, startupFrames: 3, projectileSpeed: 2.2, damage: 30, hits: 4, yaw: 4.75, pitch: 4.75, speedRandom: 0,
    summary: 'Hold to fire. 5 f per shot · 30 max damage · four full-damage hits per target. Startup is a provisional 3 f. Standing spread and travel are approximate; damage falloff is not simulated.' }),
  heavy: Object.freeze({ name: 'Heavy Splatling', family: 'splatling', damage: 30, hits: 4, yaw: 3.3, pitch: 1.6, speedRandom: 0.12,
    summary: '48 / 72 f charge · 80 / 160 f burst · 4 f per shot. 30 max damage. Spread and travel are approximate; damage falloff is not simulated.' }),
  splattershot: Object.freeze({ name: 'Splattershot', family: 'shooter', repeatFrames: 6, startupFrames: 3, projectileSpeed: 2.266, damage: 36, hits: 3, yaw: 4.86, pitch: 4.86, speedRandom: 0,
    summary: 'Hold to fire. 36 max damage · three full-damage hits per target. Provisional timing: 6 f per shot, 3 f startup. Standing spread and travel are approximate; damage falloff is not simulated.' }),
});
export function routineHint(routine, weapon) {
  const hits = weapon.hits === 3 ? 'three' : 'four';
  if (routine === 'transfer') return `Targets stay in place. Land ${hits} hits to pop one, then aim at another target while firing.`;
  if (routine === 'reactive') return `Track targets as they move back and forth. Follow each change of direction. Each target takes ${hits} full-damage hits.`;
  if (routine === 'acquire') return 'Aim at the target with the blue outline for at least 0.2 seconds. The selected target changes every four seconds at 1× speed. All targets can be hit.';
  return weapon.family === 'shooter' ? `Hold the fire control and track the moving targets. Each target takes ${hits} full-damage hits.` : `Track the moving targets while charging and firing. Each target takes ${hits} hits.`;
}
