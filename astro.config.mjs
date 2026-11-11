// @ts-check
import { defineConfig } from 'astro/config';

// The site builds for GitHub Pages at /house-of-chen/ by default.
// Set SITE_URL and BASE_PATH to build for another address, like a custom domain at /.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://kcmake.github.io',
  base: process.env.BASE_PATH ?? '/house-of-chen/',
  devToolbar: { enabled: false },
});
