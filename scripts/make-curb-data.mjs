#!/usr/bin/env node
/**
 * Packs Free Curb ATL's block data into a small file the home page can draw.
 *
 *   node scripts/make-curb-data.mjs ../atl-free-parking/data/parking.geojson
 *
 * The source is data/parking.geojson from github.com/KCMake/atl-free-parking. Coordinates there
 * already have five decimals, so they are stored as whole numbers counted from the south-west corner.
 * The result is checked in at public/demo/curbs.json, so the site builds without the other repo.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const STATUSES = ['free', 'paid', 'limited', 'check', 'campus', 'none', 'night'];

export function pack(geojson) {
  const features = geojson.features;
  let west = Infinity, south = Infinity, east = -Infinity, north = -Infinity;
  for (const f of features) {
    for (const [lon, lat] of f.geometry.coordinates) {
      west = Math.min(west, lon); east = Math.max(east, lon);
      south = Math.min(south, lat); north = Math.max(north, lat);
    }
  }
  const blocks = features.map((f) => {
    const p = f.properties;
    const status = STATUSES.indexOf(p.status);
    if (status < 0) throw new Error(`Unknown status ${p.status} on block ${p.id}`);
    const points = f.geometry.coordinates.flatMap(([lon, lat]) => [Math.round((lon - west) * 1e5), Math.round((lat - south) * 1e5)]);
    // [status, timed, meter end hour or 0, length in metres, street, address range, points]
    return [status, p.timed ? 1 : 0, p.until ?? 0, p.len, p.name, p.block, points];
  });
  return { west, south, east, north, statuses: STATUSES, blocks };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const source = process.argv[2];
  if (!source) {
    console.error('Usage: node scripts/make-curb-data.mjs <path to parking.geojson>');
    process.exit(1);
  }
  const packed = pack(JSON.parse(readFileSync(source, 'utf8')));
  const out = fileURLToPath(new URL('../public/demo/curbs.json', import.meta.url));
  writeFileSync(out, JSON.stringify(packed));
  console.log(`Wrote ${packed.blocks.length} blocks to public/demo/curbs.json`);
}
