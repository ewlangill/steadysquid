import { blastVisual } from './ink-visuals.js?v=e5e46ca3981973d8';
import { createLocalStore, cleanSettings, MODEL_VERSION } from './storage.js?v=e5e46ca3981973d8';
import { WEAPONS, routineHint, projectileSpeed } from './weapons.js?v=e5e46ca3981973d8';
import { projectileSpec } from './ballistics.js?v=e5e46ca3981973d8';
import { aimDelta, InputCheck } from './aim.js?v=e5e46ca3981973d8';
import { InkCloud, shotSpread, spreadDirection, ShooterSpread } from './ink.js?v=e5e46ca3981973d8';
import { generateLayout, targetPosition } from './layout.js?v=e5e46ca3981973d8';
import { createChasePath, chasePosition, targetEnabled } from './chase.js?v=e5e46ca3981973d8';
import { freshSeed } from './random.js?v=e5e46ca3981973d8';
import { TargetField } from './targets.js?v=e5e46ca3981973d8';
import { ROUTINES, drillTarget, Acquisition, targetCue } from './drills.js?v=e5e46ca3981973d8';
import { ProGCC, MotionInput, controllerSessionAction } from './progcc.js?v=e5e46ca3981973d8';
import { SwitchPro } from './switchpro.js?v=e5e46ca3981973d8';
import { BrowserGamepad } from './gamepad.js?v=e5e46ca3981973d8';
import { Session, summarizeFrames } from './engine.js?v=e5e46ca3981973d8';
const $ = id => document.getElementById(id);
const session = new Session();
let controllerKind = 'progcc', usb;
const controllerNames = { progcc: 'ProGCC', switchpro: 'Switch Pro', gamepad: 'Gamepad' };
let weaponProfile = WEAPONS.heavy, runSaved = false, runInput = 'mouse-keyboard';
const localStore = createLocalStore({ getItem: key => localStorage.getItem(key), setItem: (key, value) => localStorage.setItem(key, value) });
const canvas = $('range'), keys = new Set(), frameSamples = [];
let yaw = 0, pitch = 0, sensitivity = 1, speed = 1, motionTime = 0, last = 0, uiAt = 0;
let renderer, scene, camera, target, halo, floorMark, nextDraw = 0;
let radius = 0.32, routine = 'smooth', seed = 1, arcDegrees = 120;
const acquisition = new Acquisition(), field = new TargetField(5), targetMeshes = [], THREE = window.THREE;
let simulationFrame = 0, simulationRemainder = 0, shotSerial = 0, burstShot = 0;
const ink = new InkCloud(), shooterSpread = new ShooterSpread(), inputCheck = new InputCheck();
let layout = generateLayout(seed, field.count, radius, arcDegrees), chasePath = createChasePath(seed, arcDegrees), inkMesh, splashMesh, blastMesh, blastRingMesh;
function showError(message) { $('error').hidden = false; $('error').textContent = message; $('start').disabled = true; }
try {
  if (!THREE) throw new Error('The 3D library could not load. Please reload the page.');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.setClearColor(0x111111);
  scene = new THREE.Scene(); scene.fog = new THREE.Fog(0x111111, 12, 30);
  // Community-measured humanoid vertical FOV; third-person framing/scale remain provisional (SOURCES.md).
  camera = new THREE.PerspectiveCamera(55, 1, 0.1, 40); camera.position.set(0, 1.6, 0); camera.rotation.order = 'YXZ';
  scene.add(new THREE.HemisphereLight(0xf2f0ea, 0x111111, 1));
  const key = new THREE.DirectionalLight(0xf2f0ea, 1); key.position.set(2, 6, 3); scene.add(key);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.95 })); floor.rotation.x = -Math.PI / 2; floor.position.z = -9; scene.add(floor);
  const grid = new THREE.GridHelper(40, 40, 0x565550, 0x30302e); grid.position.z = -8; grid.position.y = 0.005; scene.add(grid);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(28, 9), new THREE.MeshStandardMaterial({ color: 0x1c1c1b, roughness: 1 })); back.position.set(0, 4.5, -15); scene.add(back);
  for (let i = -6; i <= 6; i += 2) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.018, 5, 0.01), new THREE.MeshBasicMaterial({ color: 0x3f3e3b })); strip.position.set(i, 2.5, -14.95); scene.add(strip);
  }
  target = new THREE.Mesh(new THREE.SphereGeometry(radius, 24, 16), new THREE.MeshStandardMaterial({ color: 0xf2f0ea, roughness: 0.35, emissive: 0x222222, emissiveIntensity: 0.3 })); scene.add(target);
  halo = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.012, 8, 48), new THREE.MeshBasicMaterial({ color: 0x90a1cf })); scene.add(halo);
  floorMark = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.28, 32), new THREE.MeshBasicMaterial({ color: 0xaaa79f, transparent: true, opacity: 0.5, side: THREE.DoubleSide })); floorMark.rotation.x = -Math.PI / 2; floorMark.position.y = 0.015; scene.add(floorMark);
  for (let i = 0; i < field.count; i++) {
    const mesh = i === 0 ? target : new THREE.Mesh(target.geometry, target.material.clone());
    const ring = i === 0 ? halo : new THREE.Mesh(halo.geometry, halo.material.clone());
    const mark = i === 0 ? floorMark : new THREE.Mesh(floorMark.geometry, floorMark.material.clone());
    ring.material.transparent = true; mark.rotation.x = -Math.PI / 2; mark.position.y = 0.015;
    if (i) { scene.add(mesh); scene.add(ring); scene.add(mark); }
    const label = document.createElement('span'); label.className = 'target-health'; $('range').parentElement.append(label);
    const glow = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.07, 8, 64), new THREE.MeshBasicMaterial({ color: 0x90a1cf, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false }));
    const countdown = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.022, 8, 64), new THREE.MeshBasicMaterial({ color: 0x90a1cf, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false }));
    glow.renderOrder = 3; countdown.renderOrder = 4; scene.add(glow); scene.add(countdown);
    targetMeshes.push({ mesh, ring, mark, label, glow, countdown });
  }
  inkMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshBasicMaterial({ color: 0x90a1cf }), 192);
  inkMesh.count = 0; inkMesh.frustumCulled = false; scene.add(inkMesh);
  const blob = new THREE.Shape();
  for (let i = 0; i <= 40; i++) { const angle = i / 40 * Math.PI * 2, r = 0.8 + 0.14 * Math.sin(angle * 5) + 0.06 * Math.sin(angle * 9); const x = Math.cos(angle) * r, y = Math.sin(angle) * r; if (!i) blob.moveTo(x, y); else blob.lineTo(x, y); }
  splashMesh = new THREE.InstancedMesh(new THREE.ShapeGeometry(blob), new THREE.MeshBasicMaterial({ color: 0x90a1cf, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false }), 96);
  splashMesh.count = 0; splashMesh.frustumCulled = false; splashMesh.renderOrder = 2; scene.add(splashMesh);
  blastMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshBasicMaterial({ color: 0x90a1cf, transparent: true, opacity: 0.7, depthWrite: false }), 96 * 8);
  blastRingMesh = new THREE.InstancedMesh(new THREE.RingGeometry(0.955, 1, 40), new THREE.MeshBasicMaterial({ color: 0x90a1cf, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false }), 96);
  for (const mesh of [blastMesh, blastRingMesh]) { mesh.count = 0; mesh.frustumCulled = false; scene.add(mesh); }

} catch (error) { showError(error.message); }
function updateAim() { if (camera) { camera.rotation.y = yaw; camera.rotation.x = pitch; } }
function center() { yaw = pitch = 0; updateAim(); }
function resetEndCard() { $('round-results').hidden = true; $('welcome').classList.remove('results'); $('welcome-label').textContent = 'PRACTICE'; }
function start({ replay = false } = {}) { inputCheck.cancel('Drill started. Stop the drill before measuring again.'); resetEndCard(); runSaved = false; runInput = usb.device ? controllerKind : 'mouse-keyboard'; if (!replay && $('fresh-layout').checked) seed = freshSeed(seed); $('seed').value = seed; resetInkAndLayout(); session.start(); acquisition.reset(); field.reset(); simulationFrame = 0; simulationRemainder = 0; motionTime = 0; center(); frameSamples.length = 0; $('welcome').hidden = true; $('pause').disabled = false; canvas.focus(); try { const result = usb.device ? null : canvas.requestPointerLock?.(); result?.catch?.(() => {}); } catch {} syncUI(); }
function pause() {
  if (session.state === 'running') { session.pause(); keys.clear(); if (document.pointerLockElement === canvas) document.exitPointerLock(); }
  else if (session.state === 'paused') { session.resume(); canvas.focus(); }
  syncUI();
}
$('start').addEventListener('click', start); $('restart').addEventListener('click', start); $('pause').addEventListener('click', pause); $('replay').addEventListener('click', () => start({ replay: true }));
canvas.addEventListener('pointerdown', event => { if (event.button !== 0 || session.state !== 'running') return; canvas.focus(); canvas.requestPointerLock?.()?.catch?.(() => {}); session.press(); });
window.addEventListener('pointerup', event => { if (event.button === 0) session.release(); });
window.addEventListener('mousemove', event => { if (document.pointerLockElement !== canvas || session.state !== 'running') return; yaw -= event.movementX * 0.0018 * sensitivity; pitch = Math.max(-1.3, Math.min(1.3, pitch - event.movementY * 0.0018 * sensitivity)); updateAim(); });
window.addEventListener('keydown', event => {
  if (event.target.matches('input, select, textarea') || event.repeat) return;
  if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.code)) event.preventDefault();
  keys.add(event.code);
  if (event.code === 'Space') session.press();
  if (event.code === 'KeyY') center();
  if (event.code === 'Escape' && session.state === 'running') pause();
});
window.addEventListener('keyup', event => { keys.delete(event.code); if (event.code === 'Space') session.release(); });
document.addEventListener('pointerlockchange', () => { if (!document.pointerLockElement && session.state === 'running') { session.pause(); keys.clear(); syncUI(); } });
document.addEventListener('visibilitychange', () => { if (document.hidden && session.state === 'running') pause(); last = 0; });
window.addEventListener('blur', () => { keys.clear(); if (session.state === 'running') pause(); });
$('speed').addEventListener('input', event => { speed = +event.target.value; $('speed-value').textContent = speed.toFixed(1) + '×'; resetRoutine(); });
$('sensitivity').addEventListener('input', event => { sensitivity = +event.target.value; $('sens-value').textContent = sensitivity.toFixed(1) + '×'; });
const motion = new MotionInput();
let gyroGain = 1, reportCount = 0, reportWindow = 0, reportHz = 0, latestReport = null, staleShown = false;
function handleControllerReport(report, now) {
  const edge = motion.sample(report, now); latestReport = report; staleShown = false;
  reportCount++;
  if (edge.lostContinuity) {
    inputCheck.cancel('Input gap. Measure again with a continuous connection.');
    if (session.state === 'running') { session.pause(); keys.clear(); $('usb-status').textContent = 'Input gap. Resume when the controller is responding.'; syncUI(); return; }
  }
  if (!reportWindow) reportWindow = now;
  if (now - reportWindow >= 1000) { reportHz = Math.round(reportCount * 1000 / (now - reportWindow)); reportCount = 0; reportWindow = now; }
  $('usb-status').textContent = 'Live ' + controllerNames[controllerKind] + ' input' + (controllerKind === 'switchpro' ? ' · wired preview' : controllerKind === 'gamepad' ? ' · sticks/buttons only' : ''); $('input-mode').textContent = controllerNames[controllerKind].toUpperCase();
  if (edge.recenter) { center(); inputCheck.cancel('Recentered. Start another measurement.'); }
  if (edge.pause) {
    const action = controllerSessionAction(session.state);
    if (action === 'start' && !$('start').disabled) start();
    else if (action === 'pause') pause();
    return;
  }
  const delta = aimDelta(report, edge.recenter ? 0 : edge.dt, currentSettings());
  inputCheck.sample(delta, edge.dt, now);
  if (session.state !== 'running') return;
  runInput = controllerKind;
  yaw += delta.yaw;
  pitch = Math.max(-1.3, Math.min(1.3, pitch + delta.pitch));
  if (edge.press) session.press(); if (edge.release) session.release();
  updateAim();
}
function handleControllerStatus(message) {
  $('usb-status').textContent = message;
  if (!usb.device) {
    inputCheck.cancel('Controller disconnected. Reconnect and measure again.');
    motion.reset(); latestReport = null; $('input-mode').textContent = 'MOUSE PREVIEW';
    $('usb-data').textContent = 'No live controller input.'; $('connect').textContent = 'Connect ' + controllerNames[controllerKind];
    if (session.state === 'running') pause();
  }
  controllerUI();
}
const adapters = {};
for (const [kind, Adapter] of Object.entries({ progcc: ProGCC, switchpro: SwitchPro, gamepad: BrowserGamepad })) adapters[kind] = new Adapter((r,t) => { if (usb === adapters[kind]) handleControllerReport(r,t); }, message => { if (usb === adapters[kind]) handleControllerStatus(message); });
usb = adapters.progcc;
function controllerUI() {
  $('connect').textContent = (usb.device ? 'Disconnect ' : 'Connect ') + controllerNames[controllerKind];
  $('zero-motion').hidden = controllerKind !== 'switchpro';
  $('zero-motion').disabled = !usb.device;
  $('controller-note').textContent = controllerKind === 'switchpro' ? 'Original Switch Pro. Use a USB cable and desktop Chrome or Edge. Preview: check motion direction and buttons. Hold still, then use Zero motion if it drifts.' : controllerKind === 'gamepad' ? 'Standard browser buttons/sticks only. Press a controller button before connecting. Motion is unavailable in this mode.' : 'Connect your ProGCC for motion controls.';
}
$('controller-kind').addEventListener('change', async event => {
  $('controller-kind').disabled = $('connect').disabled = true;
  try { await usb.close(); controllerKind = event.target.value; usb = adapters[controllerKind]; motion.reset(); reportCount = reportHz = reportWindow = 0; latestReport = null; center(); controllerUI(); $('usb-status').textContent = 'Connect ' + controllerNames[controllerKind] + ' to begin.'; localStore.saveSettings(currentSettings()); }
  finally { $('controller-kind').disabled = $('connect').disabled = false; }
});
$('zero-motion').addEventListener('click', async () => { $('zero-motion').disabled = true; try { $('usb-status').textContent = 'Hold the controller still…'; await usb.zeroMotion(); $('usb-status').textContent = 'Motion zeroed for this connection.'; } catch(error) { $('usb-status').textContent = error.message; } finally { $('zero-motion').disabled = !usb.device; } });
$('connect').addEventListener('click', async () => {
  if (usb.device) { await usb.close(); return; }
  $('connect').disabled = $('controller-kind').disabled = true; $('usb-status').textContent = 'Choose your ' + controllerNames[controllerKind] + ' in the browser prompt…';
  try { await usb.connect(); controllerUI(); }
  catch (error) { $('usb-status').textContent = error.name === 'NotFoundError' ? 'No controller selected. Try Connect again.' : error.message; }
  finally { $('connect').disabled = $('controller-kind').disabled = false; controllerUI(); }
});
$('gyro-gain').addEventListener('input', event => { gyroGain = +event.target.value; $('gyro-value').textContent = gyroGain.toFixed(1) + '×'; });
$('stick-gain').addEventListener('input', event => { $('stick-value').textContent = Number(event.target.value).toFixed(1) + '×'; });
$('measure-input').addEventListener('click', () => {
  const now = performance.now();
  if (!usb.device || !latestReport || motion.stale(now) || session.state === 'running') return;
  inputCheck.start(now); syncInputCheck(now);
});
function syncInputCheck(now) {
  inputCheck.poll(now);
  $('measure-input').disabled = inputCheck.state === 'measuring' || session.state === 'running' || !usb.device || !latestReport || motion.stale(now);
  const state = inputCheck.state;
  $('input-check-status').textContent = state === 'measuring' ? `Measuring · ${Math.max(0, 5 - (now - inputCheck.startAt) / 1000).toFixed(1)} s remaining` : state === 'complete' ? `5-second trainer input check · ${inputCheck.covered.toFixed(2)} s of fresh samples. Totals are before camera pitch limits.` : inputCheck.message || 'Connect a controller. Measure while the drill is stopped.';
  $('input-check-result').hidden = state !== 'complete';
  if (state === 'complete') {
    const d = inputCheck.degrees, pair = (a, b) => `${a.toFixed(1)}° / ${b.toFixed(1)}°`;
    $('check-gyro').textContent = pair(d.gyroYaw, d.gyroPitch); $('check-stick').textContent = pair(d.stickYaw, d.stickPitch);
    $('check-total').textContent = pair(d.gyroYaw + d.stickYaw, d.gyroPitch + d.stickPitch);
  }
}

function resetRoutine() {
  resetEndCard();
  resetInkAndLayout(); session.reset(); acquisition.reset(); field.reset(); simulationFrame = 0; simulationRemainder = 0; motionTime = 0; keys.clear(); center();
  $('welcome').hidden = false; $('routine-chip').textContent = ROUTINES[routine].label.toUpperCase();
  $('routine-title').textContent = ROUTINES[routine].title; $('routine-description').textContent = routineHint(routine, weaponProfile); $('welcome-title').textContent = ROUTINES[routine].title; $('welcome-description').textContent = routineHint(routine, weaponProfile);
  $('acquisition-result').hidden = routine !== 'acquire';
  if (document.pointerLockElement === canvas) document.exitPointerLock();
  syncUI();
}
$('weapon').addEventListener('change', event => {
  session.setWeapon(event.target.value); weaponProfile = WEAPONS[session.weaponId]; resetRoutine();
});
$('target-arc').addEventListener('input', event => { arcDegrees = +event.target.value; $('arc-value').textContent = arcDegrees + '°'; resetRoutine(); });
$('routine').addEventListener('change', event => { routine = event.target.value; resetRoutine(); });
$('seed').addEventListener('change', event => { seed = Math.max(1, Math.min(9999, Math.round(+event.target.value) || 1)); event.target.value = seed; resetRoutine(); });
$('size').addEventListener('input', event => { const factor = +event.target.value; radius = 0.32 * factor; for (const item of targetMeshes) { item.mesh.scale.setScalar(factor); item.ring.scale.setScalar(factor); } $('size-value').textContent = factor.toFixed(1) + '×'; resetRoutine(); });
const percent = n => n === null ? '—' : Math.round(n * 100);
function syncUI() {
  syncInputCheck(performance.now());
  $('acquisition-time').textContent = acquisition.mean === null ? '—' : acquisition.mean.toFixed(2) + ' s mean';
  $('acquisition-count').textContent = `${acquisition.times.length} / ${acquisition.attempts} targets acquired`;
  if (latestReport) $('usb-data').textContent = `${reportHz} reports/s · gyro ${latestReport.gyro.x}, ${latestReport.gyro.y}, ${latestReport.gyro.z} · ZR ${latestReport.zr ? 'held' : 'up'}`;
  $('clock').textContent = Math.max(0, 60 - session.elapsed).toFixed(1) + ' s';
  $('tracking').innerHTML = percent(session.tracking) + '<small>%</small>';
  $('firing').innerHTML = percent(session.firingTracking) + '<small>%</small>';
  $('angular-error').textContent = session.angularError === null ? '—' : session.angularError.toFixed(1) + '°';
  $('shots').textContent = session.hits + ' / ' + session.shots;
  $('pops').textContent = field.pops; $('pop-time').textContent = field.lastPopFrames === null ? '—' : field.lastPopFrames + ' f from first hit';
  $('session-status').textContent = session.state.toUpperCase(); $('pause').textContent = session.state === 'paused' ? 'Resume' : 'Pause';
  $('pause').disabled = !['running', 'paused'].includes(session.state);
  const weapon = session.weapon, firing = weapon.phase === 'firing';
  const shooter = ['shooter', 'blaster'].includes(weaponProfile.family);
  const amount = shooter ? Number(firing) : firing ? weapon.remaining / (weaponProfile.fullBurstFrames / 60) : weapon.charge;
  $('phase').textContent = firing ? (shooter ? 'FIRING' : 'DISCHARGING') : weapon.phase === 'charging' ? 'CHARGING' : session.state === 'paused' ? 'PAUSED' : session.state === 'complete' ? 'SESSION COMPLETE' : 'STANDBY';
  $('charge-fill').style.width = Math.min(100, amount * 100) + '%'; $('charge-fill').classList.toggle('firing', firing);
  $('charge-number').textContent = shooter ? (firing ? 'HELD' : 'READY') : Math.round(amount * 100) + '%';
  $('charge-reticle').setAttribute('aria-valuenow', Math.round(amount * 100));
  $('charge-reticle').setAttribute('aria-label', firing ? 'Splatling burst remaining' : 'Splatling charge');
  $('weapon-title').textContent = weaponProfile.name.toUpperCase() + ' / 60 HZ';
  $('weapon-summary').textContent = weaponProfile.summary;
  $('keyboard-action').textContent = shooter ? 'hold to fire' : 'charge / release';
  canvas.setAttribute('aria-label', shooter ? 'Practice range. Arrow keys aim; hold Space to fire.' : 'Practice range. Arrow keys aim; hold Space to charge and release to fire.');
  $('controller-controls').textContent = weaponProfile.family === 'charger' ? 'ZR charge / release one shot · Y recenter · Plus start / pause / resume.' : shooter ? 'Hold ZR to fire · Y recenter · Plus start / pause / resume.' : 'ZR charge / release · hold ZR during a burst to queue the next charge · Y recenter · Plus start / pause / resume.';
  $('scoring-note').textContent = weaponProfile.family === 'blaster' ? 'Hits counts target impacts; one blast can hit several targets. Startup counts as firing time.' : weaponProfile.family === 'charger' ? 'Shots landed counts impacts. Full-charge shots can hit more than one target. Charging is excluded from firing time.' : shooter ? 'Tracking while firing measures time the fire control is held, including startup. Shots landed counts projectile impacts.' : 'Charging time counts toward tracking, but is excluded from tracking while firing.';
  $('charge-hint').textContent = shooter ? (usb.device ? 'HOLD ZR TO FIRE · RELEASE TO STOP' : 'HOLD SPACE OR LEFT MOUSE TO FIRE') : firing ? 'KEEP AIMING WHILE FIRING' : weapon.phase === 'charging' ? 'RELEASE TO FIRE' : session.state === 'complete' ? 'RESTART TO TRY AGAIN' : usb.device ? 'HOLD ZR TO CHARGE · RELEASE TO FIRE' : 'HOLD SPACE OR LEFT MOUSE TO CHARGE';
  if (session.state === 'complete' && !runSaved) {
    runSaved = true;
    localStore.addRun({ modelVersion: MODEL_VERSION, complete: true, finishedAt: new Date().toISOString(), settings: currentSettings(), input: runInput,
      metrics: { tracking: session.tracking, firingTracking: session.firingTracking, angularError: session.angularError, shots: session.shots, hits: session.hits, pops: field.pops, acquired: acquisition.times.length, attempts: acquisition.attempts, acquisitionMean: acquisition.mean } });
    renderHistory();
    $('session-panel').open = true;
    $('welcome-label').textContent = 'SESSION RESULTS';
    $('welcome-description').textContent = '60-second test complete.';
    for (const [destination, source] of Object.entries({ 'result-tracking': 'tracking', 'result-firing': 'firing', 'result-shots': 'shots', 'result-pops': 'pops', 'result-error': 'angular-error', 'result-acquisition': 'acquisition-time' })) $(destination).textContent = $(source).textContent;
    $('result-acquisition-row').hidden = routine !== 'acquire';
    $('round-results').hidden = false; $('welcome').classList.add('results'); $('welcome').hidden = false;
    if (document.pointerLockElement === canvas) document.exitPointerLock();
    $('start').focus();
  }
  if (!localStore.available) $('storage-status').textContent = 'Browser storage is unavailable. Practice still works; results may not be saved.';
  const stats = summarizeFrames(frameSamples);
  if (stats) { $('fps').textContent = Math.round(stats.fps) + ' FPS'; $('frametime').textContent = 'p95 ' + stats.p95.toFixed(1) + ' ms · ' + stats.stalls + ' >25 ms / ' + frameSamples.length + ' frames'; }
}
function drawChargeRing() {
  const weapon = session.weapon, firing = weapon.phase === 'firing';
  const amount = firing ? weapon.remaining / (weaponProfile.fullBurstFrames / 60) : weapon.charge;
  const charger = weaponProfile.family === 'charger';
  $('charge-reticle').classList.toggle('charger', charger);
  const visible = !['shooter', 'blaster'].includes(weaponProfile.family) && session.state === 'running' && ['charging', 'firing'].includes(weapon.phase);
  $('charge-reticle').hidden = !visible;
  if (!visible) return;
  $('charge-inner').style.strokeDashoffset = 100 * (1 - Math.min(1, amount * (charger ? 1 : 2)));
  $('charge-outer').style.strokeDashoffset = 100 * (1 - Math.max(0, Math.min(1, (amount - 0.5) * 2)));
  $('charge-reticle').classList.toggle('discharging', firing);
  $('charge-reticle').classList.toggle('full', !firing && amount >= 1);
  $('ring-label').textContent = firing ? 'BURST' : amount >= 1 ? 'FULL CHARGE' : amount >= 0.5 ? 'SECOND CHARGE' : 'CHARGING';
}
const aimDirection = THREE ? new THREE.Vector3() : null, targetDirection = THREE ? new THREE.Vector3() : null;
function resetInkAndLayout() { ink.reset(); shooterSpread.reset(); shotSerial = burstShot = 0; layout = generateLayout(seed, field.count, radius, arcDegrees); chasePath = createChasePath(seed, arcDegrees); }
const blastColor = THREE ? new THREE.Color() : null;
const particle = THREE ? new THREE.Object3D() : null, particleForward = THREE ? new THREE.Vector3(0, 0, 1) : null;
const inkForward = THREE ? new THREE.Vector3() : null, inkRight = THREE ? new THREE.Vector3() : null, inkUp = THREE ? new THREE.Vector3() : null;
function emitInk() {
  if (session.weapon.fireFrame === 1) burstShot = 0;
  camera.getWorldDirection(inkForward); inkRight.set(1, 0, 0).applyQuaternion(camera.quaternion); inkUp.set(0, 1, 0).applyQuaternion(camera.quaternion);
  const spread = shotSpread(seed, shotSerial++, burstShot++, weaponProfile, weaponProfile.family === 'shooter' ? shooterSpread.sample(simulationFrame, weaponProfile) : undefined);
  const direction = spreadDirection(inkForward.toArray(), inkRight.toArray(), inkUp.toArray(), spread);
  // Session retains the emitted payload even if this tick resets the weapon.
  const charger = weaponProfile.family === 'charger', charge = session.lastShotCharge;
  const origin = camera.position.clone().addScaledVector(inkRight, charger ? 0 : 0.12).addScaledVector(inkUp, charger ? 0 : -0.1).addScaledVector(inkForward, 0.25);
  const spec = projectileSpec(session.weaponId, charge), speed = projectileSpeed(weaponProfile, charge) * spread.speed;
  ink.launch(origin.toArray(), direction, speed, spec.damage ?? weaponProfile.damage, spec);
}
function drawInk() {
  let count = 0;
  for (const drop of ink.drops) {
    inkForward.fromArray(drop.velocity).normalize(); particle.quaternion.setFromUnitVectors(particleForward, inkForward);
    for (let trail = 0; trail < 3; trail++) {
      const f = 1 - trail * 0.22;
      particle.position.fromArray(drop.previous).lerp(inkRight.fromArray(drop.position), f);
      const blaster = Boolean(drop.spec?.blast);
      particle.scale.set(blaster ? 0.095 - trail * 0.025 : 0.06 - trail * 0.012, blaster ? 0.095 - trail * 0.025 : 0.05 - trail * 0.01, drop.spec?.charger ? 0.9 - trail * 0.15 : blaster ? 0.13 - trail * 0.035 : 0.19 - trail * 0.04); particle.updateMatrix(); inkMesh.setMatrixAt(count++, particle.matrix);
    }
  }
  inkMesh.count = count; inkMesh.instanceMatrix.needsUpdate = true;
  let paintCount = 0, blastCount = 0, beadCount = 0;
  for (const splash of ink.splashes) {
    if (Number.isFinite(splash.blastRadius)) {
      inkUp.fromArray(splash.point);
      const visual = blastVisual(splash.age, splash.life, inkUp.distanceTo(camera.position));
      if (!visual) continue;
      // An open, camera-facing ring and eight small 3D droplets replace the solid damage-sized disc.
      particle.position.copy(inkUp); particle.quaternion.copy(camera.quaternion);
      particle.scale.setScalar(visual.radius); particle.updateMatrix(); blastRingMesh.setMatrixAt(blastCount, particle.matrix);
      blastRingMesh.setColorAt(blastCount++, blastColor.setScalar(visual.opacity));
      for (let i = 0; i < 8; i++) {
        const z = 1 - 2 * (i + 0.5) / 8, angle = i * 2.39996323 + visual.rotation;
        const radial = Math.sqrt(1 - z * z) * visual.radius;
        particle.position.set(splash.point[0] + Math.cos(angle) * radial, splash.point[1] + Math.sin(angle) * radial, splash.point[2] + z * visual.radius);
        particle.scale.setScalar(visual.bead); particle.updateMatrix(); blastMesh.setMatrixAt(beadCount++, particle.matrix);
      }
      continue;
    }
    inkUp.fromArray(splash.normal); particle.position.fromArray(splash.point).addScaledVector(inkUp, 0.015); particle.quaternion.setFromUnitVectors(particleForward, inkUp);
    const fade = splash.life < 20 ? 1 - splash.age / splash.life : Math.min(1, (splash.life - splash.age) / 24);
    particle.scale.setScalar((splash.life < 20 ? 0.16 : 0.24) * fade); particle.updateMatrix(); splashMesh.setMatrixAt(paintCount++, particle.matrix);
  }
  splashMesh.count = paintCount; splashMesh.instanceMatrix.needsUpdate = true;
  blastMesh.count = beadCount; blastMesh.instanceMatrix.needsUpdate = true;
  blastRingMesh.count = blastCount; blastRingMesh.instanceMatrix.needsUpdate = true;
  if (blastRingMesh.instanceColor) blastRingMesh.instanceColor.needsUpdate = true;
}
const projected = THREE ? new THREE.Vector3() : null;
function activeTarget() {
  const first = targetCue(motionTime, speed).slot % field.count;
  for (let i = 0; i < field.count; i++) { const index = (first + i) % field.count; if (field.targets[index].hp > 0) return index; }
  return -1;
}
function placeTargets() {
  const active = activeTarget(), cue = targetCue(motionTime, speed);
  targetMeshes.forEach((item, i) => {
    if (!targetEnabled(routine, i)) { item.mesh.visible = item.ring.visible = item.mark.visible = item.glow.visible = item.countdown.visible = false; item.label.hidden = true; return; }
    const state = field.targets[i], pos = drillTarget(routine, motionTime, speed, seed + i * 17);
    const base = layout[i];
    const position = routine === 'chase' ? chasePosition(chasePath, motionTime, speed) : targetPosition(base, pos);
    item.mesh.position.set(position.x, position.y, position.z);
    item.ring.position.copy(item.mesh.position); item.ring.quaternion.copy(camera.quaternion);
    item.mark.position.x = item.mesh.position.x; item.mark.position.z = item.mesh.position.z;
    const alive = state.hp > 0, age = state.poppedAt === null ? 0 : simulationFrame - state.poppedAt;
    item.mesh.visible = alive; item.mark.visible = alive;
    item.ring.visible = alive || age < 14;
    item.ring.material.opacity = alive ? 1 : Math.max(0, 1 - age / 14);
    item.ring.scale.setScalar(radius / 0.32 * (alive ? 1 : 1 + age / 7));
    item.ring.material.color.setHex(routine !== 'acquire' || i === active ? 0x90a1cf : 0xaaa79f);
    const designated = routine === 'acquire' && i === active && alive;
    item.ring.material.color.setHex(designated ? 0xc3d3ff : routine !== 'acquire' ? 0x90a1cf : 0xaaa79f);
    for (const cueMesh of [item.glow, item.countdown]) {
      cueMesh.visible = designated && session.state !== 'ready';
      cueMesh.position.copy(item.mesh.position); cueMesh.quaternion.copy(camera.quaternion);
    }
    item.glow.scale.setScalar(radius / 0.32);
    item.countdown.scale.setScalar(radius / 0.32 * (1 + cue.remaining * 1.15));
    item.mesh.material.color.setHex(simulationFrame - state.lastHit < 3 ? 0x90a1cf : 0xf2f0ea);
    projected.copy(item.mesh.position); projected.y += radius + 0.18; projected.project(camera);
    item.label.hidden = session.state === 'ready' || !alive || projected.z < -1 || projected.z > 1 || Math.abs(projected.x) > 1 || Math.abs(projected.y) > 1;
    item.label.style.left = (projected.x + 1) / 2 * 100 + '%'; item.label.style.top = (1 - projected.y) / 2 * 100 + '%';
    item.label.textContent = Math.round(state.hp * 10) / 10 + ' HP';
  });
}
function pickTarget() {
  camera.getWorldDirection(aimDirection); let index = -1, nearest = Infinity, error = Infinity;
  targetMeshes.forEach((item, i) => {
    if (!targetEnabled(routine, i) || field.targets[i].hp <= 0) return;
    targetDirection.copy(item.mesh.position).sub(camera.position);
    const distance = targetDirection.length(), angle = aimDirection.angleTo(targetDirection);
    error = Math.min(error, angle * 180 / Math.PI);
    if (angle <= Math.asin(Math.min(1, radius / distance)) && distance < nearest) { index = i; nearest = distance; }
  });
  return { index, error: Number.isFinite(error) ? error : 0 };
}
function frame(now) {
  requestAnimationFrame(frame);
  if (!renderer || document.hidden) return;
  if (now < nextDraw - 1) return;
  nextDraw = now > nextDraw + 100 ? now + 1000 / 60 : nextDraw + 1000 / 60;
  const interval = last ? now - last : 0; last = now;
  if (interval > 0 && interval < 1000) { frameSamples.push(interval); if (frameSamples.length > 300) frameSamples.shift(); }
  if (interval > 250 && session.state === 'running') { session.pause(); keys.clear(); }
  if (usb.device && ((motion.lastAt === null) || motion.stale(now))) {
    if (!staleShown) { $('usb-status').textContent = 'Waiting for fresh controller input'; staleShown = true; }
    if (session.state === 'running') { session.pause(); keys.clear(); }
  }
  const dt = Math.min(0.05, Math.max(0, interval / 1000));
  if (session.state === 'running') {
    yaw += ((keys.has('ArrowLeft') ? 1 : 0) - (keys.has('ArrowRight') ? 1 : 0)) * dt * sensitivity;
    pitch = Math.max(-1.3, Math.min(1.3, pitch + ((keys.has('ArrowUp') ? 1 : 0) - (keys.has('ArrowDown') ? 1 : 0)) * dt * sensitivity));
    updateAim();
  }
  if (session.state === 'running') simulationRemainder += dt;
  else simulationRemainder = 0;
  while (simulationRemainder >= 1 / 60 - 1e-9 && session.state === 'running') {
    simulationRemainder = Math.max(0, simulationRemainder - 1 / 60); simulationFrame++;
    motionTime = Math.min(session.elapsed, 60 - 1e-8); field.tick(simulationFrame, routine === 'chase' ? 18 : 90); placeTargets();
    const aim = pickTarget(); const previousShots = session.shots, previousElapsed = session.elapsed;
    session.step(1 / 60, aim.index !== -1, aim.error, false);
    if (session.shots > previousShots) emitInk();
    const colliders = targetMeshes.map((item, i) => ({ position: item.mesh.position.toArray(), alive: targetEnabled(routine, i) && field.targets[i].hp > 0 }));
    for (const impact of ink.step(colliders, radius)) {
      if (impact.index >= 0 && field.targets[impact.index].hp > 0) { session.hits++; field.hit(impact.index, simulationFrame, impact.damage); }
    }
    if (routine === 'acquire') {
      const active = activeTarget(), state = field.targets[active];
      if (state) acquisition.observe(targetCue(motionTime, speed).slot * 100000 + state.generation * 10 + active, session.elapsed - previousElapsed, aim.index === active);
    }
  }
  placeTargets(); const aim = pickTarget(), onTarget = aim.index !== -1;
  document.querySelector('.crosshair').classList.toggle('on-target', onTarget && session.state === 'running');
  $('target-state').hidden = session.state === 'running';
  $('target-state').textContent = session.state === 'running' ? (onTarget ? 'ON TARGET · FOUR HITS TO POP' : 'FIND A TARGET') : session.state === 'complete' ? 'ROUND COMPLETE' : session.state === 'paused' ? 'PAUSED · PRESS RESUME' : 'READY WHEN YOU ARE';
  const width = canvas.clientWidth, height = canvas.clientHeight;
  if (width && height && (canvas.width !== Math.floor(width * renderer.getPixelRatio()) || canvas.height !== Math.floor(height * renderer.getPixelRatio()))) { renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); }
  drawChargeRing(); drawInk();
  renderer.render(scene, camera);
  if (now - uiAt > 100) { syncUI(); uiAt = now; }
}
requestAnimationFrame(frame);

function currentSettings() {
  return cleanSettings({ controller: controllerKind, weapon: session.weaponId, routine, seed, arcDegrees, size: radius / 0.32, speed, sensitivity, gyroGain, stickGain: +$('stick-gain').value, aimMode: $('aim-mode').value, stickCurve: $('stick-curve').value, stickInvertX: $('stick-invert-x').checked, stickInvertY: $('stick-invert-y').checked, yawAxis: $('yaw-axis').value, invertX: $('invert-x').checked, invertY: $('invert-y').checked, freshLayout: $('fresh-layout').checked });
}
function renderHistory() {
  const list = $('history-list'); list.replaceChildren();
  const history = localStore.history().slice(-5).reverse();
  if (!history.length) { const row = document.createElement('li'); row.textContent = 'No completed rounds yet.'; list.append(row); }
  for (const run of history) {
    const row = document.createElement('li'), title = document.createElement('strong'), details = document.createElement('span'), m = run.metrics;
    title.textContent = `${WEAPONS[run.settings.weapon].name} / ${ROUTINES[run.settings.routine].title}`;
    details.textContent = `${new Date(run.finishedAt).toLocaleString()} · ${m.pops ?? 0} pops · ${m.hits ?? 0}/${m.shots ?? 0} hits · ${m.tracking === null ? '—' : Math.round(m.tracking * 100) + '%'} tracking · seed ${run.settings.seed}`;
    row.append(title, details); list.append(row);
  }
}
const saved = localStore.settings();
for (const [id, key] of Object.entries({ 'controller-kind': 'controller', weapon: 'weapon', routine: 'routine', seed: 'seed', size: 'size', 'target-arc': 'arcDegrees', speed: 'speed', sensitivity: 'sensitivity', 'gyro-gain': 'gyroGain', 'stick-gain': 'stickGain', 'aim-mode': 'aimMode', 'stick-curve': 'stickCurve', 'yaw-axis': 'yawAxis' })) $(id).value = saved[key];
for (const [id, key] of Object.entries({ 'invert-x': 'invertX', 'invert-y': 'invertY', 'stick-invert-x': 'stickInvertX', 'stick-invert-y': 'stickInvertY', 'fresh-layout': 'freshLayout' })) $(id).checked = saved[key];
controllerKind = saved.controller; usb = adapters[controllerKind]; controllerUI(); $('usb-status').textContent = 'Connect ' + controllerNames[controllerKind] + ' to begin.';
session.setWeapon(saved.weapon); weaponProfile = WEAPONS[saved.weapon]; routine = saved.routine; seed = saved.seed; arcDegrees = saved.arcDegrees; radius = 0.32 * saved.size; speed = saved.speed; sensitivity = saved.sensitivity; gyroGain = saved.gyroGain;
for (const item of targetMeshes) item.mesh.scale.setScalar(saved.size);
for (const [id, value] of Object.entries({ 'size-value': saved.size, 'speed-value': speed, 'sens-value': sensitivity, 'gyro-value': gyroGain, 'stick-value': saved.stickGain })) $(id).textContent = value.toFixed(1) + '×';
$('arc-value').textContent = arcDegrees + '°';
for (const id of ['weapon', 'routine', 'seed', 'size', 'target-arc', 'speed', 'sensitivity', 'gyro-gain', 'stick-gain', 'aim-mode', 'stick-curve', 'yaw-axis', 'invert-x', 'invert-y', 'stick-invert-x', 'stick-invert-y', 'fresh-layout']) {
  $(id).addEventListener('change', () => { localStore.saveSettings(currentSettings()); if (!localStore.available) syncUI(); });
}
$('export-settings').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ app: 'SteadySquid 0.1', modelVersion: MODEL_VERSION, settings: currentSettings() }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = 'steadysquid-settings.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
});
for (const id of ['gyro-gain', 'stick-gain', 'aim-mode', 'stick-curve', 'yaw-axis', 'invert-x', 'invert-y', 'stick-invert-x', 'stick-invert-y']) $(id).addEventListener('change', () => { inputCheck.cancel('Settings changed. Measure again with the new settings.'); resetRoutine(); });
renderHistory(); resetRoutine();
