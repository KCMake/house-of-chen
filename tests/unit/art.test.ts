import { describe, expect, it } from 'vitest';
import { art } from '../../src/art';
import { allProjects } from '../../src/data/projects';
import { TAGS } from '../../src/data/types';

describe('the drawings', () => {
  it('exist for every project, and for nothing else', () => {
    expect(Object.keys(art).sort()).toEqual(allProjects.map((p) => p.slug).sort());
  });

  it('stay on the shared grid and use only the shared classes', () => {
    for (const [slug, svg] of Object.entries(art)) {
      expect(svg, slug).not.toMatch(/<svg|style=|fill=|stroke="/);
      for (const [, name] of svg.matchAll(/class="([^"]+)"/g)) expect(['g', 'r', 'o', 'f', 'fg', 'fy'], slug).toContain(name);
      for (const [, n] of svg.matchAll(/\b(?:x|cx|y|cy)="([\d.]+)"/g)) expect(Number(n), slug).toBeLessThanOrEqual(96);
    }
  });
});

describe('the work filter', () => {
  it('has at least one tag on every project, all from the known list', () => {
    for (const p of allProjects) {
      expect(p.tags.length, p.slug).toBeGreaterThan(0);
      for (const tag of p.tags) expect(TAGS, p.slug).toContain(tag);
    }
  });

  it('gives no two projects in a list the same place', () => {
    const places = allProjects.map((p) => `${p.group}:${p.order}`);
    expect(new Set(places).size).toBe(places.length);
  });
});
