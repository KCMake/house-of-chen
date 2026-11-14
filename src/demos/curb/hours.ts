/**
 * Atlanta meter hours as pure functions of Atlanta wall-clock time.
 *
 * Ported line for line from web/hours.js in github.com/KCMake/atl-free-parking, and tested
 * against the same cases. A time is {y, m, d, h, mi} in America/New_York (m is 1-12, h is 0-23).
 */
export interface WallTime {
  y: number;
  m: number;
  d: number;
  h: number;
  mi: number;
}

/** What the build step knows about a block. */
export interface BlockRule {
  status: string;
  timed?: boolean;
  until?: number;
}

export const TZ = 'America/New_York';

/** Wall-clock time in Atlanta for an instant (default: now). */
export function atlNow(date = new Date()): WallTime {
  const parts: Record<string, string> = {};
  for (const p of new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date)) parts[p.type] = p.value;
  return { y: +parts.year, m: +parts.month, d: +parts.day, h: +parts.hour % 24, mi: +parts.minute };
}

/** Day of week, 0 = Sunday. */
export const dow = (w: WallTime): number => new Date(Date.UTC(w.y, w.m - 1, w.d)).getUTCDay();

/** Day of the month of the nth weekday `wd` in month m (n = -1: the last one). */
export function nthDow(y: number, m: number, wd: number, n: number): number {
  if (n > 0) {
    const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
    return 1 + ((wd - first + 7) % 7) + (n - 1) * 7;
  }
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const lastWd = new Date(Date.UTC(y, m - 1, last)).getUTCDay();
  return last - ((lastWd - wd + 7) % 7);
}

/** City holidays when meters are not enforced, keyed "month-day". */
export function holidays(y: number): Record<string, string> {
  const tg = nthDow(y, 11, 4, 4);
  return {
    '1-1': 'New Year’s Day',
    [`1-${nthDow(y, 1, 1, 3)}`]: 'Martin Luther King Jr. Day',
    [`5-${nthDow(y, 5, 1, -1)}`]: 'Memorial Day',
    '7-4': 'Independence Day',
    [`9-${nthDow(y, 9, 1, 1)}`]: 'Labor Day',
    '11-11': 'Veterans Day',
    [`11-${tg}`]: 'Thanksgiving',
    [`11-${tg + 1}`]: 'the day after Thanksgiving',
    '12-25': 'Christmas Day',
  };
}

const holidayMemo: Record<number, Record<string, string>> = {};
export const holidayName = (w: WallTime): string | null => (holidayMemo[w.y] ||= holidays(w.y))[`${w.m}-${w.d}`] || null;

/** City meters run Mon to Sat from 7 AM to `end` (10 PM unless a block listing says otherwise). */
export const metersOff = (w: WallTime, end = 22): boolean => Boolean(holidayName(w)) || dow(w) === 0 || w.h < 7 || w.h >= end;

/** Daytime-restricted blocks open from 7 PM to 7 AM. */
export const eveningOpen = (w: WallTime): boolean => w.h >= 19 || w.h < 7;

/** One-line summary of the citywide meter rule at time w. */
export function meterState(w: WallTime): { off: boolean; text: string } {
  const hol = holidayName(w);
  if (hol) return { off: true, text: `City meters are off all day for ${hol}.` };
  if (dow(w) === 0) return { off: true, text: 'Sunday: city meters are off all day.' };
  if (w.h < 7) return { off: true, text: 'Before 7 AM: city meters are off until 7.' };
  if (w.h >= 22) return { off: true, text: dow(w) === 6 ? 'After 10 PM Saturday: meters are off until Monday 7 AM.' : 'After 10 PM: city meters are off until 7 AM.' };
  return { off: false, text: 'City meters are running (Monday to Saturday, 7 AM to 10 PM).' };
}

/** What a block shows at time w. Metered and evening-only blocks turn "freenow". */
export function effectiveStatus(p: BlockRule, w: WallTime): string {
  if (p.status === 'paid' && p.timed) return metersOff(w, p.until || 22) ? 'freenow' : 'paid';
  if (p.status === 'night') return eveningOpen(w) ? 'freenow' : 'check';
  return p.status;
}
