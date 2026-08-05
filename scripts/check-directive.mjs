/**
 * CI gate: dist/index.js line 1 must carry 'use client'. The ui postbuild
 * enforces this too; this re-checks it independently of the build pipeline.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const bundle = fileURLToPath(new URL('../packages/ui/dist/index.js', import.meta.url));

let firstLine = '';
try {
  [firstLine = ''] = readFileSync(bundle, 'utf8').split('\n', 1);
} catch {
  console.error(`check:directive — cannot read ${bundle}; run pnpm build first`);
  process.exit(1);
}

if (!firstLine.includes('use client')) {
  console.error(
    `check:directive — dist/index.js line 1 must contain 'use client'; got: ${JSON.stringify(firstLine)}`,
  );
  process.exit(1);
}

console.log("check:directive ok — dist/index.js line 1 carries 'use client'");
