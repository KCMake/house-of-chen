import type { Project } from '../types';

const project: Project = {
  slug: 'ai-phone-ordering',
  name: 'AI phone ordering',
  line: 'Took real phone orders for a live restaurant and turned free-form speech into validated orders.',
  result: 'live calls',
  group: 'projects',
  order: 10,
  tags: ['AI', 'Tools'],
  role: 'AI Solutions Architect, Osho Sushi & Hibachi',
  when: 'Dec 2025 to May 2026',
  stack: ['Python', 'FastAPI', 'PostgreSQL', 'Redis'],
  writeup: {
    problem: [
      'Osho Sushi & Hibachi in Atlanta wanted its phone orders answered by software. Callers talk the way people talk, and an order has to be right before it reaches the kitchen.',
    ],
    shipped: [
      'I built and deployed a voice-ordering system that handled inbound calls end to end for the live restaurant. A multi-agent orchestration layer turned free-form speech into structured order objects and validated them before anything reached the kitchen.',
      'I owned it in production for six months, including error handling, latency tuning, and iteration on live calls.',
    ],
    steps: [
      { name: 'Inbound call', detail: 'A customer phones the restaurant.' },
      { name: 'Free-form speech', detail: 'They order in their own words.' },
      { name: 'Multi-agent orchestration', detail: 'Agents turn what was said into a structured order object.' },
      { name: 'Validation', detail: 'The order is checked before it is accepted.' },
      { name: 'FastAPI backend', detail: 'PostgreSQL keeps the orders. Redis holds the session state for each call.' },
    ],
    stats: [
      { value: 'Live', label: 'calls from real customers' },
      { value: '6 months', label: 'owned in production' },
    ],
  },
};

export default project;
