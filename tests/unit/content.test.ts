import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { allProjects, lists, writeups } from '../../src/data/projects';
import { allPhrases, opensExcerpt, paragraphs } from '../../src/data/sentence';
import * as site from '../../src/data/site';
import type { Excerpt } from '../../src/data/types';

const strings = (value: unknown): string[] => {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
};

describe('the projects', () => {
  it('have unique slugs', () => {
    expect(new Set(allProjects.map((p) => p.slug)).size).toBe(allProjects.length);
  });

  it('each show up once on the home page, except this site, which the footer links to', () => {
    const listed = lists.flatMap((list) => list.projects.map((p) => p.slug));
    expect(new Set(listed).size).toBe(listed.length);
    expect([...listed, 'this-site'].sort()).toEqual(allProjects.map((p) => p.slug).sort());
  });

  it('give every write-up a problem and at least three steps', () => {
    for (const p of writeups) {
      expect(p.writeup!.problem.length, p.slug).toBeGreaterThan(0);
      expect(p.writeup!.steps.length, p.slug).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('the words', () => {
  const everything = [...strings(allProjects), ...strings(site), ...strings(paragraphs)];

  it('have no em dashes', () => {
    for (const s of everything) expect(s).not.toMatch(/—/);
  });

  it('have nothing that looks like a phone number', () => {
    for (const s of everything) expect(s).not.toMatch(/\b\d{3}[-. )]\s?\d{3}[-. ]\d{4}\b/);
  });

  it('link only over https', () => {
    for (const p of allProjects) for (const link of p.links ?? []) expect(link.url).toMatch(/^https:\/\//);
  });
});

describe('the code excerpts', () => {
  const excerpts: Excerpt[] = [
    ...writeups.flatMap((p) => p.writeup!.excerpts ?? []),
    ...allPhrases.filter(opensExcerpt).map((p) => p.more),
  ];

  it('link to exactly the lines they quote', () => {
    for (const e of excerpts) {
      const [, from, to] = e.url.match(/#L(\d+)-L(\d+)$/) ?? [];
      expect(Number(from), e.url).toBe(e.startLine);
      expect(Number(to), e.url).toBe(e.startLine + e.code.split('\n').length - 1);
    }
  });

  it('pin code from other repos to a commit', () => {
    for (const e of excerpts) {
      if (e.url.includes('/house-of-chen/')) continue;
      expect(e.url).toMatch(/\/blob\/[0-9a-f]{40}\//);
    }
  });

  it("quote this repo's own code exactly", () => {
    const own = excerpts.filter((e) => e.url.includes('/house-of-chen/blob/main/'));
    expect(own.length).toBeGreaterThan(0);
    for (const e of own) {
      const path = e.url.split('/blob/main/')[1].split('#')[0];
      const file = readFileSync(path, 'utf8').split('\n');
      const quote = e.code.split('\n');
      expect(file.slice(e.startLine - 1, e.startLine - 1 + quote.length)).toEqual(quote);
    }
  });
});
