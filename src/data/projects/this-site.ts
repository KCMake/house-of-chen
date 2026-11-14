import type { Project } from '../types';

const REPO = 'https://github.com/KCMake/house-of-chen/blob/main';

const project: Project = {
  slug: 'this-site',
  name: 'This site',
  line: 'How this portfolio is built: the projects that can run in a browser run on the page.',
  result: 'open source',
  group: 'site',
  order: 10,
  tags: ['Web'],
  stack: ['TypeScript', 'Astro', 'Vitest', 'Playwright'],
  links: [{ label: 'Code on GitHub', url: 'https://github.com/KCMake/house-of-chen' }],
  writeup: {
    problem: [
      'A portfolio gets a few seconds from someone who has never heard of me. It has to say who I am and what I want right away, and still have depth for an engineer who wants to see how I think.',
    ],
    firstTry: [
      {
        what: 'A whole restaurant',
        why: "The first version was built as my family's restaurant, with a menu, a swinging door to the kitchen, a lazy Susan, and a phone you could order from. It told a story, but a visitor had to learn the restaurant before they learned anything about me.",
      },
    ],
    broke: [
      {
        what: 'A second version that only told. After the restaurant, the home page became one paragraph whose phrases open in place. It read quickly, but it had no pictures, and every claim in it had to be taken on trust.',
        fix: 'The first screen now runs one of the projects, and the paragraph moved to the About page.',
      },
      {
        what: 'A comma on a line by itself. Each word was an inline-block so it could slide with a transform, but Chrome allows a line break after any inline-block, so the comma after a highlighted phrase could wrap onto the next line alone.',
        fix: 'Words stay ordinary inline text and slide with relative left and top offsets instead, so the browser wraps the paragraph like any other.',
      },
      {
        what: 'Highlights that ran past the end of a line. Stretching each highlighted word over the space after it made the marker stick out wherever a phrase wrapped.',
        fix: 'The spaces inside a phrase get spans of their own. A space at the end of a line collapses to nothing, so the marker stops where the words do.',
      },
    ],
    shipped: [
      "The first screen says who I am in two sentences, next to Free Curb ATL running on the page. Change the day or the hour and all 2,035 blocks are worked out again, with the same data and the same meter rules as the real map.",
      "Projects that can run in a browser get a running piece at the top of their write-up. CourseSniper's is its seat rule: you make students drop and register, and the bot decides whether that deserves a ping.",
      'The About page is one paragraph. Every highlighted phrase opens more text in place, down to quoted code. Without JavaScript, every phrase is already open.',
      'AI tools pull websites toward the same handful of looks. A check in CI reads the code and fails the build when one of those defaults shows up, like a stock typeface, gradient headline text, or blurred glass panels.',
    ],
    steps: [
      { name: 'src/demos', detail: 'Each running piece is a pure model with unit tests, plus a small script that draws it. The curb model is checked against the numbers the real map reports.' },
      { name: 'public/demo/curbs.json', detail: "Free Curb ATL's 2,035 blocks, packed from a megabyte of GeoJSON down to about 90 KB over the wire, and loaded after the text is on screen." },
      { name: 'src/art', detail: 'One small drawing per project, all on the same grid with the same line weight and colors.' },
      { name: 'src/data/sentence.ts', detail: 'The About paragraph as data: plain text, phrases, and what each phrase opens. Tests check that every phrase opens to something and that the open paragraph still reads as clean sentences.' },
      { name: 'src/data/projects', detail: 'One file per project. The work list, the write-ups, and the resume read from the same files, so they cannot disagree.' },
      { name: 'Astro', detail: 'Turns the data into static pages. Nothing runs on a server.' },
      { name: 'src/scripts/sentence.ts', detail: 'Opens and closes phrases and slides the words that move. No animation library.' },
      { name: 'CI on every push', detail: 'The AI-look check, unit tests, a production build, and browser tests with an accessibility scan, then a deploy to GitHub Pages.' },
    ],
    excerpts: [
      {
        file: 'src/scripts/sentence.ts',
        lang: 'ts',
        url: `${REPO}/src/scripts/sentence.ts#L58-L72`,
        startLine: 58,
        note: 'Every word that moved starts where it was and slides to where it is now. Words that just appeared fade in instead.',
        code: [
          '  let fresh = 0;',
          '  for (const el of after) {',
          '    const was = before.get(el);',
          '    if (was) {',
          '      const now = el.getBoundingClientRect();',
          '      const dx = was.left - now.left;',
          '      const dy = was.top - now.top;',
          '      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {',
          "        el.animate([{ left: `${dx}px`, top: `${dy}px` }, { left: '0px', top: '0px' }], { duration: MOVE_MS, easing: GLIDE });",
          '      }',
          '    } else if (fadeIn) {',
          '      const delay = 90 + Math.min(fresh++, 70) * 8;',
          "      el.animate([{ opacity: 0, top: '0.4em' }, { opacity: 1, top: '0em' }], { duration: 340, delay, easing: FADE, fill: 'backwards' });",
          '    }',
          '  }',
        ].join('\n'),
      },
    ],
  },
};

export default project;
