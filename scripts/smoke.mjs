/**
 * Smoke gate: prove the PACKED TARBALLS work for real consumers.
 *
 * Each app under apps/ is copied out of the workspace into a temp directory,
 * its `workspace:*` dependencies are rewritten to the packed @vegam-ui/ui and
 * @vegam-ui/icons tarballs, and it is installed with plain npm — no pnpm
 * linking, no monorepo resolution, exactly what `npm install` gives a real
 * project. Then each app must build and typecheck.
 *
 * smoke-next-app renders an icon from its ROOT LAYOUT — a server component
 * with no 'use client' above it. That is the one place the "icons work inside
 * the RSC boundary" claim can actually be proven, and Next fails the build if
 * it is false.
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
const packages = {
  '@vegam-ui/ui': { dir: join(root, 'packages', 'ui'), tgz: 'ui.tgz' },
  '@vegam-ui/icons': { dir: join(root, 'packages', 'icons'), tgz: 'icons.tgz' },
};
const apps = ['smoke-vite', 'smoke-next-app', 'smoke-next-pages', 'smoke-remix'];

const run = (command, cwd) => {
  console.log(`\n$ ${command}  (${basename(cwd)})`);
  execSync(command, {
    cwd,
    stdio: 'inherit',
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1', CI: '1' },
  });
};

for (const [name, { dir }] of Object.entries(packages)) {
  if (!existsSync(join(dir, 'dist', 'index.js'))) {
    console.error(`smoke — dist missing for ${name}; run pnpm build first`);
    process.exit(1);
  }
}

// realpath the temp root: on Windows tmpdir() can be an 8.3 short path
// (C:\Users\VIHAAN~1\...), and Remix's vite plugin keys its manifest by
// long-form paths — the mismatch breaks its SSR build with
// "No manifest entry found for app/root.tsx".
const work = mkdtempSync(join(realpathSync.native(tmpdir()), 'vegam-ui-smoke-'));
console.log(`smoke — working directory: ${work}`);

const tarballs = new Map();
for (const [name, { dir, tgz }] of Object.entries(packages)) {
  const out = join(work, tgz);
  run(`pnpm pack --out ${JSON.stringify(out)}`, dir);
  tarballs.set(name, out);
}

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
  for (const [name, tgz] of tarballs) {
    if (pkg.dependencies[name] === undefined) {
      console.error(`smoke — ${app} does not depend on ${name}; it must exercise every package`);
      process.exit(1);
    }
    pkg.dependencies[name] = `file:${tgz}`;
  }
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
  console.log('\nsmoke — all four apps consumed both tarballs: build + typecheck green');
} else {
  console.error(`\nsmoke — failures above; temp dir kept for inspection: ${work}`);
  process.exit(1);
}
