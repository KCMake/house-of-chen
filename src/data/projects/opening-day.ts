import type { Project } from '../types';

const project: Project = {
  slug: 'opening-day',
  number: 'S4',
  section: 'specials',
  name: 'Opening Day',
  short: 'Drop a business on a map of Midtown and watch 3,000 simulated residents decide whether to walk in, each explaining why in their own words.',
  result: '3,000 residents',
  spice: 3,
  combos: ['c1'],
  stack: [
    { name: 'Python', kind: 'soy' },
    { name: 'FastAPI', kind: 'chili' },
    { name: 'NumPy', kind: 'chili' },
    { name: 'React', kind: 'chili' },
    { name: 'deck.gl', kind: 'chili' },
    { name: 'Claude', kind: 'chili' },
  ],
  aliases: ['opening day', 'simulation', 'simulator', 'foot traffic', 'midtown', 'where to open'],
  plate: { art: 'storefront', seat: 5 },
};

export default project;
