#!/usr/bin/env node
/**
 * A small static server for dist/, used by the browser tests and the asset script.
 * It serves the site under its base path and answers unknown pages with 404.html,
 * the way GitHub Pages does.
 *
 *   node scripts/serve.mjs --port 4329
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
};

export function serve({ dist = 'dist', base = process.env.BASE_PATH ?? '/house-of-chen/', port = 0, host = '127.0.0.1' } = {}) {
  const root = resolve(dist);
  const server = createServer(async (req, res) => {
    let path = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
    if (path === base.replace(/\/$/, '')) path = base;
    if (path.startsWith(base)) {
      path = path.slice(base.length);
      if (path === '' || path.endsWith('/')) path += 'index.html';
      const file = normalize(join(root, path));
      if (file.startsWith(root)) {
        try {
          const body = await readFile(file);
          res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(body);
          return;
        } catch {
          // Fall through to the 404 page.
        }
      }
    }
    try {
      res.writeHead(404, { 'content-type': TYPES['.html'] }).end(await readFile(join(root, '404.html')));
    } catch {
      res.writeHead(404).end('Not found');
    }
  });
  return new Promise((done) => {
    server.listen(port, host, () => done({ server, origin: `http://${host}:${server.address().port}${base}` }));
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const flag = process.argv.indexOf('--port');
  const port = flag > -1 ? Number(process.argv[flag + 1]) : 4329;
  const { origin } = await serve({ port, host: 'localhost' });
  console.log(`Serving dist/ at ${origin}`);
}
