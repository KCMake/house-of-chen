/**
 * The physics behind the things you can touch: the kitchen door, the lazy Susan, and the
 * phone handset. Plain functions of position, velocity, and time, so they can be tested
 * without a browser.
 */

/** One step of a damped spring pulling `x` toward `target`. Semi-implicit Euler, stable at 60 fps. */
export function spring(
  x: number,
  v: number,
  target: number,
  stiffness: number,
  damping: number,
  dt: number,
): [number, number] {
  const accel = -stiffness * (x - target) - damping * v;
  const nextV = v + accel * dt;
  return [x + nextV * dt, nextV];
}

/** Speed left after coasting for `dt` seconds against exponential friction. */
export function coast(v: number, rate: number, dt: number): number {
  return v * Math.exp(-rate * dt);
}

export function clamp(value: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, value));
}

/** The detent nearest `angle` when detents sit every `step` degrees. */
export function nearestDetent(angle: number, step: number): number {
  return Math.round(angle / step) * step;
}

/** Which of `count` dishes is in front of you when the table is turned to `angle`. */
export function dishAtFront(angle: number, step: number, count: number): number {
  const turns = Math.round(angle / step);
  return (((-turns) % count) + count) % count;
}

export interface Sample {
  t: number;
  value: number;
}

/**
 * How fast something was moving when it was let go, from recent pointer samples.
 * Two pointer events can land a millisecond apart, which once turned a gentle flick into
 * thousands of degrees a second and spun the lazy Susan 56 times. So the time span has a
 * floor of one frame, and the result is clamped.
 */
export function releaseSpeed(samples: Sample[], maxSpeed: number, windowMs = 80): number {
  if (samples.length < 2) return 0;
  const last = samples[samples.length - 1];
  const recent = samples.filter((s) => last.t - s.t <= windowMs);
  const first = recent.length > 1 ? recent[0] : samples[samples.length - 2];
  const span = Math.max(16, last.t - first.t);
  const speed = ((last.value - first.value) / span) * 1000;
  return clamp(speed, -maxSpeed, maxSpeed);
}

/** Deterministic pseudo-random numbers from a string, so a stamp lands at the same angle every visit. */
export function seeded(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let state = h >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
