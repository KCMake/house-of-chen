import type { Project } from '../types';

const COMMIT = 'https://github.com/KCMake/CourseSniper/blob/e70b9c62c508078eec19241f6aea6c44fd2888e3';

const project: Project = {
  slug: 'coursesniper',
  name: 'CourseSniper',
  line: 'A Discord bot that pings you the moment a course section or waitlist spot opens up, at 173 schools in 38 states and DC.',
  result: '173 schools',
  group: 'projects',
  order: 80,
  tags: ['Tools'],
  demo: 'sniper',
  stack: ['Python', 'Discord'],
  links: [{ label: 'Code on GitHub', url: 'https://github.com/KCMake/CourseSniper' }],
  writeup: {
    problem: [
      'The class you need is full. Seats do open up when someone drops, but you only get one if you happen to be looking at the registration page at that moment.',
    ],
    shipped: [
      'You tell the bot which sections you want, and it watches them. When a section moves between full, waitlist open, and open, it pings you in Discord with the seat counts.',
      'The rule that decides what counts as open took the most care. An empty seat is not a free seat, because schools offer it to the waitlist first. The bot only says a section is open when there are more empty seats than people waiting.',
    ],
    steps: [
      { name: 'adapters/', detail: "One adapter per registration system. Each one turns a school's answer into the same seat counts." },
      { name: 'models.py', detail: 'Works out what a student can do right now: register, join the waitlist, or neither.' },
      { name: 'poller.py', detail: "Checks tracked sections on a loop and reports changes. Each school runs its own loop, so one school's outage can't delay anyone else's ping." },
      { name: 'Backing off', detail: 'When a school stops answering, the wait doubles each time, up to 30 minutes, with a little randomness so schools are not all checked at the same moment.' },
      { name: 'Retrying pings', detail: 'If a ping fails to send, the old seat counts are kept, so the next check sees the change again. A second ping is better than a missed one.' },
      { name: 'Missing sections', detail: "A section has to be missing ten checks in a row before it is dropped, so a brief glitch can't wipe out everyone's tracking." },
    ],
    excerpts: [
      {
        file: 'src/coursesniper/models.py',
        lang: 'python',
        url: `${COMMIT}/src/coursesniper/models.py#L36-L50`,
        startLine: 36,
        note: 'The whole rule. The demo at the top of this page runs it for a school that publishes its seat counts.',
        code: "    def state(self) -> SeatState:\n        \"\"\"What a student can actually do right now.\n\n        \"vacant > 0\" alone is misleading: vacant seats are offered to the\n        waitlist first, so a seat only counts as free once there are more\n        vacant seats than people waiting. Checked against Banner's own\n        ``openSection`` flag, which equals ``state != CLOSED``.\n        \"\"\"\n        if self.reported_open is not None:\n            return SeatState.OPEN if self.reported_open else SeatState.CLOSED\n        if (self.vacant or 0) > (self.wait_taken or 0):\n            return SeatState.OPEN\n        if self.waitlist_open:\n            return SeatState.WAITLIST\n        return SeatState.CLOSED",
      },
    ],
    stats: [
      { value: '173', label: 'schools' },
      { value: '38', label: 'states, plus DC' },
      { value: '60 s', label: 'between checks, by default' },
    ],
  },
};

export default project;
