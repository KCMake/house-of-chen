/**
 * The phone. A rule-based miniature of the voice-ordering system Kenney built at Osho: it hears
 * a sentence, matches it against the menu, works out what the caller wants, validates the
 * order, and answers. The production system used LLM agents on live calls. This one is
 * deterministic, costs nothing to run, and can only talk about what is on the menu.
 */
import type { ComboId } from '../data/types';

export interface MenuItem {
  number: string;
  slug: string;
  name: string;
  short: string;
  result: string;
  combos: ComboId[];
  aliases: string[];
  kitchen: boolean;
}

export interface Facts {
  email: string;
  seeking: string;
  graduation: string;
}

export type Intent =
  | 'greet'
  | 'thanks'
  | 'contact'
  | 'resume'
  | 'order'
  | 'kitchen'
  | 'recommend'
  | 'ask'
  | 'availability'
  | 'unknown';

export interface Order {
  intent: Intent;
  role: ComboId | null;
  items: string[];
  missing: string[];
  quantity: number;
  mods: string[];
}

export interface Check {
  valid: boolean;
  problems: string[];
}

export interface Stage {
  name: string;
  ms: number;
  detail: string;
}

export interface Call {
  heard: string;
  order: Order;
  check: Check;
  reply: string;
  stages: Stage[];
}

export const ROLE_LABEL: Record<ComboId, string> = {
  c1: 'backend and AI',
  c2: 'embedded and hardware',
  c3: 'founder and people',
};

// Embedded and founder words come first, because "software" alone would claim almost anything.
const ROLE_WORDS: [ComboId, RegExp][] = [
  ['c2', /\b(embedded|hardware|firmware|robots?|robotics|electrical|iot|microcontrollers?|esp32|sensors?|circuits?|pcb)\b/],
  ['c3', /\b(founders?|founding|startups?|leaders?|leadership|people|community|managers?|management)\b/],
  ['c1', /\b(back ?end|ai|ml|machine learning|llms?|agents?|servers?|apis?|distributed|data|infra|infrastructure|python|software)\b/],
];

const INTENTS: [Intent, RegExp][] = [
  ['thanks', /\b(thanks|thank you|thx|bye|goodbye|that's all|thats all)\b/],
  ['contact', /\b(e ?mail|contact|reach (you|him|kenney)|get in touch|phone number|talk to (you|him|kenney)|interview|hire (you|him|kenney))\b/],
  ['resume', /\b(resume|cv|pdf)\b/],
  ['order', /\b(i'?ll (have|take|get)|i will (have|take|get)|can i (get|have)|could i (get|have)|give me|i'?d like|i would like|i want|order (a|an|the|one|some|number)|add)\b/],
  ['kitchen', /\b(code|architecture|built|kitchen|source|github|repo|how (does|did|do) .{0,30}work)\b/],
];

const RECOMMEND = /\b(recommend|good|best|suggest|popular|specials?|should i|what do you have|menu|options?|hungry)\b/;
const QUESTION = /\b(what|tell me|how|why|explain|about|describe|more)\b/;
const AVAILABILITY = /\b(available|availability|graduat\w*|when can|start date|summer|internships?|interns?|looking for)\b/;
const GREETING = /^(hi|hello|hey|yo|hiya|good (morning|afternoon|evening))\b/;

const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, dozen: 12,
};

const MODS: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/\bhold the ([a-z]+)/, (m) => `hold the ${m[1]}`],
  [/\bextra ([a-z]+)/, (m) => `extra ${m[1]}`],
  [/\bno ([a-z]+)\b/, (m) => `no ${m[1]}`],
  [/\bwith (?:the )?architecture\b/, () => 'with architecture'],
  [/\b(to go|takeout|take out)\b/, () => 'to go'],
];

export function normalize(said: string): string {
  return said
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/-/g, ' ')
    .replace(/[^a-z0-9'#+\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function levenshtein(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const above = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = above;
    }
  }
  return row[b.length];
}

/** Dishes the caller named, by number, by name, by alias, or by a near miss on a long word. */
export function matchItems(heard: string, menu: MenuItem[]): { items: string[]; unknownNumbers: string[] } {
  const found = new Set<string>();
  const unknownNumbers: string[] = [];
  for (const m of heard.matchAll(/(?<![a-z'])([swpfh]) ?(\d{1,2})\b/g)) {
    const number = (m[1] + m[2]).toUpperCase();
    if (menu.some((item) => item.number === number)) found.add(number);
    else unknownNumbers.push(number);
  }
  const words = heard.split(' ');
  for (const item of menu) {
    if (found.has(item.number)) continue;
    const names = [item.name, ...item.aliases].map(normalize);
    const exact = names.some((n) => new RegExp(`\\b${escapeRegExp(n)}\\b`).test(heard));
    const close = names
      .filter((n) => !n.includes(' ') && n.length >= 5)
      .some((n) => words.some((w) => w.length >= 5 && levenshtein(w, n) <= (n.length >= 8 ? 2 : 1)));
    if (exact || close) found.add(item.number);
  }
  return { items: menu.filter((i) => found.has(i.number)).map((i) => i.number), unknownNumbers };
}

export function roleOf(heard: string): ComboId | null {
  for (const [role, pattern] of ROLE_WORDS) if (pattern.test(heard)) return role;
  return null;
}

export function classify(heard: string, items: string[], role: ComboId | null): Intent {
  for (const [intent, pattern] of INTENTS) if (pattern.test(heard)) return intent;
  if (RECOMMEND.test(heard) && (role || items.length === 0)) return 'recommend';
  if (items.length && QUESTION.test(heard)) return 'ask';
  if (items.length && /^(number )?[swpfh] ?\d{1,2}( please)?$/.test(heard)) return 'order';
  if (role) return 'recommend';
  if (AVAILABILITY.test(heard)) return 'availability';
  if (items.length) return 'ask';
  if (GREETING.test(heard)) return 'greet';
  return 'unknown';
}

export function quantityOf(heard: string): number {
  const m = heard.match(/\b(\d{1,3}|one|two|three|four|five|six|seven|eight|nine|ten|dozen) (?:orders? of |of )?(?:the |your )?[a-z]/);
  if (!m) return 1;
  return /^\d+$/.test(m[1]) ? Number(m[1]) : NUMBER_WORDS[m[1]];
}

export function modsOf(heard: string): string[] {
  const mods: string[] = [];
  for (const [pattern, label] of MODS) {
    const m = heard.match(pattern);
    if (m) mods.push(label(m));
  }
  return mods;
}

/** What the caller tried to order when nothing on the menu matched. */
function missingFrom(heard: string): string[] {
  const m = heard.match(/\b(?:have|take|get|order|want|like) (?:a |an |the |some |one |two |three |\d+ )?(?:order of |side of |plate of )?([a-z' ]{3,40})/);
  if (!m) return [];
  const phrase = m[1].replace(/\b(please|thanks|thank you|to go|for here)\b.*$/, '').trim();
  return phrase ? [phrase] : [];
}

export function validate(order: Order): Check {
  const problems: string[] = [];
  for (const m of order.missing) problems.push(`${m} is not on the menu`);
  if (order.intent === 'order' && order.items.length === 0 && order.missing.length === 0) {
    problems.push('an order needs at least one dish');
  }
  if (order.items.length > 0 && order.quantity !== 1) {
    problems.push(`can't make ${order.quantity} of anything, every dish is one of a kind`);
  }
  return { valid: problems.length === 0, problems };
}

function cite(item: MenuItem): string {
  return `${item.number}, ${item.name}`;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function joinNames(items: MenuItem[]): string {
  const names = items.map(cite);
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0] ?? '';
}

export function reply(order: Order, check: Check, menu: MenuItem[], facts: Facts): string {
  const byNumber = (n: string) => menu.find((i) => i.number === n)!;
  const specials = menu.filter((i) => i.number.startsWith('S')).slice(0, 2);

  if (!check.valid) {
    if (order.missing.length) {
      return `Sorry, we're 86'd on ${order.missing.join(' and ')}. Tonight's specials are ${joinNames(specials)}.`;
    }
    if (order.items.length && order.quantity !== 1) {
      return `I can't do ${order.quantity} of those. Every dish here is one of a kind. One ${byNumber(order.items[0]).name}?`;
    }
    return 'What can I get you? Order by number, like S2.';
  }

  switch (order.intent) {
    case 'order': {
      const dishes = order.items.map(byNumber);
      const first = dishes[0];
      const hold = order.mods.find((m) => m.startsWith('hold the') || m.startsWith('no '));
      const holdNote = hold ? ` ${capitalize(hold)}, got it.` : '';
      const next = first.kitchen
        ? `Push through the kitchen door on ${first.number} to see how it was made.`
        : `It comes with ${first.result}.`;
      return `${joinNames(dishes)}, heard.${holdNote} ${next}`;
    }
    case 'ask': {
      const item = byNumber(order.items[0]);
      return `${cite(item)}. ${item.short} Result: ${item.result}.`;
    }
    case 'recommend': {
      const pool = order.role ? menu.filter((i) => i.combos.includes(order.role!)) : specials;
      const [first, ...rest] = pool.slice(0, 3);
      const label = order.role ? `For ${ROLE_LABEL[order.role]}` : 'Tonight';
      const then = rest.length ? ` Then ${joinNames(rest)}.` : '';
      return `${label}, start with ${cite(first)}. ${first.short}${then}`;
    }
    case 'contact':
      return `Email is best: ${facts.email}. Or fill in the order pad at the bottom of this page.`;
    case 'resume':
      return 'The one-page version is on the To go page, with a PDF.';
    case 'availability':
      return `${facts.seeking}. Graduating ${facts.graduation}.`;
    case 'kitchen':
      return 'Push through the kitchen door. Every ticket back there has the architecture, real code, and what broke.';
    case 'thanks':
      return 'Thank you, come again.';
    case 'greet':
      return "House of Chen, what can I get you? Ask what's good for your team, or order by number, like S2.";
    default:
      return 'Sorry, I didn\'t catch that. Try "what\'s good for embedded?" or "tell me about W1."';
  }
}

/** Runs one call through every stage and times each one. */
export function takeCall(said: string, menu: MenuItem[], facts: Facts, clock: () => number = () => performance.now()): Call {
  const t0 = clock();
  const heard = normalize(said);
  const t1 = clock();
  const { items, unknownNumbers } = matchItems(heard, menu);
  const role = roleOf(heard);
  const t2 = clock();
  const intent = classify(heard, items, role);
  const quantity = intent === 'order' ? quantityOf(heard) : 1;
  const missing = [...unknownNumbers, ...(intent === 'order' && items.length === 0 ? missingFrom(heard) : [])];
  const order: Order = { intent, role, items, missing, quantity, mods: modsOf(heard) };
  const t3 = clock();
  const check = validate(order);
  const t4 = clock();
  const answer = reply(order, check, menu, facts);
  const t5 = clock();
  return {
    heard,
    order,
    check,
    reply: answer,
    stages: [
      { name: 'Hear', ms: t1 - t0, detail: heard || '(nothing)' },
      { name: 'Menu agent', ms: t2 - t1, detail: items.length ? items.join(', ') : 'no dishes named' },
      { name: 'Intent agent', ms: t3 - t2, detail: role ? `${intent}, ${ROLE_LABEL[role]}` : intent },
      { name: 'Validator', ms: t4 - t3, detail: check.valid ? 'passed' : check.problems.join('; ') },
      { name: 'Reply', ms: t5 - t4, detail: `${answer.split(' ').length} words` },
    ],
  };
}

/** The structured order, shaped like the JSON the real system handed to the kitchen. */
export function ticketOf(call: Call): Record<string, unknown> {
  return {
    intent: call.order.intent,
    role: call.order.role ? ROLE_LABEL[call.order.role] : null,
    items: call.order.items,
    quantity: call.order.quantity,
    mods: call.order.mods,
    valid: call.check.valid,
  };
}
