import type { Project } from '../types';

const project: Project = {
  slug: 'ai-phone-ordering',
  number: 'S1',
  section: 'specials',
  name: 'AI phone ordering',
  short: 'Took real phone orders for a live restaurant and turned free-form speech into validated orders.',
  result: 'live calls',
  spice: 3,
  combos: ['c1'],
  stack: [
    { name: 'Python', kind: 'soy' },
    { name: 'FastAPI', kind: 'chili' },
    { name: 'PostgreSQL', kind: 'chili' },
    { name: 'Redis', kind: 'chili' },
  ],
  role: 'AI Solutions Architect, Osho Sushi & Hibachi',
  when: 'Dec 2025 to May 2026',
  aliases: ['osho', 'phone ordering', 'voice ordering', 'phone orders', 'voice', 'hibachi', 'sushi', 'multi agent'],
  plate: { art: 'phone', seat: 0 },
  kitchen: {
    order: [
      'Osho Sushi & Hibachi in Atlanta wanted its phone orders answered by software. I built and deployed a voice-ordering system that handled inbound calls end to end for the live restaurant.',
      'Callers talk the way people talk. A multi-agent orchestration layer turned that free-form speech into structured order objects and validated them before anything reached the kitchen. The backend is Python and FastAPI, with PostgreSQL for order persistence and Redis for each call\'s session state.',
      'I owned it in production, including error handling, latency tuning, and iteration on live calls.',
    ],
    line: [
      { step: 'Inbound call', detail: 'A customer phones the restaurant.' },
      { step: 'Free-form speech', detail: 'They order the way people talk, not the way a form asks.' },
      { step: 'Multi-agent orchestration', detail: 'Agents turn what was said into a structured order object.' },
      { step: 'Validation', detail: 'The order is checked before it is accepted.' },
      { step: 'FastAPI backend', detail: 'PostgreSQL keeps the orders. Redis holds the session state for each call.' },
    ],
    tally: [
      { value: 'Live', label: 'calls from real customers' },
      { value: '6 months', label: 'owned in production' },
    ],
  },
};

export default project;
