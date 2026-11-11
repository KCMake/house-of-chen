import { describe, expect, it } from 'vitest';
import { clamp, coast, dishAtFront, nearestDetent, releaseSpeed, seeded, spring } from '../../src/lib/physics';

function settle(target: number, stiffness: number, damping: number, seconds = 6) {
  let x = 0;
  let v = 0;
  let overshoot = 0;
  for (let t = 0; t < seconds; t += 1 / 60) {
    [x, v] = spring(x, v, target, stiffness, damping, 1 / 60);
    overshoot = Math.max(overshoot, x - target);
  }
  return { x, v, overshoot };
}

describe('spring', () => {
  it('settles on its target', () => {
    const door = settle(83, 60, 11);
    expect(door.x).toBeCloseTo(83, 2);
    expect(Math.abs(door.v)).toBeLessThan(0.01);
  });

  it('swings past its target first when lightly damped, like a kitchen door', () => {
    const door = settle(10, 44, 3.2);
    expect(door.overshoot).toBeGreaterThan(2);
    expect(door.x).toBeCloseTo(10, 1);
  });
});

describe('coast', () => {
  it('loses speed to friction and never reverses', () => {
    const after = coast(1000, 1.15, 1);
    expect(after).toBeLessThan(1000);
    expect(after).toBeGreaterThan(0);
  });
});

describe('lazy Susan', () => {
  it('snaps to the nearest detent', () => {
    expect(nearestDetent(31, 60)).toBe(60);
    expect(nearestDetent(-29, 60) + 0).toBe(0);
    expect(nearestDetent(-91, 60)).toBe(-120);
  });

  it('knows which dish is in front', () => {
    expect(dishAtFront(0, 60, 6)).toBe(0);
    expect(dishAtFront(-60, 60, 6)).toBe(1);
    expect(dishAtFront(60, 60, 6)).toBe(5);
    expect(dishAtFront(-420, 60, 6)).toBe(1);
  });
});

describe('releaseSpeed', () => {
  it('measures an ordinary flick', () => {
    const samples = [
      { t: 0, value: 0 },
      { t: 16, value: 8 },
      { t: 32, value: 16 },
    ];
    expect(releaseSpeed(samples, 1600)).toBeCloseTo(500);
  });

  it("doesn't turn two events a millisecond apart into 56 spins", () => {
    const samples = [
      { t: 100, value: 0 },
      { t: 101, value: 60 },
    ];
    expect(releaseSpeed(samples, 1600)).toBe(1600);
    expect(releaseSpeed(samples, 1e9)).toBe(3750);
  });

  it('only looks at the last moment of the drag', () => {
    const samples = [
      { t: 0, value: 0 },
      { t: 500, value: 300 },
      { t: 532, value: 300 },
    ];
    expect(releaseSpeed(samples, 1600)).toBe(0);
  });

  it('is zero with fewer than two samples', () => {
    expect(releaseSpeed([{ t: 0, value: 5 }], 1600)).toBe(0);
  });
});

describe('clamp and seeded', () => {
  it('clamps', () => {
    expect(clamp(5, 0, 3)).toBe(3);
    expect(clamp(-5, 0, 3)).toBe(0);
  });

  it('repeats for the same seed and stays in range', () => {
    const a = seeded('free-curb-atl');
    const b = seeded('free-curb-atl');
    for (let i = 0; i < 20; i++) {
      const x = a();
      expect(x).toBe(b());
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
    expect(seeded('quill')()).not.toBe(seeded('tuck')());
  });
});
