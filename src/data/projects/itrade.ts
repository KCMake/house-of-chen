import type { Project } from '../types';

const project: Project = {
  slug: 'itrade',
  number: 'P4',
  section: 'plates',
  name: 'ITrade',
  short: 'An open-source framework for auditable AI trading agents. Every action is logged, rate limits are hard, and runs happen in a sandbox.',
  result: 'in progress',
  spice: 3,
  combos: ['c1'],
  stack: [
    { name: 'Python', kind: 'soy' },
    { name: 'Docker', kind: 'chili' },
    { name: 'MCP', kind: 'chili' },
    { name: 'OAuth 2.0', kind: 'chili' },
  ],
  aliases: ['itrade', 'trading', 'trading agents', 'stocks', 'audit', 'sandbox'],
};

export default project;
