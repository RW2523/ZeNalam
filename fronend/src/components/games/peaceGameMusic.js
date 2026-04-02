/**
 * Shared Web Audio for peaceful games — calm pad + pentatonic chimes.
 * One AudioContext; stop when leaving a game screen.
 */

let ctx = null;
let masterGain = null;
let padOscillators = [];
let padGain = null;

const PENTATONIC = [261.63, 293.66, 329.63, 392.0, 440.0];

function ensureCtx() {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx || ctx.state === 'closed') {
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.16;
    masterGain.connect(ctx.destination);
  }
  return ctx;
}

function teardownPad() {
  while (padOscillators.length) {
    const { osc } = padOscillators.pop();
    try {
      osc.stop();
      osc.disconnect();
    } catch {
      /* ignore */
    }
  }
  padGain = null;
}

export async function stopPeaceGameMusic() {
  teardownPad();
  if (ctx && masterGain) {
    try {
      const t = ctx.currentTime;
      masterGain.gain.cancelScheduledValues(t);
      masterGain.gain.setValueAtTime(masterGain.gain.value, t);
      masterGain.gain.linearRampToValueAtTime(0, t + 0.4);
    } catch {
      /* ignore */
    }
  }
  window.setTimeout(() => {
    try {
      if (ctx && ctx.state !== 'closed') ctx.close();
    } catch {
      /* ignore */
    }
    ctx = null;
    masterGain = null;
  }, 450);
}

/**
 * Soft sustained “fresh air” pad (wide fifths + octave).
 */
export async function startFlowCalmPad() {
  const c = ensureCtx();
  if (!c || !masterGain) return;
  teardownPad();
  await c.resume();

  padGain = c.createGain();
  padGain.gain.setValueAtTime(0, c.currentTime);
  padGain.connect(masterGain);

  const freqs = [174.61, 220.0, 261.63, 329.63];
  const amps = [0.04, 0.035, 0.03, 0.025];
  for (let i = 0; i < freqs.length; i++) {
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freqs[i];
    const g = c.createGain();
    g.gain.value = amps[i];
    osc.connect(g);
    g.connect(padGain);
    osc.start();
    padOscillators.push({ osc, gain: g });
  }

  const t = c.currentTime;
  padGain.gain.linearRampToValueAtTime(0.55, t + 2.5);
}

/** Brighten pad while user draws (0 = idle, 1 = active). */
export function setFlowPadEnergy(level) {
  if (!padGain || !ctx) return;
  const t = ctx.currentTime;
  const target = 0.35 + Math.min(1, Math.max(0, level)) * 0.55;
  try {
    padGain.gain.cancelScheduledValues(t);
    padGain.gain.setTargetAtTime(target, t, 0.08);
  } catch {
    /* ignore */
  }
}

/** Short blooming chime on each interaction. */
export function playBloomChime(bloomIndex = 0) {
  const c = ensureCtx();
  if (!c || !masterGain) return;
  c.resume().catch(() => {});

  const f = PENTATONIC[bloomIndex % PENTATONIC.length];
  const osc = c.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = f;
  const g = c.createGain();
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(0.11, c.currentTime + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0008, c.currentTime + 0.95);
  osc.connect(g);
  g.connect(masterGain);
  osc.start();
  osc.stop(c.currentTime + 1.0);
}
