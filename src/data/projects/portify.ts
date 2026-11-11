import type { Project } from '../types';

const project: Project = {
  slug: 'portify',
  number: 'P5',
  section: 'plates',
  name: 'Portify',
  short: "Reads Georgia Tech's near-daily newsletter and logs every scholarship, internship, and research posting to a Google Sheet.",
  result: 'every posting',
  spice: 1,
  combos: ['c1'],
  stack: [
    { name: 'JavaScript', kind: 'soy' },
    { name: 'Apps Script', kind: 'chili' },
  ],
  aliases: ['portify', 'newsletter', 'google sheet', 'apps script', 'scholarships', 'email parsing'],
};

export default project;
