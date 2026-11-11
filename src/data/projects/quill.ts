import type { Project } from '../types';

const COMMIT = 'https://github.com/KCMake/quill/blob/710d7e6ecb148959b9da723f677db33b81487a2a';

const project: Project = {
  slug: 'quill',
  number: 'P2',
  section: 'plates',
  name: 'Quill',
  short: 'Turns a MacBook trackpad into a drawing tablet, so you can handwrite notes and math.',
  result: 'native macOS',
  spice: 3,
  combos: ['c2'],
  stack: [
    { name: 'Swift', kind: 'soy' },
    { name: 'MultitouchSupport', kind: 'chili' },
    { name: 'Core Graphics', kind: 'chili' },
  ],
  aliases: ['quill', 'trackpad', 'drawing tablet', 'handwriting', 'macbook', 'swift app'],
  links: [{ label: 'Code on GitHub', url: 'https://github.com/KCMake/quill' }],
  kitchen: {
    order: [
      'Writing math with a mouse is miserable. Quill turns the MacBook trackpad into a drawing tablet. Each spot on the glass maps to one fixed spot on the screen, so you touch where you want ink and that is where it goes.',
      'It drives any app where click-and-drag draws, like Excalidraw, tldraw, OneNote, or Preview. Writing lands at a third of its size, so finger wobble shrinks three times too.',
    ],
    line: [
      { step: 'Multitouch.swift', detail: 'Reads absolute finger positions from the private MultitouchSupport framework, the raw data the driver normally turns into relative cursor motion.' },
      { step: 'InkEngine.swift', detail: 'Maps fingers into the box and decides what counts as a stroke. One finger inks after an 80 ms hold window, replayed so nothing is lost. A 1€ filter takes out jitter.' },
      { step: 'Palm and gesture rejection', detail: 'Contacts longer than 18 mm are a resting palm. Two fingers are left alone so scrolling and pinching still work.' },
      { step: 'EventIO.swift', detail: "Posts strokes as ordinary mouse events. An event tap swallows the trackpad's own pointer motion while ink mode is on." },
    ],
    printouts: [
      {
        file: 'Sources/InkEngine.swift',
        lang: 'swift',
        url: `${COMMIT}/Sources/InkEngine.swift#L43-L47`,
        startLine: 43,
        note: 'A lone finger waits 80 ms to see whether a second finger follows. If one does, it was a scroll or a pinch, and nothing gets drawn.',
        code: `    /// How long a lone finger waits before inking, to see whether a second finger follows
    /// (a scroll or pinch). Buffered points are replayed, so nothing drawn is lost.
    var holdDelay = 0.08
    /// Contacts whose long axis exceeds this many millimetres are treated as a resting palm.
    var palmMajorAxis = 18.0`,
      },
      {
        file: 'Sources/InkEngine.swift',
        lang: 'swift',
        url: `${COMMIT}/Sources/InkEngine.swift#L137-L149`,
        startLine: 137,
        note: 'A finger that lifts before the hold window ends was a tap, and a tap should still leave a dot.',
        code: `        case .pending(let id, let start, var points):
            if down.count > 1 {
                phase = .blocked
                onFinger?(nil)
                return
            }
            guard let finger = down.first(where: { $0.id == id }) else {
                // Lifted before the hold delay: a tap, which should still leave a dot.
                if down.isEmpty { tap(points, at: t) }
                phase = down.isEmpty ? .idle : .blocked
                onFinger?(nil)
                return
            }`,
      },
    ],
    tally: [
      { value: '80 ms', label: 'hold window before ink' },
      { value: '18 mm', label: 'palm threshold' },
      { value: '1/3', label: 'scale, so wobble shrinks too' },
    ],
  },
};

export default project;
