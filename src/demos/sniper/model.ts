/**
 * CourseSniper's seat rule, ported from src/coursesniper/models.py and formatting.py in
 * github.com/KCMake/CourseSniper. The bot pings when a section's state changes, and the
 * state is what a student can actually do right now, which is not the same as "a seat is empty".
 */
export interface Seats {
  capacity: number;
  taken: number;
  waitCapacity: number;
  waitTaken: number;
}

export type SeatState = 'open' | 'waitlist' | 'closed';

export const LABELS: Record<SeatState, string> = { open: 'OPEN', waitlist: 'WAITLIST OPEN', closed: 'FULL' };

export const vacant = (s: Seats): number => s.capacity - s.taken;
export const waitVacant = (s: Seats): number => s.waitCapacity - s.waitTaken;

/** Over-enrollment uses up waitlist spots. A section 2 over with 3 spots has room, but one 2 over with 2 doesn't. */
export function waitlistOpen(s: Seats): boolean {
  const overEnrolled = Math.max(-vacant(s), 0);
  return waitVacant(s) > overEnrolled;
}

/** Vacant seats are offered to the waitlist first, so a seat only counts as free once there are more of them than people waiting. */
export function state(s: Seats): SeatState {
  if (vacant(s) > s.waitTaken) return 'open';
  if (waitlistOpen(s)) return 'waitlist';
  return 'closed';
}

/** What a bot that only checked for an empty seat would say. */
export const naiveOpen = (s: Seats): boolean => vacant(s) > 0;

export type Move = 'drop' | 'enroll' | 'join' | 'seat';

export const MOVES: Record<Move, string> = {
  drop: 'A student drops',
  enroll: 'A student registers',
  join: 'Someone joins the waitlist',
  seat: 'The waitlist gets the seat',
};

/** Whether the registration system would allow this to happen. */
export function allowed(s: Seats, move: Move): boolean {
  if (move === 'drop') return s.taken > 0;
  if (move === 'enroll') return state(s) === 'open';
  if (move === 'join') return state(s) === 'waitlist';
  return vacant(s) > 0 && s.waitTaken > 0;
}

export function apply(s: Seats, move: Move): Seats {
  if (!allowed(s, move)) return s;
  if (move === 'drop') return { ...s, taken: s.taken - 1 };
  if (move === 'enroll') return { ...s, taken: s.taken + 1 };
  if (move === 'join') return { ...s, waitTaken: s.waitTaken + 1 };
  return { ...s, taken: s.taken + 1, waitTaken: s.waitTaken - 1 };
}

/** The stats block the bot posts, laid out the same way. */
export function block(name: string, s: Seats): string {
  const rows: [string, string][] = [
    ['seats:', String(s.capacity)],
    ['taken:', String(s.taken)],
    ['vacant:', String(vacant(s))],
    ['waitlist open:', waitlistOpen(s) ? 'yes' : 'no'],
    ['waitlist seats:', String(s.waitCapacity)],
    ['waitlist taken:', String(s.waitTaken)],
    ['waitlist vacant:', String(waitVacant(s))],
  ];
  const width = Math.max(...rows.map(([label]) => label.length));
  const lines = [name, ...rows.map(([label, value]) => `${label.padEnd(width)} ${value.padStart(3)}`)];
  if (vacant(s) > 0 && state(s) !== 'open') lines.push('note: vacant seats are held for the waitlist');
  return lines.join('\n');
}

/** The ping for a change from one state to another, or null when nothing a student cares about changed. */
export function ping(before: Seats, after: Seats): string | null {
  const from = state(before), to = state(after);
  return from === to ? null : `${LABELS[from]} → ${LABELS[to]}`;
}
