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
  await resume.goto(`${origin}to-go/`, { waitUntil: 'networkidle' });
  await resume.pdf({ path: 'public/kenney-chen-resume.pdf', format: 'Letter', printBackground: true, preferCSSPageSize: true });

  const og = await browser.newPage({ viewport: { width: 1200, height: 630 }, reducedMotion: 'reduce' });
  await og.goto(`${origin}og/`, { waitUntil: 'networkidle' });
  await og.screenshot({ path: 'public/og.png' });

  await mkdir('docs', { recursive: true });
  const desk = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  await desk.goto(origin, { waitUntil: 'networkidle' });
  await desk.screenshot({ path: 'docs/front-of-house.png' });
  await desk.goto(`${origin}kitchen/free-curb-atl/`, { waitUntil: 'networkidle' });
  await desk.screenshot({ path: 'docs/back-of-house.png' });

  const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  await phone.goto(origin, { waitUntil: 'networkidle' });
  await phone.screenshot({ path: 'docs/phone.png' });
} finally {
  await browser.close();
  server.close();
}
console.log('Wrote public/kenney-chen-resume.pdf, public/og.png, and the screenshots in docs/.');
