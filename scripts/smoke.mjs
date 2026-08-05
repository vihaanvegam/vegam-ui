/**
 * Smoke gate: prove the PACKED TARBALL works for real consumers.
 *
 * Each app under apps/ is copied out of the workspace into a temp directory,
 * its `workspace:*` dependency is rewritten to the packed @vegam-ui/ui tarball,
 * and it is installed with plain npm — no pnpm linking, no monorepo resolution,
 * exactly what `npm install @vegam-ui/ui` gives a real project. Then each app
 * must build and typecheck.
 */
import { execSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const uiDir = join(root, 'packages', 'ui');
const apps = ['smoke-vite', 'smoke-next-app', 'smoke-next-pages', 'smoke-remix'];

const run = (command, cwd) => {
  console.log(`\n$ ${command}  (${basename(cwd)})`);
  execSync(command, {
    cwd,
    stdio: 'inherit',
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1', CI: '1' },
  });
};

if (!existsSync(join(uiDir, 'dist', 'index.js'))) {
  console.error('smoke — packages/ui/dist missing; run pnpm build first');
  process.exit(1);
}

// realpath the temp root: on Windows tmpdir() can be an 8.3 short path
// (C:\Users\VIHAAN~1\...), and Remix's vite plugin keys its manifest by
// long-form paths — the mismatch breaks its SSR build with
// "No manifest entry found for app/root.tsx".
const work = mkdtempSync(join(realpathSync.native(tmpdir()), 'vegam-ui-smoke-'));
console.log(`smoke — working directory: ${work}`);

run(`pnpm pack --out ${JSON.stringify(join(work, 'ui.tgz'))}`, uiDir);
const tarball = join(work, 'ui.tgz');

const skip = new Set(['node_modules', 'dist', 'build', '.next']);
let failed = false;

for (const app of apps) {
  const src = join(root, 'apps', app);
  const dest = join(work, app);
  cpSync(src, dest, {
    recursive: true,
    filter: (from) => !skip.has(basename(from)),
  });

  const pkgPath = join(dest, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  pkg.dependencies['@vegam-ui/ui'] = `file:${tarball}`;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

  try {
    run('npm install --no-audit --no-fund --loglevel=error', dest);
    run('npm run build', dest);
    run('npm run typecheck', dest);
    console.log(`\nsmoke — ${app}: PASS`);
  } catch {
    console.error(`\nsmoke — ${app}: FAIL`);
    failed = true;
  }
}

if (!failed) {
  rmSync(work, { recursive: true, force: true });
  console.log('\nsmoke — all four apps consumed the tarball: build + typecheck green');
} else {
  console.error(`\nsmoke — failures above; temp dir kept for inspection: ${work}`);
  process.exit(1);
}
