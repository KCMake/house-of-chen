export type CodeLang = 'python' | 'swift' | 'ts' | 'cpp';

export interface Link {
  label: string;
  url: string;
}

/** A few lines of real code, quoted exactly and linked to those lines on GitHub. */
export interface Excerpt {
  file: string;
  lang: CodeLang;
  /** Pinned to a commit for other repos. This repo's own code links to main, and a test checks the quote. */
  url: string;
  startLine: number;
  /** Why these lines matter, in a sentence or two. */
  note: string;
  code: string;
}

/** A short piece of code shown in full, for projects whose source isn't public to link to. */
export interface Listing {
  file: string;
  lang: CodeLang;
  note: string;
  code: string;
}

/** A photo, drawing, or chart. Files live under public/, and `src` is the path from there. */
export interface Figure {
  src: string;
  /** What the picture shows, for someone who can't see it. */
  alt: string;
  caption: string;
  width: number;
  height: number;
  /** A drawing or chart on a white background, which keeps that background in dark mode. */
  paper?: boolean;
}

/** A small table of facts, like pin assignments or a parts list. */
export interface Spec {
  title: string;
  rows: [string, string][];
  /** Starts closed, for long tables most readers will skip. */
  folded?: boolean;
}

/** One box in a block diagram. */
export interface Block {
  name: string;
  detail: string;
}

/** A block diagram read left to right: each column feeds the next. */
export interface Diagram {
  caption: string;
  columns: { title: string; blocks: Block[] }[];
}

/** One stage of how something works. */
export interface Step {
  name: string;
  detail: string;
}

export interface Stat {
  value: string;
  label: string;
}

/** Something tried first and dropped. */
export interface Attempt {
  what: string;
  why: string;
}

/** Something that went wrong, and how it got fixed. */
export interface Failure {
  what: string;
  fix: string;
  figure?: Figure;
}

/** The long version of a project, in the order an engineer would ask about it. */
export interface Writeup {
  problem: string[];
  firstTry?: Attempt[];
  broke?: Failure[];
  shipped: string[];
  /** How the shipped version works, in order. */
  steps: Step[];
  excerpts?: Excerpt[];
  stats?: Stat[];
  /** The picture under the title. */
  hero?: Figure;
  /** Pictures for the first-try and what-shipped sections. */
  figures?: { firstTry?: Figure[]; shipped?: Figure[]; tested?: Figure[] };
  diagram?: Diagram;
  specs?: Spec[];
  listings?: Listing[];
  /** How it was tested and what the tests showed. Gets its own section after What shipped. */
  tested?: string[];
  credit?: string;
}

export const TAGS = ['AI', 'Web', 'Tools', 'Hardware', 'Leadership'] as const;
export type Tag = (typeof TAGS)[number];

export interface Project {
  slug: string;
  name: string;
  /** One plain sentence for the work list. */
  line: string;
  /** The number or outcome worth noticing. */
  result: string;
  /** Which list on the home page it goes in. 'site' is this site, which only the footer links to. */
  group: 'projects' | 'leadership' | 'site';
  /** Position in its list, lowest first. Leave gaps so a new project fits between two others. */
  order: number;
  /** What the Work filter matches. */
  tags: Tag[];
  /** A piece of the project that runs at the top of its write-up. See src/components/Demo.astro. */
  demo?: 'curb' | 'sniper';
  role?: string;
  when?: string;
  stack: string[];
  links?: Link[];
  writeup?: Writeup;
}
