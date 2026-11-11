/** Where a dish sits on the menu. `house` tickets only exist in the kitchen. */
export type Section = 'specials' | 'workshop' | 'plates' | 'family' | 'house';

/** Combo platters: C1 backend and AI, C2 embedded and hardware, C3 founder and people. */
export type ComboId = 'c1' | 'c2' | 'c3';

/** Condiment packets. Soy for languages, chili for frameworks and services, salt for hardware and people. */
export type PacketKind = 'soy' | 'chili' | 'salt';

/** Stand-in drawings on the lazy Susan until the real dishes are photographed. */
export type PlateArt = 'phone' | 'map' | 'board' | 'steamer' | 'moon' | 'storefront';

export type CodeLang = 'python' | 'swift' | 'ts';

export interface Packet {
  name: string;
  kind: PacketKind;
}

export interface Link {
  label: string;
  url: string;
}

/** One step on the line: how an order moves through the system. */
export interface Step {
  step: string;
  detail?: string;
}

/** A real excerpt from a repo, pinned to a commit so it can't drift. */
export interface Printout {
  file: string;
  lang: CodeLang;
  url: string;
  startLine: number;
  note: string;
  code: string;
}

/** Something that went wrong, and how it got fixed. */
export interface Refire {
  sentBack: string;
  fixed: string;
}

/** An idea that got cut, and why. */
export interface Cut {
  what: string;
  why: string;
}

export interface Tally {
  value: string;
  label: string;
}

/** The back-of-house ticket for a dish. */
export interface Kitchen {
  order: string[];
  line: Step[];
  printouts?: Printout[];
  refires?: Refire[];
  cut?: Cut[];
  tally?: Tally[];
  credit?: string;
}

export interface Project {
  slug: string;
  /** Menu number, like S2. The letter matches the section. */
  number: string;
  section: Section;
  name: string;
  /** One or two sentences for the menu. */
  short: string;
  /** Printed where a menu prints the price. */
  result: string;
  /** How hard it really was, 0 to 3 chilies. */
  spice: 0 | 1 | 2 | 3;
  combos: ComboId[];
  stack: Packet[];
  role?: string;
  when?: string;
  /** Words the phone listens for. */
  aliases: string[];
  links?: Link[];
  isNew?: boolean;
  /** False for kitchen-only tickets. */
  onMenu?: boolean;
  /** Seat on the lazy Susan, 0 to 5. */
  plate?: { art: PlateArt; seat: number };
  kitchen?: Kitchen;
}
