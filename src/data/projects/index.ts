import type { Project } from '../types';

const modules = import.meta.glob<{ default: Project }>(['./*.ts', '!./index.ts'], { eager: true });

export const allProjects: Project[] = Object.values(modules).map((m) => m.default);

export function bySlug(slug: string): Project {
  const project = allProjects.find((p) => p.slug === slug);
  if (!project) throw new Error(`There is no project called ${slug}.`);
  return project;
}

/** The two lists on the home page, in the order worth reading. */
export const lists = [
  {
    id: 'projects',
    title: 'Projects',
    projects: ['ai-phone-ordering', 'free-curb-atl', 'cogni', 'tuck', 'agrinexus', 'opening-day', 'quill', 'coursesniper', 'itrade', 'portify', 'vex-1961z'].map(bySlug),
  },
  {
    id: 'leadership',
    title: 'Leadership',
    projects: ['buildforge', 'hong-kong-city', 'basketball', 'pep-georgia', 'basement-robotics'].map(bySlug),
  },
];

/** Every project with a write-up, in list order, then this site. Each gets a page at /work/<slug>/. */
export const writeups: Project[] = [...lists.flatMap((list) => list.projects), bySlug('this-site')].filter((p) => p.writeup);
