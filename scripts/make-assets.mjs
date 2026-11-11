#!/usr/bin/env node
/**
 * Makes the files that come from the site itself: the one-page resume PDF, the link-preview
 * image, and the README screenshots. Run it after `npm run build`, then build again so the
 * new files are included.
 *
 *   npm run build && npm run assets && npm run build
 */
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { serve } from './serve.mjs';

const { server, origin } = await serve();

// Locally, use the installed Chrome instead of downloading a browser.
const browser = await chromium.launch(process.env.CI ? {} : { channel: 'chrome' });
try {
  const resume = await browser.newPage();
  await resume.goto(`${origin}resume/`, { waitUntil: 'networkidle' });
  await resume.pdf({ path: 'public/kenney-chen-resume.pdf', format: 'Letter', printBackground: true, preferCSSPageSize: true });

  const og = await browser.newPage({ viewport: { width: 1200, height: 630 }, reducedMotion: 'reduce' });
  await og.goto(`${origin}og/`, { waitUntil: 'networkidle' });
  await og.screenshot({ path: 'public/og.png' });

  await mkdir('docs', { recursive: true });
  const desk = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  await desk.goto(origin, { waitUntil: 'networkidle' });
  await desk.screenshot({ path: 'docs/home.png' });
  await desk.getByRole('button', { name: 'a map of every free curb in Atlanta', exact: true }).click();
  await desk.getByRole('button', { name: 'worked out all 2,035 blocks', exact: true }).click();
  await desk.screenshot({ path: 'docs/home-open.png' });
  await desk.goto(`${origin}work/free-curb-atl/`, { waitUntil: 'networkidle' });
  await desk.screenshot({ path: 'docs/write-up.png' });
} finally {
  await browser.close();
  server.close();
}
console.log('Wrote public/kenney-chen-resume.pdf, public/og.png, and the screenshots in docs/.');
