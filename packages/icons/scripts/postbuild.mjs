/**
 * Enforces the compatibility contract on every icons build — the ui postbuild
 * with the directive assert INVERTED: icons must stay free of 'use client' so
 * they render straight from a server component (docs/ICONS_PLAN.md §1).
 */
import { copyFileSync, existsSync, readFileSync } from 'node:fs';

const fail = (message) => {
  console.error(`postbuild: ${message}`);
  process.exit(1);
};

for (const file of ['dist/index.js', 'dist/index.cjs', 'dist/index.d.ts']) {
  if (!existsSync(file)) fail(`${file} is missing`);
}

// icons ships no stylesheet — a CSS file here means something leaked in.
if (existsSync('dist/index.css') || existsSync('dist/style.css')) {
  fail('a stylesheet was emitted; @vegam-ui/icons must ship no CSS');
}

// Dual declarations: same content, but the .d.cts extension is what makes
// `require` consumers under node16/nodenext resolve CJS-flavoured types.
copyFileSync('dist/index.d.ts', 'dist/index.d.cts');

for (const file of ['dist/index.js', 'dist/index.cjs']) {
  if (/['"]use client['"]/.test(readFileSync(file, 'utf8'))) {
    fail(`${file} contains 'use client'; icons must stay server-component safe`);
  }
}
