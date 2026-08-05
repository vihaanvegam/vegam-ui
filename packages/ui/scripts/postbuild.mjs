/**
 * Enforces the compatibility contract on every build. A build that "succeeds"
 * but violates any check here is a broken build — fail loudly, locally.
 */
import { copyFileSync, existsSync, readFileSync, renameSync } from 'node:fs';

const fail = (message) => {
  console.error(`postbuild: ${message}`);
  process.exit(1);
};

// Vite names the extracted stylesheet via build.lib.cssFileName; guard the
// rename in case a Vite upgrade regresses to the default style.css.
if (!existsSync('dist/index.css') && existsSync('dist/style.css')) {
  renameSync('dist/style.css', 'dist/index.css');
}

for (const file of ['dist/index.js', 'dist/index.cjs', 'dist/index.css', 'dist/index.d.ts']) {
  if (!existsSync(file)) fail(`${file} is missing`);
}

// Dual declarations: same content, but the .d.cts extension is what makes
// `require` consumers under node16/nodenext resolve CJS-flavoured types.
copyFileSync('dist/index.d.ts', 'dist/index.d.cts');

const [firstLine = ''] = readFileSync('dist/index.js', 'utf8').split('\n', 1);
if (!firstLine.includes('use client')) {
  fail(`dist/index.js line 1 must contain 'use client'; got: ${JSON.stringify(firstLine)}`);
}
