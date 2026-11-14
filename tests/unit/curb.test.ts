import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as H from '../../src/demos/curb/hours';
import { distanceSq, hourName, nextOn, paintAt, tally, timeName, unpack, type CurbFile } from '../../src/demos/curb/model';
import { pack } from '../../scripts/make-curb-data.mjs';

const at = (y: number, m: number, d: number, h: number, mi = 0) => ({ y, m, d, h, mi });
const TUE = [2026, 11, 10] as const; // a Tuesday
const SAT = [2026, 11, 14] as const;
const SUN = [2026, 11, 8] as const;

// The same cases as tests/hours.test.js in the Free Curb ATL repo, so the port can't drift.
describe('meter hours', () => {
  it('puts floating holidays on the right day', () => {
    for (const [y, mlk, memorial, labor, thanks] of [[2026, 19, 25, 7, 26], [2027, 18, 31, 6, 25]]) {
      const h = H.holidays(y);
      expect(h[`1-${mlk}`]).toBe('Martin Luther King Jr. Day');
      expect(h[`5-${memorial}`]).toBe('Memorial Day');
      expect(h[`9-${labor}`]).toBe('Labor Day');
      expect(h[`11-${thanks}`]).toBe('Thanksgiving');
      expect(h[`11-${thanks + 1}`]).toBe('the day after Thanksgiving');
    }
  });

  it('runs meters Monday to Saturday, 7 AM to 10 PM', () => {
    expect(H.metersOff(at(...TUE, 14))).toBe(false);
    expect(H.metersOff(at(...TUE, 6, 59))).toBe(true);
    expect(H.metersOff(at(...TUE, 7))).toBe(false);
    expect(H.metersOff(at(...TUE, 21, 59))).toBe(false);
    expect(H.metersOff(at(...TUE, 22))).toBe(true);
    expect(H.metersOff(at(...SAT, 12))).toBe(false);
    expect(H.metersOff(at(...SUN, 12))).toBe(true);
  });

  it('turns meters off on city holidays', () => {
    expect(H.metersOff(at(2026, 11, 11, 12))).toBe(true); // Veterans Day, a Wednesday
    expect(H.metersOff(at(2026, 11, 27, 12))).toBe(true); // day after Thanksgiving
    expect(H.metersOff(at(2026, 12, 24, 12))).toBe(false); // Christmas Eve is not a holiday
  });

  it("lets a block's own end hour override 10 PM", () => {
    expect(H.metersOff(at(...TUE, 19), 19)).toBe(true);
    expect(H.metersOff(at(...TUE, 18, 59), 19)).toBe(false);
    expect(H.metersOff(at(...TUE, 19))).toBe(false);
  });

  it('opens evening-only blocks from 7 PM to 7 AM', () => {
    expect(H.eveningOpen(at(...TUE, 18, 59))).toBe(false);
    expect(H.eveningOpen(at(...TUE, 19))).toBe(true);
    expect(H.eveningOpen(at(...TUE, 6))).toBe(true);
    expect(H.eveningOpen(at(...TUE, 7))).toBe(false);
  });

  it('turns blocks free when their rule lifts', () => {
    const day = at(...TUE, 14), evening = at(...TUE, 20), sunday = at(...SUN, 12);
    const meter = { status: 'paid', timed: true };
    expect(H.effectiveStatus(meter, day)).toBe('paid');
    expect(H.effectiveStatus(meter, evening)).toBe('paid');
    expect(H.effectiveStatus(meter, sunday)).toBe('freenow');
    expect(H.effectiveStatus({ status: 'paid', timed: true, until: 19 }, evening)).toBe('freenow');
    expect(H.effectiveStatus({ status: 'paid', timed: false }, sunday)).toBe('paid');
    expect(H.effectiveStatus({ status: 'night' }, day)).toBe('check');
    expect(H.effectiveStatus({ status: 'night' }, evening)).toBe('freenow');
    expect(H.effectiveStatus({ status: 'free' }, day)).toBe('free');
  });

  it('converts an instant to Atlanta time on both sides of daylight saving', () => {
    expect(H.atlNow(new Date('2026-07-01T16:30:00Z'))).toEqual(at(2026, 7, 1, 12, 30));
    expect(H.atlNow(new Date('2026-12-01T16:30:00Z'))).toEqual(at(2026, 12, 1, 11, 30));
  });
});

describe('the curb data', () => {
  const file = JSON.parse(readFileSync('public/demo/curbs.json', 'utf8')) as CurbFile;
  const blocks = unpack(file);

  it('has every block, each with a line to draw', () => {
    expect(blocks).toHaveLength(2035);
    for (const b of blocks) {
      expect(b.points.length, b.street).toBeGreaterThanOrEqual(4);
      expect(b.points.length % 2, b.street).toBe(0);
    }
  });

  it("adds up to the numbers in Free Curb ATL's write-up", () => {
    expect(Math.round(blocks.reduce((sum, b) => sum + b.metres, 0) / 1000)).toBe(285);
    expect(Math.round(tally(blocks, at(...TUE, 14)).freeKm)).toBe(120);
    expect(Math.round(tally(blocks, at(...SUN, 20)).freeKm)).toBe(171);
  });

  it('only counts curb as unlocked when a rule is off', () => {
    expect(tally(blocks, at(...TUE, 14)).unlockedKm).toBe(0);
    expect(tally(blocks, at(...SUN, 14)).unlockedKm).toBeGreaterThan(45);
  });

  it('paints a switched-off meter the same as a free curb', () => {
    const meter = blocks.find((b) => b.status === 'paid' && b.timed)!;
    expect(paintAt(meter, at(...TUE, 14))).toBe('paid');
    expect(paintAt(meter, at(...SUN, 14))).toBe('free');
  });
});

describe('packing', () => {
  it('stores coordinates as whole numbers from the south-west corner', () => {
    const packed = pack({
      features: [
        { properties: { id: 1, name: 'A St', block: '1–9', status: 'paid', timed: true, len: 80, until: 19 }, geometry: { coordinates: [[-84.4, 33.7], [-84.39, 33.71]] } },
        { properties: { id: 2, name: 'B St', block: '', status: 'free', timed: false, len: 50 }, geometry: { coordinates: [[-84.395, 33.705], [-84.39, 33.7]] } },
      ],
    });
    expect(packed.blocks[0]).toEqual([1, 1, 19, 80, 'A St', '1–9', [0, 0, 1000, 1000]]);
    expect(packed.blocks[1][6]).toEqual([500, 500, 1000, 0]);
  });

  it('refuses a status it does not know', () => {
    expect(() => pack({ features: [{ properties: { id: 1, status: 'maybe' }, geometry: { coordinates: [[0, 0], [1, 1]] } }] })).toThrow(/Unknown status/);
  });
});

describe('the clock', () => {
  it('finds the next date on a weekday, today included', () => {
    expect(nextOn(6, 9, at(...SAT, 3))).toEqual(at(2026, 11, 14, 9));
    expect(nextOn(0, 9, at(...SAT, 3))).toEqual(at(2026, 11, 15, 9));
    expect(nextOn(5, 9, at(2026, 12, 28, 3))).toEqual(at(2027, 1, 1, 9));
  });

  it('names hours and times the way people say them', () => {
    expect([0, 7, 12, 22].map(hourName)).toEqual(['12 AM', '7 AM', '12 PM', '10 PM']);
    expect(timeName(at(...SUN, 14))).toBe('Sunday, Nov 8 at 2 PM');
  });

  it('measures distance to the nearest part of a line', () => {
    const block = { status: 'free', timed: false, metres: 1, street: '', range: '', points: [0, 0, 10, 0] };
    expect(distanceSq(block, 5, 3)).toBe(9);
    expect(distanceSq(block, 14, 3)).toBe(25);
  });
});
