#!/usr/bin/env node
/**
 * Bundle size budget check.
 *
 * Fails if any artifact exceeds its budget. Budgets are set with headroom
 * above current sizes — adjust them as the library grows intentionally.
 *
 * Run: node scripts/check-bundle-size.mjs
 */

import { statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const distDir = join(__dirname, '..', 'packages', 'ui', 'dist');

// Budgets in bytes — current sizes + ~50% headroom for growth
const BUDGETS = {
  'index.js': 40_000, // ESM bundle (~22KB currently)
  'index.cjs': 30_000, // CJS bundle (~17KB currently)
  'index.css': 70_000, // Stylesheet (~42KB currently)
};

let failed = false;

console.log('Bundle size check\n');
console.log('File'.padEnd(15) + 'Size'.padStart(10) + 'Budget'.padStart(10) + '  Status');
console.log('-'.repeat(45));

for (const [file, budget] of Object.entries(BUDGETS)) {
  const filePath = join(distDir, file);
  let size;

  try {
    size = statSync(filePath).size;
  } catch {
    console.log(
      `${file.padEnd(15)}${'missing'.padStart(10)}${formatBytes(budget).padStart(10)}  FAIL`,
    );
    failed = true;
    continue;
  }

  const status = size <= budget ? 'ok' : 'OVER';
  const pct = ((size / budget) * 100).toFixed(0);

  console.log(
    `${file.padEnd(15)}${formatBytes(size).padStart(10)}${formatBytes(budget).padStart(10)}  ${status} (${pct}%)`,
  );

  if (size > budget) {
    failed = true;
  }
}

console.log();

if (failed) {
  console.error(
    'Bundle size budget exceeded. Update BUDGETS in check-bundle-size.mjs if intentional.',
  );
  process.exit(1);
} else {
  console.log('All bundles within budget.');
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  return `${(bytes / 1024).toFixed(1)}KB`;
}
