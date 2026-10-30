export const WEAPONS = Object.freeze({
  luna: Object.freeze({ name: 'Luna Blaster', family: 'blaster', repeatFrames: 40, startupFrames: 10, projectileSpeed: 0.87, damage: 125, hits: 1, yaw: 0, pitch: 0, speedRandom: 0,
    summary: '125 direct · 50–70 blast · 40 f per shot · 11 f fuse. Standing preview: startup, blast geometry, braking and scene scale remain approximate.' }),
  rapid: Object.freeze({ name: 'Rapid Blaster', family: 'blaster', repeatFrames: 35, startupFrames: 8, projectileSpeed: 1.2, damage: 85, hits: 2, yaw: 0, pitch: 0, speedRandom: 0,
    hint: 'Hold to fire. Two direct hits, three blasts, or one of each pop a target. Aim beside a target to practice blasts.',
    summary: '85 direct · 35 blast · 35 f per shot · 15 f fuse. Standing preview: startup, blast geometry, flight and scale are approximate; MoveLength is not mapped.' }),
  blaster: Object.freeze({ name: 'Blaster', family: 'blaster', repeatFrames: 50, startupFrames: 10, projectileSpeed: 0.945, damage: 125, hits: 1, yaw: 0, pitch: 0, speedRandom: 0,
    summary: 'Hold to fire. 125 direct · 50–70 blast · 50 f per shot. 13 f fuse follows a community report. Startup, blast geometry, braking and scene scale are previews; standing only.' }),
  gal52: Object.freeze({ name: '.52 Gal', family: 'shooter', repeatFrames: 9, startupFrames: 3, projectileSpeed: 3.06, damage: 52, hits: 2, yaw: 6, pitch: 6, speedRandom: 0, biasMin: 0.02, biasStep: 0.03, biasRecovery: 0.015,
    summary: 'Hold to fire. 9 f per shot · 52 max damage · two full-damage hits. Flight-time damage falls toward 30. Startup is a provisional 3 f; standing spread, braking and scene scale remain approximations.' }),
  splatcharger: Object.freeze({ name: 'Splat Charger', family: 'charger', fullChargeFrames: 60, minChargeFrames: 8, fullBurstFrames: 1, damage: 160, hits: 1, minProjectileSpeed: 2.4, maxProjectileSpeed: 4.8, yaw: 0, pitch: 0, speedRandom: 0,
    summary: 'Hold to charge; release one shot. 60 f full charge · 160 full damage · one-hit pop. Partial shots: 40–80 damage. Charge timing follows community documentation; charge scaling, recovery and scene range are previews. No swim charge storage.' }),
  mini: Object.freeze({ name: 'Mini Splatling', family: 'splatling', firstChargeFrames: 18, fullChargeFrames: 27, firstBurstFrames: 42, fullBurstFrames: 84, shotIntervalFrames: 4, minProjectileSpeed: 1.05, maxProjectileSpeed: 1.5, damage: 32, hits: 4, yaw: 4, pitch: 1.2, speedRandom: 0.1,
    summary: '18 / 27 f charge · 42 / 84 f burst · 4 f per shot. 32 max damage · four full-damage hits. Flight-time damage falloff is modeled. Spread and trajectory remain approximate.' }),
  splattershotpro: Object.freeze({ name: 'Splattershot Pro', family: 'shooter', repeatFrames: 8, startupFrames: 3, projectileSpeed: 3.833333, damage: 45, hits: 3, yaw: 2.5, pitch: 2.5, speedRandom: 0, biasMin: 0.01, biasStep: 0.01, biasRecovery: 0.005,
    summary: 'Hold to fire. 8 f per shot · 45 max damage · three full-damage hits. 2.5° standing limit. Startup is a provisional 3 f. Center-weighted spread and recovery are approximations; flight-time damage falloff is modeled.' }),
  nzap85: Object.freeze({ name: "N-ZAP '85", family: 'shooter', biasMin: 0.01, biasStep: 0.005, biasRecovery: 0.005, repeatFrames: 5, startupFrames: 3, projectileSpeed: 2.2, damage: 30, hits: 4, yaw: 4.75, pitch: 4.75, speedRandom: 0,
    summary: 'Hold to fire. 5 f per shot · 30 max damage · four full-damage hits per target. Startup is a provisional 3 f. Centered opening spread, sustained-fire widening and recovery are approximate; Flight-time damage falloff is modeled; drop and spread remain approximate.' }),
  heavy: Object.freeze({ name: 'Heavy Splatling', family: 'splatling', firstChargeFrames: 48, fullChargeFrames: 72, firstBurstFrames: 80, fullBurstFrames: 160, shotIntervalFrames: 4, minProjectileSpeed: 1.05, maxProjectileSpeed: 2.1, damage: 30, hits: 4, yaw: 3.3, pitch: 1.6, speedRandom: 0.12, speedRandomBias: 0.2, angularModel: 'splatling-power', yawBias: 0.3, pitchBias: 0.4,
    summary: '48 / 72 f charge · 80 / 160 f burst · 4 f per shot. 30 max damage. Separate braking and falling phases; flight-time damage falloff. Phase defaults and steady per-axis spread follow community research; game scale and RNG remain unverified.' }),
  splattershot: Object.freeze({ name: 'Splattershot', family: 'shooter', biasMin: 0.01, biasStep: 0.01, biasRecovery: 0.015, repeatFrames: 6, startupFrames: 3, projectileSpeed: 2.266, damage: 36, hits: 3, yaw: 4.86, pitch: 4.86, speedRandom: 0,
    summary: 'Hold to fire. 36 max damage · three full-damage hits per target. Provisional timing: 6 f per shot, 3 f startup. Centered opening spread, sustained-fire widening and recovery are approximate; Flight-time damage falloff is modeled; drop and spread remain approximate.' }),
});
// Scene-unit launch speed only; braking, gravity and spread remain trainer approximations.
export function projectileSpeed(profile, charge = 0) {
  if (['shooter', 'blaster'].includes(profile.family)) return profile.projectileSpeed;
  if (profile.family === 'charger') { const t = Math.max(0, Math.min(1, (charge * 60 - 8) / 52)); return 2.4 + 2.4 * t; }
  return profile.minProjectileSpeed + Math.min(1, Math.max(0, charge) * 2) * (profile.maxProjectileSpeed - profile.minProjectileSpeed);
}
export function routineHint(routine, weapon) {
  if (weapon.family === 'blaster') return weapon.hint ?? 'Hold to fire. One direct hit or two blasts pop a target. Aim beside a target to practice blast hits.';
  if (weapon.family === 'charger') return routine === 'acquire' ? 'Aim at the blue-outlined target for at least 0.2 seconds. Hold to charge and release a single shot. A full charge pops a target in one hit.' : 'Hold to charge, track a target, then release one shot. A full charge pops a target in one hit; partial charges need more hits.';
  const hits = ({ 1: 'one', 2: 'two', 3: 'three', 4: 'four' })[weapon.hits] ?? String(weapon.hits);
  if (routine === 'chase') return `Follow the single target through short strafes and quick reversals. Spread sets left/right travel; speed sets pace. Land ${hits} full-damage hits to pop it. It returns shortly after each pop.`;
  if (routine === 'transfer') return `Targets stay in place. Land ${hits} hits to pop one, then aim at another target while firing.`;
  if (routine === 'reactive') return `Track targets as they move back and forth. Follow each change of direction. Each target takes ${hits} full-damage hits.`;
  if (routine === 'acquire') return 'Aim at the target with the blue outline for at least 0.2 seconds. The selected target changes every four seconds at 1× speed. All targets can be hit.';
  return weapon.family === 'shooter' ? `Hold the fire control and track the moving targets. Each target takes ${hits} full-damage hits.` : `Track the moving targets while charging and firing. Each target takes ${hits} hits.`;
}
