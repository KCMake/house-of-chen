import { describe, expect, it } from 'vitest';
import { isSpace, tokens } from '../../src/lib/words';

describe('tokens', () => {
  it('splits words and keeps the spaces between them', () => {
    expect(tokens('a map of')).toEqual(['a', ' ', 'map', ' ', 'of']);
  });

  it('keeps leading and trailing space, which an opened phrase starts with', () => {
    expect(tokens(' (at Osho ')).toEqual([' ', '(at', ' ', 'Osho', ' ']);
  });

  it('gives the text back when joined', () => {
    const text = "Atlanta doesn't publish\n  where its meters are.";
    expect(tokens(text).join('')).toBe(text);
  });

  it('returns nothing for empty text', () => {
    expect(tokens('')).toEqual([]);
  });
});

describe('isSpace', () => {
  it('is true for any run of whitespace and false for anything else', () => {
    expect(isSpace(' ')).toBe(true);
    expect(isSpace('\n  ')).toBe(true);
    expect(isSpace(',')).toBe(false);
    expect(isSpace('map')).toBe(false);
  });
});
