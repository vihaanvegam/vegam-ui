/**
 * CI gate: the two packages have OPPOSITE directive requirements, and both
 * matter to consumers.
 *
 *   ui    — dist/index.js line 1 must carry 'use client'. Without it every
 *           interactive component explodes in a Next.js app router tree.
 *   icons — must contain no 'use client' anywhere. Icons are pure markup and
 *           are documented as usable straight from a server component
 *           (docs/ICONS_PLAN.md §1); a stray directive would force every
 *           consumer's icon usage into the client bundle.
 *
 * Each package's postbuild enforces its own half too; this re-checks both
 * independently of the build pipeline.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const read = (relative) => {
  const file = fileURLToPath(new URL(`../${relative}`, import.meta.url));
  try {
    return readFileSync(file, 'utf8');
  } catch {
    console.error(`check:directive — cannot read ${relative}; run pnpm build first`);
    process.exit(1);
  }
};

// ui: positive assert, line 1 specifically (rollup hoists it there).
const [uiFirstLine = ''] = read('packages/ui/dist/index.js').split('\n', 1);
if (!uiFirstLine.includes('use client')) {
  console.error(
    `check:directive — packages/ui/dist/index.js line 1 must contain 'use client'; got: ${JSON.stringify(uiFirstLine)}`,
  );
  process.exit(1);
}

// icons: inverse assert, anywhere in either bundle.
for (const bundle of ['packages/icons/dist/index.js', 'packages/icons/dist/index.cjs']) {
  if (/['"]use client['"]/.test(read(bundle))) {
    console.error(
      `check:directive — ${bundle} contains 'use client'; @vegam-ui/icons must stay server-component safe`,
    );
    process.exit(1);
  }
}

console.log(
  "check:directive ok — ui/dist/index.js line 1 carries 'use client'; icons carries none",
);
