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
  await desk.locator('[data-curb].is-running').waitFor();
  await desk.getByRole('slider', { name: /Hour/ }).fill('14');
  await desk.getByRole('radio', { name: 'Tuesday' }).check({ force: true });
  await desk.screenshot({ path: 'docs/home.png' });
  await desk.getByRole('radio', { name: 'Sunday' }).check({ force: true });
  await desk.screenshot({ path: 'docs/home-sunday.png' });
  await desk.goto(`${origin}work/free-curb-atl/`, { waitUntil: 'networkidle' });
  await desk.screenshot({ path: 'docs/write-up.png' });
} finally {
  await browser.close();
  server.close();
}
console.log('Wrote public/kenney-chen-resume.pdf, public/og.png, and the screenshots in docs/.');
