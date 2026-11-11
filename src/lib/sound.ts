/**
 * Synthesized stand-ins for the restaurant's sounds. Off by default. The switch in the sign
 * turns them on, and the choice is remembered in this browser only. Recordings from the real
 * restaurant will replace these.
 */
export type Cue = 'tick' | 'door' | 'print' | 'rip' | 'stamp' | 'crack' | 'ding' | 'hang';

const KEY = 'hoc:sound';
let enabled = false;
let ctx: AudioContext | null = null;

try {
  enabled = localStorage.getItem(KEY) === 'on';
} catch {
  enabled = false;
}

export function soundOn(): boolean {
  return enabled;
}

export function setSound(on: boolean): void {
  enabled = on;
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    // Storage can be blocked. The switch still works for this visit.
  }
  if (on) context();
}

function context(): AudioContext | null {
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function envelope(c: AudioContext, at: number, peak: number, decay: number): GainNode {
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(peak, at + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, at + decay);
  g.connect(c.destination);
  return g;
}

function tone(c: AudioContext, at: number, type: OscillatorType, from: number, to: number, peak: number, decay: number): void {
  const o = c.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(from, at);
  o.frequency.exponentialRampToValueAtTime(to, at + decay);
  o.connect(envelope(c, at, peak, decay));
  o.start(at);
  o.stop(at + decay + 0.02);
}

function hiss(c: AudioContext, at: number, type: BiquadFilterType, from: number, to: number, peak: number, decay: number): void {
  const buffer = c.createBuffer(1, Math.ceil(c.sampleRate * (decay + 0.05)), c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = type;
  filter.frequency.setValueAtTime(from, at);
  filter.frequency.exponentialRampToValueAtTime(to, at + decay);
  src.connect(filter);
  filter.connect(envelope(c, at, peak, decay));
  src.start(at);
  src.stop(at + decay + 0.05);
}

export function play(cue: Cue): void {
  if (!enabled) return;
  const c = context();
  if (!c) return;
  const t = c.currentTime + 0.01;
  switch (cue) {
    case 'tick':
      tone(c, t, 'triangle', 1500, 420, 0.12, 0.045);
      break;
    case 'door':
      tone(c, t, 'sine', 95, 55, 0.35, 0.18);
      hiss(c, t, 'bandpass', 900, 300, 0.12, 0.3);
      break;
    case 'print':
      for (let i = 0; i < 16; i++) tone(c, t + i * 0.055, 'square', 2200, 1800, 0.035, 0.03);
      break;
    case 'rip':
      hiss(c, t, 'bandpass', 3200, 700, 0.3, 0.24);
      break;
    case 'stamp':
      tone(c, t, 'sine', 140, 60, 0.4, 0.12);
      hiss(c, t, 'highpass', 2500, 1500, 0.08, 0.04);
      break;
    case 'crack':
      hiss(c, t, 'highpass', 1800, 900, 0.35, 0.07);
      hiss(c, t + 0.05, 'bandpass', 2400, 800, 0.18, 0.09);
      break;
    case 'ding':
      tone(c, t, 'sine', 1318, 1310, 0.22, 1.2);
      tone(c, t, 'sine', 2637, 2630, 0.07, 0.8);
      break;
    case 'hang':
      tone(c, t, 'sine', 180, 90, 0.3, 0.1);
      tone(c, t + 0.06, 'square', 900, 700, 0.03, 0.05);
      break;
  }
}
