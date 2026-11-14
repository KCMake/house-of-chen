import type { Project } from '../types';

const modules = import.meta.glob<{ default: Project }>(['./*.ts', '!./index.ts'], { eager: true });

export const allProjects: Project[] = Object.values(modules).map((m) => m.default);

export function bySlug(slug: string): Project {
  const project = allProjects.find((p) => p.slug === slug);
  if (!project) throw new Error(`There is no project called ${slug}.`);
  return project;
}

const inGroup = (group: Project['group']) => allProjects.filter((p) => p.group === group).sort((a, b) => a.order - b.order);

/** The two lists on the home page. A project picks its list with `group` and its place with `order`. */
export const lists = [
  { id: 'projects', title: 'Projects', projects: inGroup('projects') },
  { id: 'leadership', title: 'Leadership', projects: inGroup('leadership') },
];

/** Every project with a write-up, in list order, then this site. Each gets a page at /work/<slug>/. */
export const writeups: Project[] = [...lists.flatMap((list) => list.projects), ...inGroup('site')].filter((p) => p.writeup);
