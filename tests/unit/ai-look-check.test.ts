import { describe, expect, it } from 'vitest';
import { findIssues } from '../../scripts/ai-look-check.mjs';

const rules = (text: string, file = 'src/styles/x.css') => findIssues(text, file).map((i: { rule: string }) => i.rule);

describe('the AI-look check', () => {
  it('catches default typefaces', () => {
    expect(rules('body { font-family: "Inter", sans-serif; }')).toContain('font');
    expect(rules(':root { --body: "Space Grotesk", sans-serif; }')).toContain('font');
  });

  it("doesn't flag words that only start with a banned name", () => {
    expect(rules('/* Interactive bits */ body { font-family: var(--body); }')).toEqual([]);
  });

  it('catches gradient text, glass, and transition: all', () => {
    expect(rules('h1 { background-clip: text; }')).toContain('gradient-text');
    expect(rules('.nav { backdrop-filter: blur(12px); }')).toContain('glass');
    expect(rules('.card { transition: all 0.2s; }')).toContain('transition-all');
  });

  it('catches purple and lets the restaurant colors through', () => {
    expect(rules('.hero { background: #7c3aed; }')).toContain('purple');
    expect(rules(':root { --menu: #f0b92f; --red: #ab1018; --pen: #1c3da3; --tape: #2a78bd; }')).toEqual([]);
  });

  it('catches tracked-out caps labels and big radii', () => {
    expect(rules('.eyebrow { text-transform: uppercase; letter-spacing: 0.2em; }')).toContain('eyebrow');
    expect(rules('.card { border-radius: 16px; }')).toContain('radius');
    expect(rules('.dot { border-radius: 50%; }')).toEqual([]);
  });

  it('catches stock phrasing, em dashes, emoji, and icon packs', () => {
    expect(rules('<p>Passionate about seamless solutions</p>', 'src/a.astro')).toContain('phrase');
    expect(rules('<p>Fast — and cheap</p>', 'src/a.astro')).toContain('em-dash');
    expect(rules('<h2>\u{1F680} Projects</h2>', 'src/a.astro')).toContain('emoji');
    expect(rules("import { Sparkles } from 'lucide-react';", 'src/a.ts')).toContain('icons');
  });
});
