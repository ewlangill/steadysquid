import { WEAPONS } from './weapons.js?v=98ca43af8df8e2a9';
export const MODEL_VERSION = '2026-10-16-preview-1';
const SETTINGS_KEY = 'steadysquid.settings.v1', HISTORY_KEY = 'steadysquid.history.v1';
export const HISTORY_LIMIT = 50;
export const DEFAULT_SETTINGS = Object.freeze({ weapon: 'heavy', routine: 'smooth', seed: 1, size: 1, speed: 1, sensitivity: 1, gyroGain: 1, yawAxis: 'z', invertX: false, invertY: true, freshLayout: true });
const number = (v, fallback, min, max, step = 0.1) => typeof v === 'number' && Number.isFinite(v) ? Number((Math.round(Math.max(min, Math.min(max, v)) / step) * step).toFixed(6)) : fallback;
export function cleanSettings(raw = {}) {
  const s = raw && typeof raw === 'object' ? raw : {}, d = DEFAULT_SETTINGS;
  return { weapon: Object.hasOwn(WEAPONS, s.weapon) ? s.weapon : d.weapon,
    routine: ['smooth', 'reactive', 'acquire', 'transfer'].includes(s.routine) ? s.routine : d.routine,
    seed: number(s.seed, d.seed, 1, 9999, 1), size: number(s.size, d.size, 0.6, 1.6), speed: number(s.speed, d.speed, 0.4, 2), sensitivity: number(s.sensitivity, d.sensitivity, 0.2, 2), gyroGain: number(s.gyroGain, d.gyroGain, 0.2, 4),
    yawAxis: ['y', 'z'].includes(s.yawAxis) ? s.yawAxis : d.yawAxis,
    ...Object.fromEntries(['invertX', 'invertY', 'freshLayout'].map(k => [k, typeof s[k] === 'boolean' ? s[k] : d[k]])) };
}
export function compatibilityKey(settings, input) { return JSON.stringify([MODEL_VERSION, cleanSettings(settings), input === 'progcc' ? 'progcc' : 'mouse-keyboard']); }
function cleanRun(raw) {
  if (!raw || raw.modelVersion !== MODEL_VERSION || raw.complete !== true || typeof raw.finishedAt !== 'string' || !Number.isFinite(Date.parse(raw.finishedAt))) return null;
  const settings = cleanSettings(raw.settings), input = raw.input === 'progcc' ? 'progcc' : 'mouse-keyboard';
  const metrics = {};
  for (const key of ['tracking', 'firingTracking', 'angularError', 'shots', 'hits', 'pops', 'acquired', 'attempts', 'acquisitionMean']) {
    const v = raw.metrics?.[key]; metrics[key] = typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : null;
  }
  return { modelVersion: MODEL_VERSION, complete: true, finishedAt: raw.finishedAt, settings, input, compatibility: compatibilityKey(settings, input), metrics };
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
