import type { Project, Section } from '../types';

const modules = import.meta.glob<{ default: Project }>(['./*.ts', '!./index.ts'], { eager: true });

export const sections: { id: Exclude<Section, 'house'>; title: string; prefix: string }[] = [
  { id: 'specials', title: "Chef's specials", prefix: 'S' },
  { id: 'workshop', title: 'From the workshop', prefix: 'W' },
  { id: 'plates', title: 'Small plates', prefix: 'P' },
  { id: 'family', title: 'Family style', prefix: 'F' },
];

const ORDER: Section[] = ['specials', 'workshop', 'plates', 'family', 'house'];

function byNumber(a: Project, b: Project): number {
  return ORDER.indexOf(a.section) - ORDER.indexOf(b.section) || Number(a.number.slice(1)) - Number(b.number.slice(1));
}

export const allProjects: Project[] = Object.values(modules)
  .map((m) => m.default)
  .sort(byNumber);

/** Everything printed on the front-of-house menu. */
export const menu = allProjects.filter((p) => p.onMenu !== false);

/** Dishes with a back-of-house ticket. */
export const kitchenTickets = allProjects.filter((p) => p.kitchen);

/** The six dishes on the lazy Susan, in seat order. */
export const tableDishes = menu
  .filter((p) => p.plate)
  .sort((a, b) => (a.plate?.seat ?? 0) - (b.plate?.seat ?? 0));

export function bySlug(slug: string): Project | undefined {
  return allProjects.find((p) => p.slug === slug);
}
