import { atlNow, effectiveStatus, type WallTime } from './hours';

/** public/demo/curbs.json, as written by scripts/make-curb-data.mjs. */
export interface CurbFile {
  west: number;
  south: number;
  east: number;
  north: number;
  statuses: string[];
  /** [status, timed, meter end hour or 0, length in metres, street, address range, points] */
  blocks: [number, number, number, number, string, string, number[]][];
}

export interface Block {
  status: string;
  timed: boolean;
  until?: number;
  metres: number;
  street: string;
  range: string;
  /** x0, y0, x1, y1, ... counted in 0.00001 degrees from the south-west corner. */
  points: number[];
}

/** How a block is drawn. Each one has a color and a plain name. */
export type Paint = 'free' | 'limited' | 'paid' | 'other';

export const PAINT_NAMES: Record<Paint, string> = {
  free: 'free',
  limited: 'free with a time limit',
  paid: 'paid',
  other: 'permit, unknown, or no parking',
};

export function unpack(file: CurbFile): Block[] {
  return file.blocks.map(([status, timed, until, metres, street, range, points]) => ({
    status: file.statuses[status],
    timed: timed === 1,
    until: until || undefined,
    metres,
    street,
    range,
    points,
  }));
}

/** A meter that is switched off and a curb that was always free look the same to a driver. */
export function paintAt(block: Block, w: WallTime): Paint {
  const now = effectiveStatus(block, w);
  if (now === 'free' || now === 'freenow') return 'free';
  if (now === 'limited') return 'limited';
  if (now === 'paid') return 'paid';
  return 'other';
}

export interface Tally {
  /** Kilometres you can park on without paying, time-limited blocks included. */
  freeKm: number;
  paidKm: number;
  /** Kilometres that are only free because a rule is off at this hour. */
  unlockedKm: number;
}

export function tally(blocks: Block[], w: WallTime): Tally {
  let free = 0, paid = 0, unlocked = 0;
  for (const block of blocks) {
    const paint = paintAt(block, w);
    if (paint === 'paid') paid += block.metres;
    if (paint === 'free' || paint === 'limited') free += block.metres;
    if (paint === 'free' && block.status !== 'free') unlocked += block.metres;
  }
  return { freeKm: free / 1000, paidKm: paid / 1000, unlockedKm: unlocked / 1000 };
}

export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** The next date, today included, that falls on weekday `day` (0 = Sunday), at hour `h`. */
export function nextOn(day: number, h: number, today: WallTime = atlNow()): WallTime {
  const from = new Date(Date.UTC(today.y, today.m - 1, today.d));
  from.setUTCDate(from.getUTCDate() + ((day - from.getUTCDay() + 7) % 7));
  return { y: from.getUTCFullYear(), m: from.getUTCMonth() + 1, d: from.getUTCDate(), h, mi: 0 };
}

export function hourName(h: number): string {
  if (h === 0) return '12 AM';
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

export function timeName(w: WallTime): string {
  const day = new Date(Date.UTC(w.y, w.m - 1, w.d)).getUTCDay();
  return `${DAYS[day]}, ${MONTHS[w.m - 1]} ${w.d} at ${hourName(w.h)}`;
}

/** Squared distance from a point to a block's line, in the block's own units. */
export function distanceSq(block: Block, x: number, y: number): number {
  const p = block.points;
  let best = Infinity;
  for (let i = 0; i + 3 < p.length; i += 2) {
    const ax = p[i], ay = p[i + 1], dx = p[i + 2] - ax, dy = p[i + 3] - ay;
    const len = dx * dx + dy * dy;
    const t = len === 0 ? 0 : Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / len));
    const ex = ax + t * dx - x, ey = ay + t * dy - y;
    best = Math.min(best, ex * ex + ey * ey);
  }
  return best;
}
