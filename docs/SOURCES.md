# Sources and provenance

## Mini Splatling — October 16, 2026

The pinned v11.3 `WeaponSpinnerQuick` extraction explicitly supplies `ChargeFrame_First: 18`, `ChargeFrame_Second: 27`, `MaxShootingFrame_First: 42`, `MaxShootingFrame_Second: 84`, `RepeatFrame: 4`, and damage `ValueMax/ValueFullChargeMax: 320` (32 displayed HP).[^mini-data] These agree with Inkipedia's Splatoon 3 section, which states, “It takes 18 frames to charge the first circle”.[^mini-wiki] SHA-256 of the inspected raw record: `36d1af6547a876ed4ce0d1ecd6daa3a1f08290636c2ae95f099e79b06872a56f`. Both are community evidence, not an official Nintendo specification or hardware/game measurement; the wiki references the same parameter database and is not independent verification.

The trainer uses these no-gear, grounded charge/burst timings and 32 maximum damage. Four impacts against a 100-HP target span 12 frames from first to fourth, excluding flight. Charge rings and discharge meter normalize to Mini's 84-frame full burst. Queued ZR recharging remains a trainer control feature. The record's 4-degree standing / 1.2-degree pitch bounds, 0.1 speed-randomization reference and 1.05-to-1.5 charge-dependent launch-speed endpoints inform the original approximation. Exact cone distribution, braking/gravity, render scale, startup/post-delay, jumping, movement, ink consumption and damage falloff are not reproduced. Heavy retains its previous parameters. No model is bundled in this preset.

[^mini-data]: [Pinned Mini Splatling parameter extraction](https://github.com/Leanny/splat3/blob/7280ff9cde8bb1c5dcef46c700c326471584d2e6/data/parameter/1130/weapon/WeaponSpinnerQuick.game__GameParameterTable.json).
[^mini-wiki]: Community [Inkipedia: Mini Splatling, Splatoon 3](https://splatoonwiki.org/wiki/Mini_Splatling#Splatoon_3).

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

## chase the moo — October 16, 2026

Original single-target training path, inspired by the community description of sub strafing as a technique to “change directions fast when swimming in the ink.”[^substrafe] This reference is community-authored and lower-trust than inspected game parameters. The trainer does not reproduce extracted player acceleration, swim form, gear modifiers or exact sub-strafe physics. Seeded waypoint distances, 12% acceleration/deceleration ramps, 1.05 rad/s angular speed ceiling at 1x, small height/depth changes and 18-frame target respawn are original practice settings. Spread controls yaw limits; wider travel gets longer legs to preserve the speed bound. Movement samples depend on simulation time rather than display refresh.

[^substrafe]: [Inkipedia Community Glossary — Sub strafing](https://splatoonwiki.org/wiki/Community_Glossary#Sub_strafing), inspected October 16, 2026. Movement background also checked against [Mobility](https://splatoonwiki.org/wiki/Mobility). No game-physics validation is claimed.

## Controller selection and original Switch Pro wired preview

Original code follows dekuNukem and contributors’ primary reverse-engineering notes, not Nintendo documentation: [USB handshake](https://github.com/dekuNukem/Nintendo_Switch_Reverse_Engineering/blob/master/USB-HID-Notes.md), [standard reports](https://github.com/dekuNukem/Nintendo_Switch_Reverse_Engineering/blob/master/bluetooth_hid_notes.md), [subcommands](https://github.com/dekuNukem/Nintendo_Switch_Reverse_Engineering/blob/master/bluetooth_hid_subcommands_notes.md), [sensor conversion](https://github.com/dekuNukem/Nintendo_Switch_Reverse_Engineering/blob/master/imu_sensor_notes.md) and [calibration layout](https://github.com/dekuNukem/Nintendo_Switch_Reverse_Engineering/blob/master/spi_flash_notes.md), inspected October 16, 2026. This community evidence is lower-trust than official device specifications and requires hardware validation. API behavior follows [Chrome WebHID documentation](https://developer.chrome.com/docs/capabilities/hid) and the [Gamepad standard](https://w3c.github.io/gamepad/).

The Switch Pro adapter uses VID/PID 057e/2009 and USB handshakes, reads factory/user sensor and right-stick calibration, enables IMU/report 0x30, and averages the three sensor samples per report. Gyro is converted with calibrated 936/(coefficient−offset), then integrated over bounded host report intervals. Packet timing/axis response is not claimed equivalent to Splatoon. Session-only Zero motion subtracts a stationary bias. No SPI writes, pairing changes, firmware operations, identifiers or sensor uploads are implemented. Close releases USB timeout suppression. Bluetooth and Switch 2 Pro are outside this preview. Generic Gamepad fallback requires standard mapping and offers sticks/buttons, not motion or universal WebUSB support.

## Shooter spread refinement and Splattershot Pro

The pinned v11.3 [Splattershot Pro extraction](https://github.com/Leanny/splat3/blob/7280ff9cde8bb1c5dcef46c700c326471584d2e6/data/parameter/1130/weapon/WeaponShooterExpert.game__GameParameterTable.json), SHA-256 `fe8613779062558495b4c03088a3986c995bf6c280e894fb5176eda0d6a0c1c3`, explicitly supplies RepeatFrame 8, ValueMax 450 (45 displayed HP), SpawnSpeed 3.833333, standing swerve 2.5°, bias minimum/Kf/decrease 0.01/0.01/0.005. N-ZAP’s bias minimum/Kf/decrease are 0.01/0.005/0.005; regular Splattershot’s are 0.01/0.01/0.015, verified by reading the pinned records. These are community extractions, not official specifications.

Replaced the erroneous uniform full-cone sampling on every shooter emission with an original centered-core/outer-cone approximation: most shots use 20% of the standing cone, with a low initial chance of an outer sample, increasing under sustained fire and recovering during idle simulation frames. Bias minimum/Kf/decrease inform this reconstruction but their exact engine semantics and inherited 0.3 ceiling were not verified. The core fraction, mixture interpretation and ceiling are trainer assumptions, not an exact reconstruction. Recovery persists across quick taps; long pauses recover. Pro startup stays provisional at three frames. No jumping/moving accuracy, falloff or exact projectile scale is claimed. Old run history is retained under its prior simulation identity.


## Projectile braking, damage falloff and Splat Charger preview — October 17, 2026

This section supersedes the older statements that flight-time damage falloff is unimplemented. The trainer uses these directly inspected v11.3 extraction fields (damage values converted from tenths of HP):

| Preset | Straight frames | End-of-straight speed cap | Full / minimum damage | Damage reduction start / end frames |
| --- | --- | --- | --- | --- |
| Heavy | 8 | 1.5105 | 30 / 15 | 11 / 19 |
| Mini | 8 | 1.105 | 32 / 16 | 11 / 19 |
| Splattershot | 4 | 1.493 | 36 / 18 | 8 / 40 |
| N-ZAP '85 | 4 | 1.4495 | 30 / 15 | 8 / 24 |
| Splattershot Pro | 3 | 2.2698 | 45 / 22.5 | 7 / 23 |

The Heavy, Mini and shooter records linked earlier supply these values. The three shooter records explicitly supply `FreeGravity: 0.016`; the two spinner records omit it. Heavy record SHA-256: `92647d586beee1764ca8984820fa37e0fd7887e2a756f7ca18e10e1aef97fd08`. The inspected public tree contains weapon records but no independently inspectable inherited movement/charger defaults.

Implementation limits: the replacement trajectory preserves a weapon-specific straight segment, caps launch velocity at the supplied transition limit without accelerating slower shots, and then uses an original two-stage approximation. Brake multiplier 0.64, free-flight multiplier 0.98, transition threshold 0.12 and applying 0.016 gravity to splatlings are unverified trainer assumptions. Inkipedia's Mini analysis describes losing “36% of its speed every frame”, but this is lower-trust community interpretation, not independently verified schema/engine behavior.[^mini-wiki] The exact update order, drag/gravity transitions, game-to-scene scale and camera/muzzle framing still need game measurement. Damage interpolates linearly between extracted flight-time endpoints and rounds to 0.1 HP; the interpolation curve is a reconstruction. Swept impacts receive the reduced damage. These changes remove the former shared 0.985 glide/0.025 drop and fixed maximum damage from all named runtime presets; the legacy no-profile test/debug path remains for compatibility. Decorative paint droplets are not reconstructed.

Splat Charger uses the pinned `WeaponChargerNormal` record: damage 40–80 for partial shots / 160 full, speed 2.4–4.8, distance 9.033–24.037, and player collision radius 0.125.[^charger-data] SHA-256: `dfe4637def507f933b0bbecbc805331f6357bb69ac165608a6e558406a4b72c1`. Inkipedia's Splatoon 3 section reports a 60-frame full charge, eight-frame minimum release and full-charge piercing.[^charger-wiki] Those timing defaults are absent from the pinned weapon record and remain community-documented preview settings, not verified extracted defaults. The preview charges while held, fires one shot on release (early taps wait until eight frames), uses a single charge ring, stops at charge-dependent travel distance and permits full-charge target penetration. Partial damage/speed/range interpolation and one-tick recovery are original approximations. A 59-frame release stays partial. No swim charge storage, jumping/gear effects, muzzle model or exact ink-line painting is implemented. Scene travel range is measured from the trainer's centered preview origin, not a validated game muzzle offset.

[^charger-data]: [Pinned Splat Charger parameters](https://github.com/Leanny/splat3/blob/7280ff9cde8bb1c5dcef46c700c326471584d2e6/data/parameter/1130/weapon/WeaponChargerNormal.game__GameParameterTable.json). Community-extracted primary record, not Nintendo documentation.
[^charger-wiki]: Community [Inkipedia: Splat Charger, Splatoon 3 data](https://splatoonwiki.org/wiki/Splat_Charger#Splatoon_3). Its database references overlap with the extraction, so corroboration is not independent engine verification.


## Independent stick/gyro response and local input check — October 17, 2026

The trainer now separates gyro and stick gain, defaults motion-capable controllers to gyro plus horizontal stick, and offers explicit sticks-only / both-axis combined modes. Inkipedia documents separate Splatoon 3 sensitivities and the motion-mode vertical-stick restriction.[^input-options] This is community control-layout evidence, not verification of Nintendo's response curve. Default stick speed (2 rad/s), optional precision exponent (1.5), timing integration and additive composition are original trainer choices. Existing ProGCC normalization and confirmed axes are preserved; firmware gain is not applied again. The official pinned decoder/enum cited above supports stick scaling and the added RY up/down entries 34/35. Standard Gamepad always supplies both stick axes and no gyro.

Five-second Input check uses only fresh report-time intervals and retains aggregate requested gyro/stick angles in memory. It rejects insufficient coverage and invalidates on changed settings/recenter/disconnect or a drill start. No raw samples are stored/uploaded and no controller configuration is written. Angles are before the camera pitch clamp and remain subject to provisional input scaling; this is a calibration aid, not a hardware/game match measurement. Exact sensitivity conversion, acceleration/filtering, orientation-aware gyro, FOV and third-person/recenter behavior remain pending research.

[^input-options]: Community [Inkipedia: Splatoon 3 options](https://splatoonwiki.org/wiki/Options#Splatoon_3).


## Charged-shot payload consistency — October 18, 2026

The trainer now captures each splatling shot's charge before discharge completion clears it, and launches from the retained Session payload. This fixes zero-charge launch speed on terminal partial-burst shots and preserves charged shots on the final round tick. It is an internal implementation correction, not new evidence for game gravity, drag, launch-scale or sensitivity equivalence. Existing parameter references and approximation limits above still apply.


## Heavy Splatling trajectory refinement — October 18, 2026

Heavy alone now uses distinct brake/free phases. Its existing v11.3 record directly supports the eight-frame straight segment, 1.5105 transition cap, 1.05–2.1 launch endpoints and 11–19-frame damage endpoints. It also explicitly provides player collision radius 0.225 (initial and final); this replaces the trainer's generic 0.035 target-hit radius for Heavy.[^heavy-record] Target spheres remain practice geometry; environment collision radius is not reconstructed.

New phase defaults are a **community reconstruction**, not independently verified inherited engine defaults. Inkipedia's mechanics draft describes 36% braking resistance with 0.07 gravity, then 2% resistance and 0.016 gravity.[^heavy-draft] The Splatoon 3 research wiki describes separate horizontal/downward transition thresholds and clamping on the crossing frame; its parameter notes list defaults 0.2355 and −0.15.[^heavy-phases] Heavy applies these defaults after the unchanged straight segment: cap velocity, multiply by 0.64, subtract braking gravity; after both component thresholds are reached, subsequent updates use 0.98 and free gravity. Horizontal motion can keep braking while an upward shot waits to descend. This replaces Heavy's total-speed 0.12 switch and shared 0.016 gravity. Other weapon paths retain their previous approximation.

This nominal trajectory is consistent with the Heavy-specific Inkipedia description of its straight segment and cap.[^heavy-wiki] Its exact frame ordering, threshold inheritance, launch-speed RNG/charge interpolation, damage interpolation, muzzle/camera/world scale and moving/jumping behavior still need game comparison. No Splatoon 2 numeric parameter was substituted in this pass. Damage falloff remains independent of trajectory state.

[^heavy-record]: Community-extracted primary [pinned Splatoon 3 v11.3 Heavy record](https://github.com/Leanny/splat3/blob/7280ff9cde8bb1c5dcef46c700c326471584d2e6/data/parameter/1130/weapon/WeaponSpinnerStandard.game__GameParameterTable.json), SHA-256 `92647d586beee1764ca8984820fa37e0fd7887e2a756f7ca18e10e1aef97fd08`. Not a Nintendo specification.
[^heavy-draft]: [XarrotD's Inkipedia data-explanation draft: Trajectory](https://splatoonwiki.org/wiki/User:XarrotD/Data_Explanation#Trajectory), inspected October 18, 2026. Explicitly draft/incomplete community analysis; lower-trust for unspecified defaults.
[^heavy-phases]: Community [Splatoon 3 system research: projectile speed/range](https://wikiwiki.jp/splatoon3mix/システム詳細仕様#bullet_speed) and [parameter notes](https://wikiwiki.jp/splatoon3mix/検証/パラメータ情報). These may share prior research with Inkipedia and are not independent engine verification.
[^heavy-wiki]: Community [Inkipedia: Heavy Splatling, Splatoon 3](https://splatoonwiki.org/wiki/Heavy_Splatling#Splatoon_3).


## Heavy environment collision — October 18, 2026

The same pinned v11.3 Heavy extraction explicitly supplies `InitRadiusForField` and `EndRadiusForField` of 0.2, separately from player radius 0.225.[^heavy-record] Heavy now sweeps that field radius against the trainer floor/wall, stops initially overlapping shots, and places splats on the actual plane rather than at the projectile center. Other presets retain their prior contacts. This is a source-backed radius and an original plane-collision implementation; it does not verify game geometry, muzzle/world scale or full paint physics.

Further scale research found Inkipedia's statement that Splatoon 3 practice lines are five internal units apart, versus fifty in Splatoon 2.[^distance-followup] This is community evidence; no game-scale/FOV change was made. The trainer's back wall remains at 15 nominal units and the usual target layout is 6.5–12, so the current range cannot establish Heavy's full-distance behavior. Exact speed-RNG semantics remain unresolved; no new RNG formula was inferred from parameter names.

[^distance-followup]: Community [Inkipedia: Distance unit](https://splatoonwiki.org/wiki/Distance_unit), inspected October 18, 2026. Its naming is marked conjectural; it cites Japanese community research for the scale comparison.

## Heavy launch-speed distribution — October 19, 2026

New Splatoon 3-specific author research supplies an explicit signed power curve for speed variation, beyond the earlier draft's “presumably”.[^heavy-rng-author] Heavy now uses `sign(2u−1) × |2u−1|^(log(b)/log(0.5))`, multiplied by the extracted rate, around nominal speed. The pinned record supplies bias 0.2 and rate 0.12.[^heavy-record] This retains ±12% limits while concentrating speeds near nominal; median absolute variation is 2.4%, versus the previous uniform 6%.

This is a lower-trust community reconstruction, not independently verified Nintendo RNG/code. The seeded generator remains original. Only Heavy speed sampling changes; angular mixture, charge interpolation, other presets and phase constants stay as before. No console/FOV/muzzle equivalence is established. The no-randomness diagnostic remains nominal; regenerated baseline identity does not constitute new measurement.

[^heavy-rng-author]: Primary author [かなもじ: Splatoon 3 projectile accuracy #10, splatling program construction](https://note.com/kanamoji_1027/n/n4de8b03535de), November 6, 2024, inspected October 19, 2026. Describes center-biased signed speed variation and cites another researcher's trajectory video. Community analysis; no independently reproduced console distribution in this project.

## Heavy angular spread and original research follow-up — October 19, 2026

The Splatoon 3 author analysis describes separate signed power curves for yaw/pitch and steady splatling bias, unlike shooter widening.[^heavy-rng-author] Heavy now uses yaw/pitch limits 3.3°/1.6° and fixed biases .3/.4. This removes the trainer's increasing outer-cone chance and correlated ellipse for Heavy. Seeded per-axis samples are original; their independence and exact game RNG remain unverified. Mini/shooters retain prior sampling.

The underlying July 17, 2024 researcher video states “スピナーはブレ補正が増減せず” (our translation: splatling bias does not increase/decrease).[^heavy-original-video] Around 1:09–2:59 it explicitly treats vertical/speed bias as suspected and difficult to establish from footage. Auto-generated Japanese captions were consulted, contain transcription errors, and do not verify numeric values. This strengthens provenance, not console validation.

Sendou's Heavy table matches the inspected Lean record's speed bias/rate .2/.12, pitch bias .4, standing maximum .3 and angle limits; its standing minimum .1 alone does not establish first-shot behavior.[^heavy-sendou] It credits Lean, so this is the same data lineage, not independent extraction evidence. The fixed .3 interpretation follows community analysis. Charge interpolation, camera-relative angle projection and scale remain approximations.

[^heavy-original-video]: Primary community researcher つー / CCOPEDIA, [Splatling horizontal, vertical and launch-speed deviation](https://www.youtube.com/watch?v=vqCSszcA6bw), July 17, 2024, especially 1:09–2:59. Its linked [Desmos trajectory reconstruction](https://www.desmos.com/calculator/jdihiqoma6) was inspected as mathematics; no upstream program was copied.
[^heavy-sendou]: [Sendou: Heavy Splatling parameters](https://sendou.ink/params/heavy-splatling), inspected October 19, 2026. Community display; “Data credit: Lean.”

## Heavy spread direction projection — October 19, 2026

The author reconstruction defines a fixed vertical axis, adds pitch deviation to launch elevation, and projects its 2D path through horizontal yaw.[^heavy-rng-author] Heavy now converts sampled offsets to world azimuth/elevation before constructing its unit direction. Other weapon paths retain their prior camera-local approximation.

This fixes an internal mismatch: requesting 3.3° yaw with no pitch offset previously produced 4.662° horizontal yaw at 45° upward aim and 9.569° at 70°, also lowering elevation slightly. The new Heavy path preserves the requested yaw and elevation independently. These are analytic trainer checks, not console observations. It aligns this community model's angle definition; it does not verify Nintendo's muzzle aim, camera FOV, collision geometry or movement inheritance. Distribution sampling, charge mapping, speeds and braking/gravity are unchanged.

## Humanoid camera FOV reference — October 20, 2026

Primary community researcher CCOPEDIA measured Splatoon 3's humanoid view using aligned scene lines and square-tile diagonals to recover perspective distance points. The December 27, 2024 worked example reports “垂直視野は…合わせて55度” (our translation: vertical FOV totals 55°), with horizontal FOV about 85.56° at 16:9.[^camera-measurement] The research wiki lists 55° humanoid / 60° squid vertical FOV, but is not treated as independent corroboration.[^camera-wiki]

The static standing trainer camera now uses 55° vertical FOV instead of the original 65° guess. At 16:9 this gives 85.57° horizontally. It retains the canvas's actual aspect ratio on other window shapes; this does not force the game's 16:9 framing. Camera position, muzzle offset, near/far planes, angular input gain and projectile simulation are unchanged. Targets appear larger under the narrower perspective. New run identity preserves earlier history separately.

This is a community image-based measurement reference, not inspected Nintendo camera parameters or our own console replication. Exact uncertainty, current-version equivalence, third-person camera offsets/obstruction, reticle-to-muzzle projection and scene scale remain unresolved. No player model or game asset is bundled. Squid/scope/throw FOV states are outside the current stationary trainer.

[^camera-measurement]: Primary author つー / CCOPEDIA, [Measuring FOV from game screenshots](https://note.com/ccopedia/n/naa1fb5835020), December 27, 2024, Splatoon 3 worked example, inspected October 20, 2026. Community measurement with an inspectable geometric method; not an official specification.
[^camera-wiki]: Community [Splatoon 3 mechanics: FOV](https://wikiwiki.jp/splatoon3mix/システム詳細仕様#q6f15816), inspected October 20, 2026. Shared lineage/independence not established.

## Camera position and aim-reference follow-up — October 20, 2026

The original CCOPEDIA video (December 20, 2024) is now inspected through its loaded Japanese auto-transcript and camera-position demonstration frames.[^camera-position] At 5:10–6:02 the author estimates a camera about four 1.5-unit blocks behind the player (about six community “meters”), checks wall avoidance around five–six, and estimates height around 1.6 from a slope. The author explicitly says “ざっくり” (roughly); this is an approximate community observation, not Nintendo parameters or our own measurement. Auto-captions contain errors; on-screen text at 5:18 and 5:48 was checked for the rear-distance and height claims.

At 6:02–6:39 the author distinguishes a horizontal camera from the downward-looking Y-reset camera and level launch in its charger/marker examples, not a Heavy muzzle measurement. No numeric reset pitch or Heavy muzzle offset is established. Do not substitute the older Desmos +5° guess.

Inkipedia explains that Japanese community research unofficially calls Splatoon 3 distance units “meters”.[^distance-followup] This supplies a unit convention, not real-world anthropometry or verification that our scene units, camera orbit and muzzle agree. See GAME_FEEL.md for the remaining implementation gaps.

[^camera-position]: Primary community researcher つー / CCOPEDIA, [FOV measurement and specification explanation: camera position](https://www.youtube.com/watch?v=UOtd_hSq248&t=310s), December 20, 2024, 5:10–6:39; inspected October 20, 2026. Authored visual analysis, lower-trust approximate position/orientation evidence; no error bars, exact game version or independently reproduced offsets.

## Player extraction inventory — October 21, 2026

Inspected the complete recursive tree at the existing pinned Leanny commit (`truncated: false`, 19,488 entries), then the v11.3 `misc/SplPlayer.game__GameParameterTable.json` and adjacent `misc/params.json`.[^player-inventory] The player record contains 37 `GameParameters` entries. Its explicit camera section is named `spl__PlayerCameraPeriscopeParam`, with `PlayerFollowRate`, `YawAngleVelRateGyro` and `YawAngleVelRateStick` curves. Their `Type` is `Hermit`; curve evaluation, input domain, units and applicability to ordinary standing Heavy aim were not established. These fields do not establish a standing sensitivity scale or camera offset. `ModelOffsetY/Z` occur under `spl__PlayerPipelineParam`, not an ordinary weapon muzzle record; do not transplant them into the Heavy framing path. Likewise, `ColBullet_Radius_Squid` is a squid collision field, not avatar height or a Heavy projectile radius.

No path in this pinned tree contains camera, reticle or muzzle (case insensitive). This is a file-name inventory result, not proof that camera data is absent from all files, inherited engine defaults, other extracted resources or the game. The adjacent `params.json` contains gear-effect arrays, not a standing camera transform. No new standing FOV/offset, reset pitch, Heavy muzzle transform, unit conversion or charge-endpoint semantics was verified. Raw player record SHA-256: `afece0e3e2016a895ba79483bfa63489b334c372293417b3b0ef072993bcb660`.

This remains community-extracted data, not an official specification or independent console measurement. Preserve the private synthetic calibration and public defaults. A useful next source must expose normal player-camera/weapon spawn semantics or repeated game observations with declared version, pose and distance; do not repeat this inventory as a new calibration finding.

[^player-inventory]: Pinned community [repository tree](https://api.github.com/repos/Leanny/splat3/git/trees/7280ff9cde8bb1c5dcef46c700c326471584d2e6?recursive=1), [SplPlayer record](https://github.com/Leanny/splat3/blob/7280ff9cde8bb1c5dcef46c700c326471584d2e6/data/parameter/1130/misc/SplPlayer.game__GameParameterTable.json), and [adjacent gear-effect arrays](https://github.com/Leanny/splat3/blob/7280ff9cde8bb1c5dcef46c700c326471584d2e6/data/parameter/1130/misc/params.json).

## Heavy event timing and range evidence — October 22, 2026

A newly inspected community measurement page states “ゲーム画面を60fpsでキャプチャ” (captured game footage at 60 fps). Its interval convention excludes the destination event; table version is v10.0.1. Heavy's columns report humanoid charge startup 1F, squid startup 6F, full charge 72F, release delay 1F and cadence 4F. The 6F is **not minimum charge**. The page marks interruption interpretation as needing more verification; linked raw footage/repeated Heavy endpoint counts were not established.[^heavy-event-study]

An older author article (April 22 / August 31, 2024) labels Heavy full-charge speed 0.42 practice-lines/frame, eight straight frames, braking cap 0.302 and approximate visually measured range 4.1 lines. It acknowledges unresolved braking/free-fall behavior. These are community author reports with incomplete measurement conditions/version and no established independent lineage; they do not calibrate our scene or validate the reconstructed curve. The speed/cap numbers agree approximately with the pinned parameters after the already-documented five-units-per-line conversion; numerical agreement is not independent engine verification.[^heavy-range-author]

Neither source resolves minimum charge, interpolation, final-shot inclusion or camera/muzzle scale. Preserve runtime defaults; use the event definitions to structure independent frame observations rather than inserting a guessed startup/minimum.

[^heavy-event-study]: Community first-person measurement report, [main-weapon startup/recovery study](https://wikiwiki.jp/splatoon3mix/検証/メインウェポン/前隙・後隙), introduction and Spinner section, v10.0.1 table. Method is self-reported, not independently reproduced here.
[^heavy-range-author]: Community author [まかろん: projectile speed/range](https://macarongamemo.com/entry/splatoon3-weapon-bullets), main-weapon table and shooter/dualies/splatling discussion. Approximate range is explicitly visual; no current-version or controlled-height validation claimed.

## ProGCC gyro-unit audit — October 23, 2026

Newer official HOJA library pin `f92a0e32995b8ae7ceb780376adf2a11c5ceabc5` declares `IMU_GYRO_DPS_PER_LSB 0.07f`. Its LSM6DSR register mask selects the 2000-dps range. ST's manufacturer datasheet specifies 70 mdps/LSB at that range, rather than deriving sensitivity by dividing the range label by 32768.[^gyro-unit-st] The inspected driver decodes signed counts; processing averages offset-corrected channels, applies saved sensitivity and gestures, and WebUSB copies the resulting gx/gy/gz words at offsets 9/11/13. Thus even a nominal 0.07 conversion describes the processed stream, not an independently calibrated physical rotation or an extra firmware gain to apply.[^gyro-unit-hoja]

The trainer still uses its explicitly provisional `2000/32768 = 0.06103515625` dps/count normalization. A direct existing-function replay of 1000 counts for one second gives 61.03515625 commanded degrees; the nominal LSM6DSR conversion would give 70 before any additional trainer multiplier. Replacing the constant alone would increase this path by a factor of 1.14688. This is arithmetic/source evidence, not a measured 14.688% error in the user's installed controller or game response. Installed firmware, sensor path, saved gains, gesture state, saturation and actual angular motion remain unverified. The older trainer pin was not re-fetched successfully in this pass; do not claim the newer header was inspected at that older revision.

Runtime conversion, saved gains, confirmed axes, history and controls are unchanged. Before integrating a version-qualified correction, identify the installed path read-only and compare known physical rotations with existing Input check. Any changed response must carry a new compatibility identity and an explicit legacy-settings policy; do not silently compensate user gains or relabel existing runs.

Inspected local file SHA-256 values at the newer pin: `include/input/imu.h` e29bc4d6b1c4f2bf57a0e5980367d0d8471f9c6e87892a721e4b3ceed838286b; `include/drivers/imu/lsm6dsr.h` 9eccdacf0b31da3d45d24c35d35a1a3a081e9f335e3c52443c596cabec9288d0; `src/input/imu.c` 94cd2cb0de56f4c33a803f584443bbff4f6b2a950d734baa9a455ba7ef8f5caa; `src/usb/webusb.c` 11f3334d310b63721e0d6ed931ef5d43bc0f2afb833eb4e2f26c9eefa48dc981. No upstream implementation was copied into the trainer.

[^gyro-unit-st]: Manufacturer [ST LSM6DSR datasheet](https://www.st.com/resource/en/datasheet/lsm6dsr.pdf), DS11976 Rev 2, Table 2 page 9 and CTRL2_G Tables 51–53 page 52; inspected October 23, 2026. Nominal device specification, not controller calibration.
[^gyro-unit-hoja]: Official pinned [unit constants](https://github.com/HandHeldLegend/HOJA-LIB-RP2040/blob/f92a0e32995b8ae7ceb780376adf2a11c5ceabc5/include/input/imu.h), [register mask](https://github.com/HandHeldLegend/HOJA-LIB-RP2040/blob/f92a0e32995b8ae7ceb780376adf2a11c5ceabc5/include/drivers/imu/lsm6dsr.h), [processing](https://github.com/HandHeldLegend/HOJA-LIB-RP2040/blob/f92a0e32995b8ae7ceb780376adf2a11c5ceabc5/src/input/imu.c) and [WebUSB stream](https://github.com/HandHeldLegend/HOJA-LIB-RP2040/blob/f92a0e32995b8ae7ceb780376adf2a11c5ceabc5/src/usb/webusb.c). Direct source inspection; not installed-firmware or hardware verification.

## .52 Gal preview — October 28, 2026

Inspected the pinned v11.3 `WeaponShooterGravity` record, SHA-256 `c1a42d516bfb5c1763f4285159456589b7a647ee0862004654c36d604889b838`. It explicitly gives RepeatFrame 9, damage 520/300 (52/30 displayed HP), reduction frames 11–27, SpawnSpeed 3.06, three straight ticks, transition cap 1.667, FreeAirResist .02, FreeGravity .016, field/player radii .2/.285 and standing swerve 6°. Bias minimum/step/recovery are .02/.03/.015. Sendou's .52 column matches these fields and is a community data-display cross-check, not independent engine/console validation.[^gal52-data][^gal52-sendou]

The preview uses these bounds with the existing original shooter implementation, swept collisions and flight-time damage interpolation. Two full-damage hits exceed the trainer target's 100 HP; four 30-damage hits would be required at the reduction endpoint. This is damage arithmetic, not a measured effective range. Three-frame startup remains provisional: PostDelayFrame is not proof of input startup. The centered-core/outer mixture, .3 ceiling, symmetric pitch interpretation, brake/free threshold/order, damage interpolation, movement/jump behavior and scene/muzzle scale remain approximations. No .52 speed RNG, ink economy or movement mechanics are inferred. Existing presets and gains are unchanged; the new weapon key separates its stored settings/results without relabeling earlier runs.

[^gal52-data]: Community-extracted primary [pinned v11.3 .52 Gal record](https://github.com/Leanny/splat3/blob/7280ff9cde8bb1c5dcef46c700c326471584d2e6/data/parameter/1130/weapon/WeaponShooterGravity.game__GameParameterTable.json), inspected October 28, 2026. Not Nintendo documentation. `WeaponShooterBlaze` is a different record and was rejected for this preset.
[^gal52-sendou]: Community [Sendou .52 Gal parameter display](https://sendou.ink/params/52-gal), first weapon column, inspected October 28, 2026. Shared extraction lineage; not a second measurement.

## Vanilla Blaster preparation — October 28, 2026

Inspected the pinned v11.3 `WeaponBlasterMiddle` record, SHA-256 `36139282d2bd915f675424d99d5641800f184bcc9a9d1b0c94be533d38f64e18`. Direct damage fields are 1250/1250 (125 displayed HP). `BlastParam` separately declares `DamageLinear: true` and damage/distance entries 700 at 1.025 and 500 at 3.385 (70/50 displayed HP). These are source bounds, not verified explosion interpolation, effective center distance or trainer-unit scale. The record also gives repeat 50 frames, human/squid pre-delay 10/15, spawn speed .945, straight-to-brake transition 9, transition speed cap .9131, gravity .016 and field/player collision radii .2/.285. Standing swerve is zero; jumping has separate fields.[^vblaster-data]

The inspected record does not explicitly establish the explosion lifetime/fuse. Nine straight-flight ticks must not be substituted for fuse time. The next implementation needs an independent direct-impact/explosion path, explicit target overlap and wall handling, and qualified fuse/damage-region semantics. Paint/splash radius fields are decorative/ink behavior and are not damage radii. Sendou's first Blaster column matches these values but shares extraction lineage; it is not an independent game measurement.[^vblaster-sendou] No Blaster runtime, console measurement or hardware validation was added in this pass.

[^vblaster-data]: Community-extracted primary [pinned v11.3 vanilla Blaster record](https://github.com/Leanny/splat3/blob/7280ff9cde8bb1c5dcef46c700c326471584d2e6/data/parameter/1130/weapon/WeaponBlasterMiddle.game__GameParameterTable.json), inspected October 28, 2026. Not Nintendo documentation; omitted defaults/update semantics remain unresolved.
[^vblaster-sendou]: Community [Sendou Blaster parameter display](https://sendou.ink/params/blaster), first weapon column, inspected October 28, 2026. Shared data lineage; no independent replication claim.

## Vanilla Blaster preview — October 28, 2026, evening Eastern

Macaron's original Splatoon 3 behavior report explicitly lists 13 frames from launch to explosion for vanilla Blaster, separately from nine straight frames. This is an older community author report (April/August 2024), without repeated raw footage or a declared event-count convention verified here. It supports a labeled preview fuse, not an exact current-version replication.[^blaster-fuse-author] Inkipedia's Splatoon 3 section independently displays the same fuse and the current extraction's damage regions; shared data lineage is possible, so no independent replication is claimed.[^blaster-s3-wiki]

The original preview uses the pinned record's 125 direct damage, 50-frame repeat, zero standing spread and separate player/field radii. Startup maps the extracted human PreDelayFrame 10 to ten held ticks; Inkipedia instead describes fourteen frames from humanoid input. That discrepancy, short-tap cancellation and the reused held-trigger scheduler remain provisional; no swim/jump/movement timing is implemented. Launch moves on its first simulation tick; fuse expiry is after thirteen movement ticks. Existing .64 brake/.98 free multipliers and .016 gravity are retained as a reconstruction, not a verified update order.

Airbursts apply 70 damage through the 1.025 inner bound and interpolate linearly to 50 at 3.385; exact equality is included and values beyond are excluded. Distance is measured to the practice target sphere's nearest surface: an explicit original approximation, not established game overlap semantics. Terrain collision detonates early and scales both bounds by the extracted .4234 collision ratio. The latter mapping is consistent with Inkipedia's v11.0.1 terrain-multiplier note, but collision-center placement and damage-radius interpretation need console validation. No arbitrary obstacles or game blast-occlusion behavior are modeled; the practice floor/back wall stay solid and targets beyond their half-spaces are excluded. Direct targets are excluded from the same shot's blast, while nearby distinct targets can receive one blast each. Hits counts target impacts and can exceed emitted shots. The brief expanding/shrinking disc is an original visual cue, not a paint/drop simulation.

Six focused tests cover trigger timing, fuse/straight separation, direct/blast deduplication, inner/outer regions, early terrain/floor collisions, alive filtering, reset, persistence/pause and deterministic event equality at 30/60/120/144 Hz. All 146 software tests pass. Browser keyboard firing, pause and reload selection are checked separately; no game, controller, blast-occlusion or measured performance claim. Existing presets and compatibility identities are preserved; the new weapon key separates its runs.

[^blaster-fuse-author]: Community author [Macaron, projectile behavior](https://macarongamemo.com/entry/splatoon3-weapon-bullets), Blaster section, launch-to-explosion table, inspected October 28, 2026. Quote: “ホットブラスター | 13”. Older author-reported result, conditions not independently reproduced.
[^blaster-s3-wiki]: Community secondary [Inkipedia Blaster, Splatoon 3 Data and version history](https://splatoonwiki.org/wiki/Blaster#Splatoon_3), inspected October 28, 2026. Useful corroboration and discrepancy inventory, not Nintendo engine semantics.

## Rapid Blaster preparation — October 29, 2026

Pinned v11.3 WeaponInfoMain maps versus weapon240, label ラピッドブラスター, to `WeaponBlasterLight`; the full identity-table SHA-256 is `53641c4b4c96d56d3ed4ca8d4c7426d83a0bf28af6f85e9eafc391b2ae9f663e`. Its parameter record SHA-256 is `e749fc9ccd6919f71c1a9287f9351710f48cfd81e260fc1ba759db157986cae1`. This establishes the base Rapid identity, avoiding Rapid Pro/Salmon Run substitutions.[^rapid-identity]

The record explicitly supplies BurstFrame15 (unlike vanilla Blaster's omitted fuse), MoveLength2, repeat35, human/squid pre-delay8/12, direct damage850/850 (85 displayed HP), and blast damage350 at distances1.01 and3.335 (flat35 displayed HP at both bounds). Launch speed1.2, straight11, transition cap1.13305, gravity.016, field/player radii.2/.235 and terrain collision ratio.4653 are distinct from vanilla Blaster. Standing spread is zero; jump8° and separate timing fields do not authorize implementing movement from standing data. Sendou's first Rapid column agrees but shares extraction lineage.[^rapid-data][^rapid-sendou]

Next preset should use flat35 blast damage rather than vanilla70→50, with two direct hits, three blasts or one direct plus one blast exceeding100HP by arithmetic. BurstFrame15 can back the preview fuse, but event origin, MoveLength2, startup composition, terrain/target geometry and update order remain unverified semantics. Do not silently add MoveLength2 to speed/range or claim its omission is game-correct. Preserve the existing labeled geometry reconstruction; add focused near/far/direct/multi-target/fuse/collision/replay checks before release. No Rapid runtime was added during this publishing cycle.

[^rapid-identity]: Community-extracted primary [pinned v11.3 WeaponInfoMain](https://github.com/Leanny/splat3/blob/7280ff9cde8bb1c5dcef46c700c326471584d2e6/data/mush/1130/WeaponInfoMain.json), ID240/Blaster_Light_00, inspected October29,2026. Not Nintendo documentation.
[^rapid-data]: Community-extracted primary [pinned v11.3 Rapid Blaster parameters](https://github.com/Leanny/splat3/blob/7280ff9cde8bb1c5dcef46c700c326471584d2e6/data/parameter/1130/weapon/WeaponBlasterLight.game__GameParameterTable.json), inspected October29,2026. Values are inspectable; engine semantics are not established by names alone.
[^rapid-sendou]: Community [Sendou Rapid Blaster parameters](https://sendou.ink/params/rapid-blaster), first weapon column, inspected October29,2026. Shared lineage, not independent console validation.

## Rapid Blaster preview — October 29, 2026

The standing preview now uses Rapid's own85 direct/flat35 blast,35-frame repeat,15-movement-tick fuse,1.2 launch speed,11 straight ticks,1.13305 cap,.235/.2 player/field radii and.4653 terrain scale. Source identity/hashes are recorded above. Startup maps PreDelayFrame_HumanShot8 to eight held ticks; startup composition and quick-tap cancellation remain provisional. MoveLength2 is deliberately unmapped because its engine meaning is unverified; no claim is made that the resulting range is game-correct. Brake/free multipliers, phase update order, target-surface blast distance, early-impact detonation and terrain/occlusion geometry retain the existing labeled original preview. Zero standing spread is supported; jump/movement/ink economy are absent.

Two85-damage direct hits, three35-damage blasts or one of each exceed the trainer's100HP. The blast remains35 through the full3.335 bound and zero beyond; no vanilla70→50 falloff is inherited. Current wall atz=-15 can detonate a nominal Rapid shot before its airburst, so fuse verification uses the same engine rotated into open+X; this is test isolation, not a change to the live wall. Existing weapon behavior, gains/axes/layout and saved-history identities are preserved; Rapid has its own weapon key.

Six focused new tests check direct/blast/mixed damage, independent fuse/straight timing, near/far blast bounds, swept grazing and deduplication, early wall/floor collisions, cooldown/taps/pause/reset, zero spread/persistence and event equality at30/60/120/144Hz. All152 tests and the build pass. Local browser keyboard fire/pause emitted three shots with zero impacts in the sampled random layout; selection persisted and logs were clean. Software collision cases establish the impact path, not console fidelity or hardware performance.
