import type { Excerpt } from './types';

/**
 * The home page is this paragraph. A plain string is plain text. A phrase is highlighted, and
 * tapping it opens `more` in place, inside parentheses, or opens a code excerpt under the
 * paragraph. Without JavaScript, every phrase is already open.
 */
export interface Phrase {
  id: string;
  text: string;
  more: Piece[] | Excerpt;
}

export interface InlineLink {
  text: string;
  /** A path on this site, like 'work/quill/', or a full https address. */
  href?: string;
  /** Links to email instead. The address is put together in the browser. */
  email?: true;
}

export type Piece = string | Phrase | InlineLink;

export const isPhrase = (piece: Piece): piece is Phrase => typeof piece === 'object' && 'id' in piece;
export const isLink = (piece: Piece): piece is InlineLink => typeof piece === 'object' && !('id' in piece);
export const opensExcerpt = (phrase: Phrase): phrase is Phrase & { more: Excerpt } => !Array.isArray(phrase.more);

const FETCH_CHECK: Excerpt = {
  file: 'scripts/fetch_data.py',
  lang: 'python',
  url: 'https://github.com/KCMake/atl-free-parking/blob/4cf37d66405e933a62626c983440de31d191da3b/scripts/fetch_data.py#L67-L68',
  startLine: 67,
  note: "From Free Curb ATL. The fetcher pages by object ID now and refuses to continue when the counts disagree, so a short download can't quietly turn into a wrong map.",
  code: [
    '    if len(feats) != len(ids):',
    '        raise RuntimeError(f"{layer_url}: expected {len(ids)} features, got {len(feats)}")',
  ].join('\n'),
};

export const paragraphs: Piece[][] = [
  [
    "I'm Kenney Chen, ",
    {
      id: 'school',
      text: 'a computer engineering student at Georgia Tech',
      more: ['4.00 GPA, class of 2029, and one of 36 students in the country to win a Santander Open Scholarship'],
    },
    ' looking for ',
    {
      id: 'internship',
      text: 'a software engineering internship for Summer 2027',
      more: [
        'backend and distributed systems, AI, or embedded software. ',
        { text: 'Email me', email: true },
        ' or see ',
        { text: 'my resume', href: 'resume/' },
      ],
    },
    '.',
  ],
  [
    'I built ',
    {
      id: 'phones',
      text: "an AI that answers a restaurant's phones",
      more: [
        'at Osho Sushi & Hibachi in Atlanta. For six months, real callers ordered from it, and ',
        {
          id: 'agents',
          text: 'agents turned what they said into a checked order',
          more: [
            "people order the way people talk, so an orchestration layer turns free-form speech into a structured order and validates it. Python and FastAPI, with PostgreSQL for orders and Redis for each call's session",
          ],
        },
        ' before the kitchen saw it. I owned it in production and ',
        { text: 'wrote up how it worked', href: 'work/ai-phone-ordering/' },
        '.',
      ],
    },
    ', ',
    {
      id: 'curbs',
      text: 'a map of every free curb in Atlanta',
      more: [
        "Atlanta doesn't publish where its meters are, so I ",
        {
          id: 'blocks',
          text: 'worked out all 2,035 blocks',
          more: [
            'the first version marked the interstate as free parking, and ',
            { id: 'segments', text: "the city's server quietly dropped 769 street segments", more: FETCH_CHECK },
            '. Every mistake became a test',
          ],
        },
        " from city street data and 63 listings I checked by hand. Pick any day and hour, and it shows what's free. ",
        { text: 'Open the map', href: 'https://kcmake.github.io/atl-free-parking/' },
        ' or ',
        { text: 'read how it works', href: 'work/free-curb-atl/' },
        '.',
      ],
    },
    ', and ',
    {
      id: 'plants',
      text: 'a plant tray that waters itself before the soil dries out',
      more: [
        'AgriNexus 2.0, built with my TSA team. ',
        {
          id: 'forecast',
          text: 'An ESP32 predicts soil moisture ten minutes ahead',
          more: [
            'a small linear model trained on about 40,000 logged rows, with its weights in a C++ header in flash. One prediction takes about 820 µs, and the screen runs as its own FreeRTOS task, so drawing never delays a pump',
          ],
        },
        ', so the tray used 28% less water than a control tray over three weeks. It placed in the top five in Georgia and went to nationals. ',
        { text: 'The write-up', href: 'work/agrinexus/' },
        ' covers what broke on the way.',
      ],
    },
    '.',
  ],
  [
    'Outside of class I ',
    {
      id: 'community',
      text: 'run a community of 5,000 student builders',
      more: [
        "BuildForge, which I started in 2023. We've run two virtual hackathons and a weekly mentorship program, and published 250+ student projects",
      ],
    },
    ' and ',
    {
      id: 'restaurant',
      text: "work shifts at my family's restaurant",
      more: [
        "Hong Kong City in Atlanta, where I've been a cook, a cashier, and a shift manager. On a busy night I run the register for about 200 guests. In 2020 I set up UberEats and DoorDash for my parents, and delivery grew 60% year over year",
      ],
    },
    ", which I've done since 2016. From 2023 to 2026 I also ",
    {
      id: 'coaching',
      text: 'coached youth basketball',
      more: [
        'as head coach for 50+ players in the Atlanta Contemporary Basketball Association. My 5th-grade team won back-to-back championships',
      ],
    },
    '.',
  ],
  [
    "Right now I'm building ",
    {
      id: 'cogni',
      text: 'Cogni',
      more: [
        'an open-source long-term memory engine for AI agents. New facts replace old ones, details that stop mattering fade, and what keeps coming up gets stronger',
      ],
    },
    ", which I co-founded in October 2026. Other things I've made include ",
    {
      id: 'tuck',
      text: 'Tuck',
      more: [
        'a parent records their voice once, and each night Claude writes a calm bedtime story that the parent approves and Tuck reads in their voice. I built it solo at Cal Hacks 13.0. Here is ',
        { text: 'how it works', href: 'work/tuck/' },
      ],
    },
    ', ',
    {
      id: 'coursesniper',
      text: 'CourseSniper',
      more: [
        'a Discord bot that pings you the moment a class seat or waitlist spot opens. It supports 173 schools in 38 states and DC',
      ],
    },
    ', and ',
    {
      id: 'quill',
      text: 'Quill',
      more: [
        'a Mac app that turns the trackpad into a drawing tablet for handwritten notes and math. Here is ',
        { text: 'how it works', href: 'work/quill/' },
      ],
    },
    '.',
  ],
];

/** Every phrase in reading order, including phrases inside what other phrases open. */
export function phrasesIn(pieces: Piece[]): Phrase[] {
  return pieces.filter(isPhrase).flatMap((p) => [p, ...(Array.isArray(p.more) ? phrasesIn(p.more) : [])]);
}

export const allPhrases: Phrase[] = paragraphs.flatMap(phrasesIn);
