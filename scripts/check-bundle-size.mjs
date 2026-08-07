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
const packagesDir = join(__dirname, '..', 'packages');

// Budgets in bytes, sized for the FULL committed catalog (38 components,
// BLUEPRINT §3) so this stops needing a bump every phase.
//
// Measured growth (component count -> dist size):
//   12 comps: ~25KB js / ~42KB css   (pre-Phase-1)
//   24 comps: ~40KB js / ~70KB css   (+ layout, forms)
//   31 comps: ~58KB js / ~81KB css   (+ overlays, feedback)
//
// Two different curves, worth knowing before re-basing again:
//   JS  grows ~2.4KB per component and ACCELERATED in Phase 3 — overlays carry
//       real logic (positioning, focus management, timers), unlike layout
//       primitives. Extrapolating the interactive-component rate to 38 gives
//       roughly 75-80KB.
//   CSS is ~30KB of inlined design tokens (a FIXED floor, independent of
//       component count) plus ~1.7KB per component; 38 components lands near
//       95KB.
// Budgets below clear those projections with ~15% headroom, and still fail on
// a genuine regression (an accidental dependency or a doubling).
//
// icons is a different shape of artifact: a fixed ~1.5KB factory plus roughly
// 360 bytes per icon (measured across the pilot set), so its budget tracks the
// icon COUNT, not a component count. Sized for the full 85-icon Figma set
// (~32KB ESM); it will read low until the whole set is generated.
const BUDGETS = {
  ui: {
    'index.js': 92_000, // ESM bundle (~58KB at 31 components)
    'index.cjs': 74_000, // CJS bundle (~46KB at 31 components)
    'index.css': 112_000, // Stylesheet (~81KB at 31 components; ~30KB is tokens)
  },
  icons: {
    'index.js': 48_000, // ESM bundle (~32KB projected at 85 icons)
    'index.cjs': 44_000, // CJS bundle
  },
};

let failed = false;

console.log('Bundle size check\n');
console.log('File'.padEnd(22) + 'Size'.padStart(10) + 'Budget'.padStart(10) + '  Status');
console.log('-'.repeat(52));

for (const [pkg, budgets] of Object.entries(BUDGETS)) {
  for (const [file, budget] of Object.entries(budgets)) {
    const label = `${pkg}/${file}`;
    const filePath = join(packagesDir, pkg, 'dist', file);
    let size;

    try {
      size = statSync(filePath).size;
    } catch {
      console.log(
        `${label.padEnd(22)}${'missing'.padStart(10)}${formatBytes(budget).padStart(10)}  FAIL`,
      );
      failed = true;
      continue;
    }

    const status = size <= budget ? 'ok' : 'OVER';
    const pct = ((size / budget) * 100).toFixed(0);

    console.log(
      `${label.padEnd(22)}${formatBytes(size).padStart(10)}${formatBytes(budget).padStart(10)}  ${status} (${pct}%)`,
    );

    if (size > budget) {
      failed = true;
    }
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
