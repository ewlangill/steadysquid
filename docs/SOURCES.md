# Sources and provenance

The protocol and implementation design are based on inspected source, not a hardware test:

- HOJA3 app pinned at `94096f7192f5ed4c17d62674853cbf9d1ef7a789`.[^app]
- HOJA firmware library pinned at `4ec959191005384076e3815990549da1e8a4a5a8`.[^firmware]
- AimForge tracking/scoring reference pinned at `aee2391e2e6aa78ce0afea9aab1e8179a2bdb10d`.[^trainer]

Do not claim to implement the exact Splatoon engine. Model integration is separately authorized in BUILD_PLAN.md and requires provenance and usage-term review. Consult each dependency's license before reuse; no top-level HOJA3 license was found in the inspected snapshot.

[^app]: Official [report decoder](https://github.com/HandHeldLegend/hhl-gamepad-config/blob/94096f7192f5ed4c17d62674853cbf9d1ef7a789/src/device/reports.js), [frame gate](https://github.com/HandHeldLegend/hhl-gamepad-config/blob/94096f7192f5ed4c17d62674853cbf9d1ef7a789/src/ui/frame-gate.js), and [section pattern](https://github.com/HandHeldLegend/hhl-gamepad-config/blob/94096f7192f5ed4c17d62674853cbf9d1ef7a789/docs/SECTIONS.md).
[^firmware]: Official [WebUSB stream](https://github.com/HandHeldLegend/HOJA-LIB-RP2040/blob/4ec959191005384076e3815990549da1e8a4a5a8/src/usb/webusb.c) and [gyro processing](https://github.com/HandHeldLegend/HOJA-LIB-RP2040/blob/4ec959191005384076e3815990549da1e8a4a5a8/src/input/imu.c).
[^trainer]: Community [AimForge tracking implementation](https://github.com/pfeilbr/aim-trainer/blob/aee2391e2e6aa78ce0afea9aab1e8179a2bdb10d/src/scenarios.js). Code inspection only, no gameplay benefit verified.

The original trainer USB adapter additionally uses the pinned official [transport protocol](https://github.com/HandHeldLegend/hhl-gamepad-config/blob/94096f7192f5ed4c17d62674853cbf9d1ef7a789/src/device/hoja-device.js) and [generated mapper enum](https://github.com/HandHeldLegend/hhl-gamepad-config/blob/94096f7192f5ed4c17d62674853cbf9d1ef7a789/src/device/generated/fw-layout.js). Protocol facts were inspected directly; the upstream application implementation was not copied. The trainer's camera normalization and local-axis response are provisional design choices pending physical calibration, not a verified Splatoon model.

Heavy Splatling timing is pinned to [Leanny/splat3 commit 7280ff9](https://github.com/Leanny/splat3/blob/7280ff9cde8bb1c5dcef46c700c326471584d2e6/data/parameter/1130/weapon/WeaponSpinnerStandard.game__GameParameterTable.json), version 11.3. Directly inspected fields: `RepeatFrame: 4`, `ChargeFrame_First: 48`, `ChargeFrame_Second: 72`, `MaxShootingFrame_First: 80`, `MaxShootingFrame_Second: 160`, `DamageParam.ValueMax: 300` (30 displayed HP). Community-extracted source, not an official Nintendo specification. Four maximum-damage hits against a trainer 100-HP target therefore span `(4 - 1) * 4 = 12` frames from first hit to fourth. This derived interval excludes projectile travel, input/startup and network/display latency.

Ink spread uses the same directly inspected record's `Stand_DegSwerve: 3.3`, `PitchDegSwerve: 1.6`, `Stand_DegBiasMin/Max: 0.1/0.3`, `SpawnSpeedRandomRate: 0.12` and `GoStraightToBrakeStateFrame: 8` as design references. Cone distribution, within-burst widening, render units, braking/gravity and splat shapes are original approximations; no exact Nintendo RNG or trajectory reconstruction is claimed. Randomized target layouts and queued ZR recharging are trainer features requested by the user.

## Splattershot preview — October 16, 2026

Inspected the same pinned v11.3 extraction's `WeaponShooterNormal` record.[^splattershot] Direct fields: `DamageParam.ValueMax: 360` (36 displayed HP), `ValueMin: 180`, `ReduceStartFrame: 8`, `ReduceEndFrame: 40`, `WeaponParam.Stand_DegSwerve: 4.86`, `Stand_DegBiasMin: 0.01`, and `MoveParam.SpawnSpeed: 2.266`. Three maximum-damage impacts exceed the trainer target's 100 HP. Download SHA-256: `dfca9f45fd0df3b6afab8f6ec0e47034912f3a6fc411936b9fd7257fe85c4cb9`. The raw record was inspected locally and is not vendored.

Evidence limit: community-extracted data, not an official Nintendo specification; extraction/schema defaults were not independently verified. The record omits `RepeatFrame` and startup, so the preview's 6-frame repeat and 3-frame startup are explicitly provisional, not asserted as sourced timing. Symmetric vertical spread, uniform distribution and render-unit speed are original approximations. Shooter damage currently stays at maximum; extracted reduction frames/minimum damage are not implemented. No wiki or forum timing claim was used as verification. Next: resolve inherited defaults from an inspectable extraction/schema, then revise timing and add a provenance check before treating the preset as verified.

[^splattershot]: [Pinned Splattershot parameter record](https://github.com/Leanny/splat3/blob/7280ff9cde8bb1c5dcef46c700c326471584d2e6/data/parameter/1130/weapon/WeaponShooterNormal.game__GameParameterTable.json).

## N-ZAP '85 preview — October 16, 2026

Pinned v11.3 `WeaponShooterQuickMiddle` explicitly supplies `RepeatFrame: 5`, `DamageParam.ValueMax: 300` (30 HP), `Stand_DegSwerve: 4.75`, and `MoveParam.SpawnSpeed: 2.2`.[^nzap] The record's SHA-256 is `2cb076ebd75165b73dc7a950380838c773b8dd5bb5b85ae70e7204b1dc15f257`. These are community-extracted parameter facts, not Nintendo documentation or a physical test. Four maximum-damage emissions at five-frame spacing span 15 frames; flight/misses can change impact spacing.

The preview uses that explicit cadence/damage/cone limit and a 2.2 scene-unit speed reference. Its three-frame startup remains a provisional trainer setting. Symmetric vertical spread, uniform random distribution and scene units remain approximations; jump/movement effects, bias, falloff and ink consumption are not reproduced. Existing Splattershot timing remains provisional.

Additional research found a first-person community parameter-analysis table reporting a six-frame shooter default, but it contains uncertain interpretations and no independently inspected schema extraction; treat it as lower-trust corroboration only, not verification of the Splattershot startup/defaults.[^default-notes]

[^nzap]: [Pinned N-ZAP extraction](https://github.com/Leanny/splat3/blob/7280ff9cde8bb1c5dcef46c700c326471584d2e6/data/parameter/1130/weapon/WeaponShooterQuickMiddle.game__GameParameterTable.json). The [N-ZAP parameter display](https://sendou.ink/params/n-zap-85) identifies this five-frame, 30-damage, 4.75-degree profile; it credits the same Lean data, so it is not an independent extraction.
[^default-notes]: [XarrotD's parameter research notes](https://splatoonwiki.org/wiki/User:XarrotD/paramtable#Shooters), author-maintained community analysis with explicitly tentative interpretations. No code or tables were copied.
