import type { Project } from '../types';

const REPO = 'https://github.com/KCMake/house-of-chen/blob/main';

const project: Project = {
  slug: 'this-site',
  number: 'H1',
  section: 'house',
  name: 'This site',
  short: 'How the House of Chen is built.',
  result: 'open source',
  spice: 2,
  combos: ['c1'],
  stack: [
    { name: 'TypeScript', kind: 'soy' },
    { name: 'Astro', kind: 'chili' },
    { name: 'Vitest', kind: 'chili' },
    { name: 'Playwright', kind: 'chili' },
  ],
  onMenu: false,
  aliases: ['this site', 'website', 'portfolio', 'house of chen'],
  links: [{ label: 'Code on GitHub', url: 'https://github.com/KCMake/house-of-chen' }],
  kitchen: {
    order: [
      'This site is built like the restaurant it is about. The front of house is a printed menu for anyone in a hurry. The back of house, where you are standing, is for anyone who wants to see how things are made.',
      'Every page is static HTML. JavaScript only runs where something moves: the door, the table, the phone, the calendar, the order pad. Each dish is one file that feeds the menu, its kitchen ticket, the To go page, the PDF, and the phone, so they cannot disagree.',
      'AI tools pull websites toward the same handful of looks. A check in CI reads the code and fails the build when one of those defaults shows up, like a stock typeface, gradient headline text, or blurred glass panels.',
    ],
    line: [
      { step: 'src/data/projects', detail: 'One TypeScript file per dish, tested for duplicates, stray em dashes, and anything that looks like a phone number.' },
      { step: 'Astro', detail: 'Turns the data into static pages for the front, the kitchen, and the To go page.' },
      { step: 'Small scripts for things that move', detail: 'Hand-written springs and friction for the door, the lazy Susan, and the phone handset. No animation library.' },
      { step: 'View transitions', detail: 'Going between the front and the kitchen swings the whole page like a door, in browsers that support it.' },
      { step: 'CI on every push', detail: 'The AI-look check, unit tests, a production build, and browser tests with an accessibility scan.' },
    ],
    printouts: [
      {
        file: 'src/lib/physics.ts',
        lang: 'ts',
        url: `${REPO}/src/lib/physics.ts#L46-L60`,
        startLine: 46,
        note: 'The fix for the one refire below. Pointer events that land a millisecond apart no longer turn a flick into a blur.',
        code: [
          '/**',
          ' * How fast something was moving when it was let go, from recent pointer samples.',
          ' * Two pointer events can land a millisecond apart, which once turned a gentle flick into',
          ' * thousands of degrees a second and spun the lazy Susan 56 times. So the time span has a',
          ' * floor of one frame, and the result is clamped.',
          ' */',
          'export function releaseSpeed(samples: Sample[], maxSpeed: number, windowMs = 80): number {',
          '  if (samples.length < 2) return 0;',
          '  const last = samples[samples.length - 1];',
          '  const recent = samples.filter((s) => last.t - s.t <= windowMs);',
          '  const first = recent.length > 1 ? recent[0] : samples[samples.length - 2];',
          '  const span = Math.max(16, last.t - first.t);',
          '  const speed = ((last.value - first.value) / span) * 1000;',
          '  return clamp(speed, -maxSpeed, maxSpeed);',
          '}',
        ].join('\n'),
      },
    ],
    refires: [
      {
        sentBack: 'A quick drag spun the lazy Susan 56 times. Two pointer events landed a millisecond apart, so the measured speed came out absurd.',
        fixed: 'Release speed is measured over at least one frame and clamped to 1,600 degrees a second. A unit test covers it.',
      },
    ],
  },
};

export default project;
