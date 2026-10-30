import { WEAPONS } from './weapons.js?v=d652a13cf9d5d6d6';
export const MODEL_VERSION = '2026-10-20-camera-12';
const SETTINGS_KEY = 'steadysquid.settings.v1', HISTORY_KEY = 'steadysquid.history.v1';
export const HISTORY_LIMIT = 50;
export const DEFAULT_SETTINGS = Object.freeze({ controller: 'progcc', weapon: 'heavy', routine: 'smooth', seed: 1, arcDegrees: 120, size: 1, speed: 1, sensitivity: 1, gyroGain: 1, stickGain: 1, aimMode: 'motion', stickCurve: 'linear', stickInvertX: false, stickInvertY: false, yawAxis: 'z', invertX: false, invertY: true, freshLayout: true });
const number = (v, fallback, min, max, step = 0.1) => typeof v === 'number' && Number.isFinite(v) ? Number((Math.round(Math.max(min, Math.min(max, v)) / step) * step).toFixed(6)) : fallback;
export function cleanSettings(raw = {}) {
  const s = raw && typeof raw === 'object' ? raw : {}, d = DEFAULT_SETTINGS;
  return { controller: ['progcc', 'switchpro', 'gamepad'].includes(s.controller) ? s.controller : d.controller, weapon: Object.hasOwn(WEAPONS, s.weapon) ? s.weapon : d.weapon,
    routine: ['smooth', 'reactive', 'acquire', 'transfer', 'chase'].includes(s.routine) ? s.routine : d.routine,
    seed: number(s.seed, d.seed, 1, 9999, 1), arcDegrees: number(s.arcDegrees, d.arcDegrees, 20, 180, 5), size: number(s.size, d.size, 0.6, 1.6), speed: number(s.speed, d.speed, 0.4, 2), sensitivity: number(s.sensitivity, d.sensitivity, 0.2, 2), gyroGain: number(s.gyroGain, d.gyroGain, 0.2, 4),
    stickGain: number(s.stickGain, d.stickGain, 0.2, 4), aimMode: ['motion', 'combined', 'sticks'].includes(s.aimMode) ? s.aimMode : d.aimMode, stickCurve: ['linear', 'precision'].includes(s.stickCurve) ? s.stickCurve : d.stickCurve,
    yawAxis: ['y', 'z'].includes(s.yawAxis) ? s.yawAxis : d.yawAxis,
    ...Object.fromEntries(['invertX', 'invertY', 'stickInvertX', 'stickInvertY', 'freshLayout'].map(k => [k, typeof s[k] === 'boolean' ? s[k] : d[k]])) };
}
export function compatibilityKey(settings, input, modelVersion = MODEL_VERSION) { return JSON.stringify([modelVersion, cleanSettings(settings), ['progcc', 'switchpro', 'gamepad'].includes(input) ? input : 'mouse-keyboard']); }
function cleanRun(raw) {
  if (!raw || ![MODEL_VERSION, '2026-10-19-heavy-angle-11', '2026-10-19-heavy-spread-10', '2026-10-19-heavy-rng-9', '2026-10-18-field-8', '2026-10-17-heavy-7', '2026-10-17-payload-6', '2026-10-17-input-5', '2026-10-17-ballistics-4', '2026-10-16-shooter-3', '2026-10-16-arc-2', '2026-10-16-preview-1'].includes(raw.modelVersion) || raw.complete !== true || typeof raw.finishedAt !== 'string' || !Number.isFinite(Date.parse(raw.finishedAt))) return null;
  const settings = cleanSettings(raw.settings), input = ['progcc', 'switchpro', 'gamepad'].includes(raw.input) ? raw.input : 'mouse-keyboard';
  const metrics = {};
  for (const key of ['tracking', 'firingTracking', 'angularError', 'shots', 'hits', 'pops', 'acquired', 'attempts', 'acquisitionMean']) {
    const v = raw.metrics?.[key]; metrics[key] = typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : null;
  }
  return { modelVersion: raw.modelVersion, complete: true, finishedAt: raw.finishedAt, settings, input, compatibility: compatibilityKey(settings, input, raw.modelVersion), metrics };
}
export function createLocalStore(storage) {
  let available = true;
  const read = (key, fallback) => { try { const value = storage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { available = false; return fallback; } };
  const write = (key, value) => { try { storage.setItem(key, JSON.stringify(value)); return true; } catch { available = false; return false; } };
  return {
    get available() { return available; },
    settings() { return cleanSettings(read(SETTINGS_KEY, {})); },
    saveSettings(settings) { return write(SETTINGS_KEY, cleanSettings(settings)); },
    history() { const rows = read(HISTORY_KEY, []); return Array.isArray(rows) ? rows.map(cleanRun).filter(Boolean).slice(-HISTORY_LIMIT) : []; },
    addRun(raw) { const run = cleanRun(raw); if (!run) return false; const history = this.history(); history.push(run); return write(HISTORY_KEY, history.slice(-HISTORY_LIMIT)); },
  };
}
