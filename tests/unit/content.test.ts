import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { allProjects, kitchenTickets, menu, sections, tableDishes } from '../../src/data/projects';
import * as site from '../../src/data/site';

const strings = (value: unknown): string[] => {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
};

const PREFIX = { specials: 'S', workshop: 'W', plates: 'P', family: 'F', house: 'H' } as const;

describe('the menu', () => {
  it('has unique slugs and numbers', () => {
    expect(new Set(allProjects.map((p) => p.slug)).size).toBe(allProjects.length);
    expect(new Set(allProjects.map((p) => p.number)).size).toBe(allProjects.length);
  });

  it('numbers each dish with its section letter', () => {
    for (const p of allProjects) expect(p.number, p.slug).toMatch(new RegExp(`^${PREFIX[p.section]}\\d+$`));
  });

  it('prints every section', () => {
    for (const s of sections) expect(menu.some((p) => p.section === s.id), s.id).toBe(true);
  });

  it('seats six dishes on the lazy Susan', () => {
    expect(tableDishes.map((p) => p.plate?.seat)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('gives every kitchen ticket at least three steps on the line', () => {
    for (const p of kitchenTickets) expect(p.kitchen!.line.length, p.slug).toBeGreaterThanOrEqual(3);
  });
});

describe('the words', () => {
  const everything = [...strings(allProjects), ...strings(site)];

  it('has no em dashes', () => {
    for (const s of everything) expect(s).not.toMatch(/—/);
  });

  it('has nothing that looks like a phone number', () => {
    for (const s of everything) expect(s).not.toMatch(/\b\d{3}[-. )]\s?\d{3}[-. ]\d{4}\b/);
  });

  it('links only over https', () => {
    for (const p of allProjects) for (const l of p.links ?? []) expect(l.url).toMatch(/^https:\/\//);
  });
});

describe('the printouts', () => {
  const printouts = kitchenTickets.flatMap((p) => p.kitchen!.printouts ?? []);

  it('pins code from other repos to a commit', () => {
    for (const p of printouts) {
      if (p.url.includes('/house-of-chen/')) continue;
      expect(p.url).toMatch(/\/blob\/[0-9a-f]{40}\//);
    }
  });

  it("quotes this repo's own code exactly, at the right lines", () => {
    for (const p of printouts.filter((x) => x.url.includes('/house-of-chen/blob/main/'))) {
      const path = p.url.split('/blob/main/')[1].split('#')[0];
      const file = readFileSync(path, 'utf8').split('\n');
      const excerpt = p.code.split('\n');
      expect(file.slice(p.startLine - 1, p.startLine - 1 + excerpt.length)).toEqual(excerpt);
      const [, from, to] = p.url.match(/#L(\d+)-L(\d+)$/)!;
      expect(Number(from)).toBe(p.startLine);
      expect(Number(to)).toBe(p.startLine + excerpt.length - 1);
    }
  });
});
