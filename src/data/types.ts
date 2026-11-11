export type CodeLang = 'python' | 'swift' | 'ts';

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
  credit?: string;
}

export interface Project {
  slug: string;
  name: string;
  /** One plain sentence for the work list. */
  line: string;
  /** The number or outcome worth noticing. */
  result: string;
  role?: string;
  when?: string;
  stack: string[];
  links?: Link[];
  writeup?: Writeup;
}
