#!/usr/bin/env node
/**
 * Fails the build when the code drifts toward the looks AI tools default to.
 * A style note is easy to drift away from. A failing check is not.
 *
 *   node scripts/ai-look-check.mjs
 *
 * It reads src/ and the README. Each rule names what it catches and why it's banned.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const FONTS = ['Inter', 'Geist', 'Space Grotesk', 'Instrument Serif', 'Fraunces', 'Playfair Display', 'DM Sans', 'Poppins', 'Montserrat', 'JetBrains Mono', 'IBM Plex'];
const PHRASES = ['passionate', 'seamless', 'seamlessly', 'leverage', 'leveraging', 'elevate', 'cutting-edge', 'delve', 'synergy', 'crafting', 'game-changer', 'world-class', 'not just'];

const STYLE = /\.(css|astro)$/;
const COPY = /\.(astro|ts|md)$/;
const CODE = /\.(astro|ts|mjs|js)$/;

function matchingLines(text, pattern) {
  const hits = [];
  text.split('\n').forEach((line, i) => {
    if (pattern.test(line)) hits.push({ line: i + 1, excerpt: line.trim().slice(0, 120) });
  });
  return hits;
}

function hsl(hex) {
  const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s, l };
}

function purples(text) {
  const hits = [];
  text.split('\n').forEach((line, i) => {
    for (const m of line.matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)) {
      const { h, s, l } = hsl(m[1]);
      if (h >= 250 && h <= 300 && s > 0.3 && l > 0.15 && l < 0.85) {
        hits.push({ line: i + 1, excerpt: line.trim().slice(0, 120) });
        break;
      }
    }
  });
  return hits;
}

function eyebrows(text) {
  const hits = [];
  let offset = 0;
  for (const block of text.split('}')) {
    if (/text-transform\s*:\s*uppercase/.test(block) && /letter-spacing\s*:\s*(0?\.(0[6-9]|[1-9])|[1-9])/.test(block)) {
      const line = text.slice(0, offset + block.indexOf('text-transform')).split('\n').length;
      hits.push({ line, excerpt: block.trim().split('\n')[0].slice(0, 120) });
    }
    offset += block.length + 1;
  }
  return hits;
}

export const rules = [
  { rule: 'font', why: 'a default AI-era typeface', files: STYLE, find: (t) => matchingLines(t, new RegExp(`(font|--[\\w-]+\\s*:)[^;{}]*\\b(${FONTS.join('|')})\\b`)) },
  { rule: 'gradient-text', why: 'gradient-filled headline text', files: STYLE, find: (t) => matchingLines(t, /background-clip\s*:\s*text/) },
  { rule: 'glass', why: 'blurred glass panels', files: STYLE, find: (t) => matchingLines(t, /backdrop-filter\s*:/) },
  { rule: 'transition-all', why: 'transition: all animates everything at once', files: STYLE, find: (t) => matchingLines(t, /transition(-property)?\s*:\s*all\b/) },
  { rule: 'radius', why: 'big rounded corners on everything', files: STYLE, find: (t) => matchingLines(t, /border-radius\s*:\s*(1[2-9]|[2-4]\d)px/) },
  { rule: 'purple', why: 'the indigo-to-violet default palette', files: STYLE, find: purples },
  { rule: 'eyebrow', why: 'tracked-out all-caps labels over everything', files: STYLE, find: eyebrows },
  { rule: 'em-dash', why: 'em dashes in the copy', files: COPY, find: (t) => matchingLines(t, /—/) },
  { rule: 'phrase', why: 'stock AI phrasing', files: COPY, find: (t) => matchingLines(t, new RegExp(`\\b(${PHRASES.join('|')})\\b`, 'i')) },
  { rule: 'emoji', why: 'emoji as decoration', files: COPY, find: (t) => matchingLines(t, /\p{Extended_Pictographic}/u) },
  { rule: 'icons', why: 'a stock icon pack', files: CODE, find: (t) => matchingLines(t, /from ['"](lucide|@heroicons|@phosphor-icons|react-icons|@fortawesome)/) },
];

export function findIssues(text, file) {
  const issues = [];
  for (const r of rules) {
    if (!r.files.test(file)) continue;
    for (const hit of r.find(text)) issues.push({ rule: r.rule, why: r.why, file, ...hit });
  }
  return issues;
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* walk(path);
    else yield path;
  }
}

function main() {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const files = [...walk(join(root, 'src')), join(root, 'README.md')];
  const issues = files.flatMap((f) => findIssues(readFileSync(f, 'utf8'), relative(root, f)));
  if (issues.length) {
    for (const i of issues) console.error(`${i.file}:${i.line}  ${i.rule}: ${i.why}\n    ${i.excerpt}`);
    console.error(`\n${issues.length} AI-look issue(s). Fix them, or make the case for an exception in this script.`);
    process.exit(1);
  }
  console.log(`AI-look check passed: ${files.length} files, ${rules.length} rules.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
