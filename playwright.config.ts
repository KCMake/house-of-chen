import { defineConfig, devices } from '@playwright/test';

const port = 4329;
const base = process.env.BASE_PATH ?? '/house-of-chen/';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${port}${base}`,
    reducedMotion: 'reduce',
    // Use the installed Google Chrome, here and on GitHub's Ubuntu runners, so nothing has to be downloaded.
    channel: 'chrome',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 860 } } },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
  // A plain static server, so tests behave the same everywhere. Build first.
  webServer: {
    command: `node scripts/serve.mjs --port ${port}`,
    url: `http://localhost:${port}${base}`,
    reuseExistingServer: !process.env.CI,
  },
});
