import { describe, expect, it } from 'vitest';
import { writeups } from '../../src/data/projects';
import { allPhrases, isLink, isPhrase, paragraphs, type InlineLink, type Piece } from '../../src/data/sentence';

/** The paragraph with every phrase open, the way it reads without JavaScript. */
function readOpen(pieces: Piece[]): string {
  return pieces
    .map((piece) => {
      if (typeof piece === 'string') return piece;
      if (isLink(piece)) return piece.text;
      return Array.isArray(piece.more) ? `${piece.text} (${readOpen(piece.more)})` : piece.text;
    })
    .join('');
}

function linksIn(pieces: Piece[]): InlineLink[] {
  return pieces.flatMap((piece) => {
    if (typeof piece === 'string') return [];
    if (isLink(piece)) return [piece];
    return Array.isArray(piece.more) ? linksIn(piece.more) : [];
  });
}

describe('the paragraph', () => {
  it('gives every phrase its own id', () => {
    const ids = allPhrases.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('opens every phrase to something', () => {
    for (const p of allPhrases) {
      if (Array.isArray(p.more)) expect(readOpen(p.more).trim().length, p.id).toBeGreaterThan(0);
      else expect(p.more.code.length, p.id).toBeGreaterThan(0);
    }
  });

  it('highlights something in every paragraph', () => {
    for (const paragraph of paragraphs) expect(paragraph.some(isPhrase)).toBe(true);
  });

  it('keeps spaces out of the edges of phrases, so highlights end on a word', () => {
    for (const p of allPhrases) expect(p.text).toBe(p.text.trim());
  });

  it('still reads as clean sentences with everything open', () => {
    for (const paragraph of paragraphs) {
      const text = readOpen(paragraph);
      expect(text).not.toMatch(/ {2}/);
      expect(text).not.toMatch(/ [,.)]/);
      expect(text).not.toMatch(/\( /);
      expect(text).toMatch(/[.]$/);
    }
  });

  it('only links to pages that exist', () => {
    const pages = new Set(['resume/', ...writeups.map((p) => `work/${p.slug}/`)]);
    for (const link of paragraphs.flatMap(linksIn)) {
      if (link.email) continue;
      if (link.href?.startsWith('https://')) continue;
      expect(pages.has(link.href ?? ''), link.href).toBe(true);
    }
  });
});
