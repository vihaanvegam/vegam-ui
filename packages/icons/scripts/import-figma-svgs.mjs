#!/usr/bin/env node
/**
 * Writes svg/ from a Figma export payload, and tells you what is still missing.
 *
 *   node scripts/import-figma-svgs.mjs                 report progress + print
 *                                                      the next export snippet
 *   node scripts/import-figma-svgs.mjs exported.json   write those icons
 *
 * The payload is whatever the Desktop Bridge returns for the snippet this
 * script prints — an object keyed by icon name:
 *
 *   { "ChevronDown": { "vb": "0 0 16 16", "d": "<path …/>" }, … }
 *
 * Why this exists: the bridge drops its WebSocket if an `exportAsync` loop runs
 * much past five seconds, so the set has to come over in small batches, and a
 * batch that lands must not be lost when the next one fails. Run it repeatedly
 * until it reports nothing missing, then `pnpm icons`.
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

/** Icon/ChevronDown → chevron-down (the inverse of build-icons.mjs's pascal). */
const kebab = (name) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();

const root = fileURLToPath(new URL('..', import.meta.url));
const svgDir = path.join(root, 'svg');
const map = JSON.parse(readFileSync(path.join(root, 'figma-nodes.json'), 'utf8'));

mkdirSync(svgDir, { recursive: true });

const payloadPath = process.argv[2];
if (payloadPath !== undefined) {
  const payload = JSON.parse(readFileSync(payloadPath, 'utf8'));
  let written = 0;
  for (const [name, { vb, d }] of Object.entries(payload)) {
    if (typeof vb !== 'string' || typeof d !== 'string' || d === '') {
      console.error(`import: skipping ${name} — payload has no viewBox/markup`);
      continue;
    }
    // Sources stay verbatim apart from the wrapper; build-icons.mjs owns all
    // normalization, so a redrawn icon diffs cleanly against the design.
    writeFileSync(
      path.join(svgDir, `${kebab(name)}.svg`),
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" fill="none">${d}</svg>\n`,
      'utf8',
    );
    written += 1;
  }
  console.log(`import: wrote ${written} svg(s)`);
}

const have = new Set(readdirSync(svgDir).filter((f) => f.endsWith('.svg')));
const missing = Object.entries(map.nodes).filter(([name]) => !have.has(`${kebab(name)}.svg`));

console.log(`\nicons: ${have.size}/${Object.keys(map.nodes).length} exported from Figma`);

if (missing.length === 0) {
  console.log('Nothing missing. Run `pnpm icons` to regenerate the components.');
  process.exit(0);
}

// Eight is what reliably fits inside the plugin's 5s execution budget.
const batch = missing.slice(0, 8);
console.log(`${missing.length} still missing; next batch (${batch.map(([n]) => n).join(', ')}):\n`);
console.log(`const ids = [${batch.map(([, id]) => `'${id}'`).join(',')}];
const out = {};
for (const id of ids) {
  const node = await figma.getNodeByIdAsync(id);
  const svg = await node.exportAsync({ format: 'SVG_STRING' });
  const inner = svg.replace(/^[\\s\\S]*?<svg[^>]*>/, '').replace(/<\\/svg>\\s*$/, '').trim();
  out[node.name.replace('Icon/', '')] = { vb: (svg.match(/viewBox="([^"]+)"/) || [])[1], d: inner.replace(/\\n/g, '') };
}
return out;`);
