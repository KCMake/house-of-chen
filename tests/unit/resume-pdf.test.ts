import { readFileSync } from 'node:fs';
import { PDFDocument } from 'pdf-lib';
import { describe, expect, it } from 'vitest';

// scripts/make-assets.mjs prints the resume page to this file. A resume that spills onto a
// second page is a bug.
describe('the resume PDF', () => {
  it('is exactly one page', async () => {
    const pdf = await PDFDocument.load(readFileSync('public/kenney-chen-resume.pdf'));
    expect(pdf.getPageCount()).toBe(1);
  });
});
