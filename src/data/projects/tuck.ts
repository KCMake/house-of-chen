import type { Project } from '../types';

const COMMIT = 'https://github.com/KCMake/tuck/blob/95af3a42f86360676e59cbfb7fe5ef78c51883a2';

const project: Project = {
  slug: 'tuck',
  name: 'Tuck',
  line: "A parent's voice at bedtime, even when they can't be there. Built solo at Cal Hacks 13.0.",
  result: 'solo at Cal Hacks',
  when: '2026',
  stack: ['TypeScript', 'Cartesia', 'Claude', 'Express'],
  links: [{ label: 'Code on GitHub', url: 'https://github.com/KCMake/tuck' }],
  writeup: {
    problem: [
      "Some parents miss bedtime on a regular schedule: night-shift nurses, first responders, parents who travel, deployed service members. For a toddler, a parent's voice is part of what makes falling asleep feel safe.",
    ],
    shipped: [
      'A parent records their voice once, starting with a consent sentence. Each night they spend about 20 seconds on the details, like the comfort toy and one happy moment from the day. Claude writes a calm story, the parent approves every word, and Tuck records it in their voice.',
      "It doesn't replace a parent who is home, and a caregiver is always in the room.",
    ],
    steps: [
      { name: 'Voice, recorded once', detail: '20 to 60 seconds, starting with a consent sentence. Cartesia makes a private clone.' },
      { name: "Tonight's details", detail: 'The comfort toy, one happy moment, and the usual goodnight words.' },
      { name: 'Claude writes the story', detail: 'Structured output through a Zod schema. Every paragraph is tagged hello, adventure, wind-down, or goodnight, with a scene.' },
      { name: 'The parent approves it', detail: 'They can change any word or picture first.' },
      { name: 'Cartesia records it', detail: 'One request per paragraph. Speed eases from 1.0 to 0.7 and volume from 1.0 to 0.6 across the story.' },
      { name: 'Kid mode', detail: 'One tap plays it, offline. The screen dims to a nightlight and brown noise fades out over ten minutes.' },
    ],
    excerpts: [
      {
        file: 'shared/pacing.ts',
        lang: 'ts',
        url: `${COMMIT}/shared/pacing.ts#L1-L24`,
        startLine: 1,
        note: "The voice slows down and softens as the story goes on, the way a parent's does. The whole curve is a pure function, so it has its own tests.",
        code: [
          "import type { Pacing, StoryPhase } from './types';",
          '',
          '// Cartesia allows speed 0.6–1.5 and volume 0.5–2.0; both ease down across the story.',
          'export const SPEED = { start: 1.0, end: 0.7 } as const;',
          'export const VOLUME = { start: 1.0, end: 0.6 } as const;',
          '',
          'const EMOTION: Record<StoryPhase, string> = {',
          "  hello: 'affectionate',",
          "  adventure: 'content',",
          "  winddown: 'calm',",
          "  goodnight: 'peaceful',",
          '};',
          '',
          'const round2 = (n: number) => Math.round(n * 100) / 100;',
          '',
          '/** How the voice should sound for paragraph `index` of `total`. */',
          'export function pacingFor(phase: StoryPhase, index: number, total: number): Pacing {',
          '  const t = total > 1 ? index / (total - 1) : 1;',
          '  return {',
          '    speed: round2(SPEED.start + (SPEED.end - SPEED.start) * t),',
          '    volume: round2(VOLUME.start + (VOLUME.end - VOLUME.start) * t),',
          '    emotion: EMOTION[phase],',
          '  };',
          '}',
        ].join('\n'),
      },
    ],
    stats: [
      { value: '20 s', label: 'of setup a night' },
      { value: '0.7x', label: 'speed by the last paragraph' },
      { value: '10 min', label: 'of brown noise fading out' },
    ],
  },
};

export default project;
