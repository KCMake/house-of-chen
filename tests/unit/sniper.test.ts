import { describe, expect, it } from 'vitest';
import { allowed, apply, block, naiveOpen, ping, state, waitlistOpen, type Seats } from '../../src/demos/sniper/model';

const seats = (capacity: number, taken: number, waitCapacity = 0, waitTaken = 0): Seats => ({ capacity, taken, waitCapacity, waitTaken });

// The same situations as tests/test_models.py covers in the CourseSniper repo.
describe('the seat rule', () => {
  it('is open only when there are more empty seats than people waiting', () => {
    expect(state(seats(36, 35))).toBe('open');
    expect(state(seats(36, 35, 10, 1))).toBe('waitlist');
    expect(state(seats(36, 34, 10, 1))).toBe('open');
  });

  it('is waitlist open when the waitlist has room, and full when it does not', () => {
    expect(state(seats(36, 36, 10, 9))).toBe('waitlist');
    expect(state(seats(36, 36, 10, 10))).toBe('closed');
    expect(state(seats(36, 36))).toBe('closed');
  });

  it('counts over-enrollment against the waitlist', () => {
    expect(waitlistOpen(seats(36, 38, 3, 0))).toBe(true);
    expect(waitlistOpen(seats(36, 38, 2, 0))).toBe(false);
  });

  it('disagrees with a bot that only looks for an empty seat', () => {
    const held = seats(36, 35, 10, 10);
    expect(naiveOpen(held)).toBe(true);
    expect(state(held)).toBe('closed');
  });
});

describe('the demo', () => {
  const start = seats(36, 36, 10, 9);

  it('pings on a change of state and stays quiet otherwise', () => {
    const full = apply(start, 'join');
    expect(ping(start, full)).toBe('WAITLIST OPEN → FULL');
    const dropped = apply(full, 'drop');
    expect(ping(full, dropped)).toBeNull();
  });

  it('only allows what registration would allow', () => {
    expect(allowed(start, 'enroll')).toBe(false);
    expect(allowed(start, 'seat')).toBe(false);
    expect(apply(start, 'enroll')).toBe(start);
    const dropped = apply(start, 'drop');
    expect(allowed(dropped, 'seat')).toBe(true);
    expect(apply(dropped, 'seat')).toEqual(seats(36, 36, 10, 8));
  });

  it("lays the stats out like the bot's own message", () => {
    expect(block('ECE 3741 - L03', start).split('\n')).toEqual([
      'ECE 3741 - L03',
      'seats:            36',
      'taken:            36',
      'vacant:            0',
      'waitlist open:   yes',
      'waitlist seats:   10',
      'waitlist taken:    9',
      'waitlist vacant:   1',
    ]);
    expect(block('X', seats(36, 35, 10, 10))).toContain('note: vacant seats are held for the waitlist');
  });
});
