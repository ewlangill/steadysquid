export const WEAPONS = Object.freeze({
  splattershotpro: Object.freeze({ name: 'Splattershot Pro', family: 'shooter', repeatFrames: 8, startupFrames: 3, projectileSpeed: 3.833333, damage: 45, hits: 3, yaw: 2.5, pitch: 2.5, speedRandom: 0, biasMin: 0.01, biasStep: 0.01, biasRecovery: 0.005,
    summary: 'Hold to fire. 8 f per shot · 45 max damage · three full-damage hits. 2.5° standing limit. Startup is a provisional 3 f. Center-weighted spread and recovery are approximations; falloff is not simulated.' }),
  nzap85: Object.freeze({ name: "N-ZAP '85", family: 'shooter', biasMin: 0.01, biasStep: 0.005, biasRecovery: 0.005, repeatFrames: 5, startupFrames: 3, projectileSpeed: 2.2, damage: 30, hits: 4, yaw: 4.75, pitch: 4.75, speedRandom: 0,
    summary: 'Hold to fire. 5 f per shot · 30 max damage · four full-damage hits per target. Startup is a provisional 3 f. Centered opening spread, sustained-fire widening and recovery are approximate; damage falloff is not simulated.' }),
  heavy: Object.freeze({ name: 'Heavy Splatling', family: 'splatling', damage: 30, hits: 4, yaw: 3.3, pitch: 1.6, speedRandom: 0.12,
    summary: '48 / 72 f charge · 80 / 160 f burst · 4 f per shot. 30 max damage. Spread and travel are approximate; damage falloff is not simulated.' }),
  splattershot: Object.freeze({ name: 'Splattershot', family: 'shooter', biasMin: 0.01, biasStep: 0.01, biasRecovery: 0.015, repeatFrames: 6, startupFrames: 3, projectileSpeed: 2.266, damage: 36, hits: 3, yaw: 4.86, pitch: 4.86, speedRandom: 0,
    summary: 'Hold to fire. 36 max damage · three full-damage hits per target. Provisional timing: 6 f per shot, 3 f startup. Centered opening spread, sustained-fire widening and recovery are approximate; damage falloff is not simulated.' }),
});
export function routineHint(routine, weapon) {
  const hits = weapon.hits === 3 ? 'three' : 'four';
  if (routine === 'chase') return `Follow the single target through short strafes and quick reversals. Spread sets left/right travel; speed sets pace. Land ${hits} full-damage hits to pop it. It returns shortly after each pop.`;
  if (routine === 'transfer') return `Targets stay in place. Land ${hits} hits to pop one, then aim at another target while firing.`;
  if (routine === 'reactive') return `Track targets as they move back and forth. Follow each change of direction. Each target takes ${hits} full-damage hits.`;
  if (routine === 'acquire') return 'Aim at the target with the blue outline for at least 0.2 seconds. The selected target changes every four seconds at 1× speed. All targets can be hit.';
  return weapon.family === 'shooter' ? `Hold the fire control and track the moving targets. Each target takes ${hits} full-damage hits.` : `Track the moving targets while charging and firing. Each target takes ${hits} hits.`;
}
