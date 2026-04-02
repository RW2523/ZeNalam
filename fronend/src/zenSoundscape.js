/**
 * Calm Studio soundscapes: procedural shimmer (Web Audio) + looping MP3s
 * in /public/audio/calm (see CREDITS.txt; refresh via scripts/download-calm-audio.sh).
 */

const STORAGE_MODE = 'zen_sound_mode';
const LEGACY_AMBIENT = 'zen_ambient';

/** @type {AudioContext | null} */
let audioContext = null;
/** @type {GainNode | null} */
let masterGain = null;
const oscillators = [];

/** @type {HTMLAudioElement | null} */
let loopAudio = null;

const PUBLIC = typeof process !== 'undefined' && process.env.PUBLIC_URL ? process.env.PUBLIC_URL : '';

export const ZEN_SOUND_OPTIONS = [
  { id: 'off', label: 'Sound off', kind: 'off' },
  { id: 'shimmer', label: 'Soft shimmer', kind: 'synth' },
  { id: 'rain', label: 'Rain', kind: 'file', file: 'rain-soft.mp3', volume: 0.32 },
  { id: 'white', label: 'White noise', kind: 'file', file: 'white-noise.mp3', volume: 0.22 },
  { id: 'pink', label: 'Pink calm', kind: 'file', file: 'pink-calm.mp3', volume: 0.3 },
  { id: 'pad', label: 'Nature calm', kind: 'file', file: 'nature-calm.mp3', volume: 0.4 },
];

function fileUrl(name) {
  return `${PUBLIC}/audio/calm/${name}`;
}

function migrateLegacySoundPrefs() {
  try {
    if (!sessionStorage.getItem(STORAGE_MODE) && sessionStorage.getItem(LEGACY_AMBIENT) === '1') {
      sessionStorage.setItem(STORAGE_MODE, 'shimmer');
    }
  } catch {
    /* private mode */
  }
}

export function getZenSoundMode() {
  migrateLegacySoundPrefs();
  try {
    const v = sessionStorage.getItem(STORAGE_MODE);
    if (v && ZEN_SOUND_OPTIONS.some((o) => o.id === v)) return v;
  } catch {
    /* ignore */
  }
  return 'off';
}

export function setZenSoundMode(mode) {
  try {
    sessionStorage.setItem(STORAGE_MODE, mode);
    if (mode === 'off') {
      sessionStorage.removeItem(LEGACY_AMBIENT);
    } else {
      sessionStorage.setItem(LEGACY_AMBIENT, '1');
    }
  } catch {
    /* ignore */
  }
}

function teardownSynth() {
  while (oscillators.length) {
    const { osc } = oscillators.pop();
    try {
      osc.stop();
      osc.disconnect();
    } catch {
      /* ignore */
    }
  }
  if (audioContext && masterGain) {
    try {
      const t = audioContext.currentTime;
      masterGain.gain.cancelScheduledValues(t);
      masterGain.disconnect();
    } catch {
      /* ignore */
    }
  }
  try {
    if (audioContext) {
      audioContext.close();
    }
  } catch {
    /* ignore */
  }
  audioContext = null;
  masterGain = null;
}

function stopLoopFile() {
  if (!loopAudio) return;
  try {
    loopAudio.pause();
    loopAudio.src = '';
    loopAudio.load();
  } catch {
    /* ignore */
  }
  loopAudio = null;
}

export function stopZenSoundscape() {
  stopLoopFile();
  teardownSynth();
}

export function isZenSoundscapeActive() {
  if (loopAudio && !loopAudio.paused) return true;
  return oscillators.length > 0 && audioContext?.state === 'running';
}

async function startSynth() {
  if (typeof window === 'undefined') return;
  stopZenSoundscape();

  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;

  audioContext = new AC();
  masterGain = audioContext.createGain();
  masterGain.gain.setValueAtTime(0, audioContext.currentTime);
  masterGain.connect(audioContext.destination);

  const freqs = [110, 164.81, 196.0];
  for (const f of freqs) {
    const osc = audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = f;
    const g = audioContext.createGain();
    g.gain.value = 0.055;
    osc.connect(g);
    g.connect(masterGain);
    osc.start();
    oscillators.push({ osc, gain: g });
  }

  await audioContext.resume();
  const t = audioContext.currentTime;
  masterGain.gain.linearRampToValueAtTime(0.032, t + 2.2);
}

async function startLoopFile(filename, volume = 0.36) {
  if (typeof window === 'undefined') return;
  stopZenSoundscape();

  const url = fileUrl(filename);
  const el = new Audio(url);
  el.loop = true;
  el.volume = Math.min(1, Math.max(0, volume));
  el.preload = 'auto';
  loopAudio = el;
  await el.play();
}

/**
 * @param {string} modeId — 'off' | option id from ZEN_SOUND_OPTIONS
 * @returns {Promise<void>}
 */
export async function applyZenSoundMode(modeId) {
  const opt = ZEN_SOUND_OPTIONS.find((o) => o.id === modeId);
  if (!opt || opt.kind === 'off') {
    setZenSoundMode('off');
    stopZenSoundscape();
    return;
  }

  setZenSoundMode(modeId);

  try {
    if (opt.kind === 'synth') {
      await startSynth();
    } else if (opt.kind === 'file' && opt.file) {
      await startLoopFile(opt.file, typeof opt.volume === 'number' ? opt.volume : 0.36);
    }
  } catch (e) {
    stopZenSoundscape();
    setZenSoundMode('off');
    throw e;
  }
}

/**
 * Resume current mode from storage (e.g. after entering Zen routes).
 */
export async function resumeZenSoundFromStorage() {
  const mode = getZenSoundMode();
  if (mode === 'off') {
    stopZenSoundscape();
    return;
  }
  if (isZenSoundscapeActive()) return;
  try {
    await applyZenSoundMode(mode);
  } catch {
    /* autoplay blocked or missing file */
  }
}
