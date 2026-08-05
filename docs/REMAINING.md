# What's remaining

State as of 2026-08-05. All six phases of the brief are delivered; both
packages sit at 0.1.0, release-ready, with all four gates green. Nothing below
is a known defect — it is the work that was deliberately not done, plus the
decisions only the repo owner can make.

Ordered by how much it would hurt to leave undone.

---

## 1. Blocking — needs a human decision or credential

### 1.1 Commit the repository ⚠️ highest risk

**There are zero git commits.** `git rev-list HEAD` fails because no commit
exists; 20 top-level entries are untracked. A complete library — 8 components,
149 tests, four smoke apps, CI config, and all documentation — exists only in
the working tree of one machine. An accidental `git clean`, a disk failure, or
a bad `rm` loses everything.

```bash
git add -A && git commit -m "feat: initial release of @vegam-ui/ui and @vegam-ui/tokens"
```

The `.gitignore` is already correct (`node_modules`, `dist`, `.next`,
`storybook-static`, `*.tgz`). Note that `packages/*/dist` is ignored — that is
intentional; artifacts are built, not committed.

Husky is installed and a pre-commit hook runs lint-staged. It has **never
actually executed**, since no commit has ever been made. Expect the first
commit to be slow while it lints, and expect it to be the first real test of
that hook.

### 1.2 Decide the git remote and push

No remote is configured. Once one exists:

```bash
git remote add origin <url>
git push -u origin main
```

This also unblocks 1.3 and is the only way CI has ever run (see 3.1).

### 1.3 Add repository links

Deliberately omitted per your decision — the full, step-by-step reversal is
**[RELEASING.md section 2](RELEASING.md#2-adding-repository-links-not-configured-yet)**.
Summary of what it covers:

- `repository` (with the `directory` field for monorepo subfolder links),
  `homepage`, and `bugs` in **both** package.json files
- swapping the plain changelog generator for `@changesets/changelog-github`
- the `GITHUB_TOKEN` requirement that makes this fail loudly if skipped
- a ready-to-paste `release.yml`

Delete that section once applied and note it in DECISIONS.md.

### 1.4 Publish to npm

Not done, and never to be done without an explicit request. Prerequisites:

- The **`@vegam-ui` scope must exist** on npmjs.com and your account must be
  able to publish to it. Otherwise rename both packages to a scope you own.
- `npm login` (verify with `npm whoami`)
- `.changeset/config.json` already sets `"access": "public"` — scoped packages
  are private by default and npm rejects the publish without it.

```bash
pnpm gates && pnpm -r publish
```

The dry run (`pnpm release:dry-run`) is clean and tarball contents were
verified by hand.

---

## 2. Documented deviations from the brief

All four are logged in DECISIONS.md with reasoning and rejected alternatives.
None needs action; each is listed so a future reader does not "fix" a
deliberate choice.

| Deviation                                   | Why                                                                                                                          | Revisit when                                                   |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Storybook **10**, not 8                     | SB 8 predates Vite 8 and cannot build against it                                                                             | Never — 8 is not viable here                                   |
| Checkbox coarse target **24px**, not 44px   | A 44px checkbox glyph is visually broken; 24px is the WCAG 2.5.8 AA minimum, and the paired label supplies the larger target | A design demands a custom-drawn control                        |
| "Semantic tokens only" scoped to **colors** | Read literally it would forbid `--ui-space-*`, which the brief itself cites as a primitive; theming is the rule's intent     | Never                                                          |
| Whole bundle is client-marked               | Single-chunk output + the line-1 `'use client'` gate the brief mandates                                                      | If `preserveModules` is adopted for per-module RSC granularity |

---

## 3. Verification gaps

Things that are green locally but not proven in the environments that matter.

### 3.1 CI has never actually run

`.github/workflows/ci.yml` is written and complete (lint/format job + gates
job), but with no remote it has **never executed on a GitHub runner**. Every
gate result so far comes from Windows, locally. Specific risks on first run:

- **Linux vs Windows path handling** — the smoke harness needed
  `realpathSync.native()` for Windows 8.3 short paths; the reverse class of bug
  is possible on Linux, though less likely.
- **Wall-clock cost** — the gates job does four full `npm install`s. Expect
  roughly 10–15 minutes. If that is too slow, cache `~/.npm` or run the four
  smoke apps as a matrix.
- **`pnpm/action-setup@v4`** infers the pnpm version from `packageManager`
  (11.17.0) — verify that resolves on the runner.

Treat the first CI run as a task, not a formality.

### 3.2 Accessibility is reasoned, not machine-verified

`@storybook/addon-a11y` is installed, so violations surface **interactively in
Storybook** — but nothing asserts them in CI. Contrast pairs were chosen and
documented by reasoning about the token values; no tool has verified the
ratios. Keyboard paths are covered by unit tests (Select's full APG pattern is
tested), but no screen reader has actually been driven over this library.

Closing this would mean `@storybook/test-runner` with axe, or `vitest-axe`
assertions per component, plus a real NVDA/VoiceOver pass.

### 3.3 No visual regression testing

Nothing catches an unintended CSS change. The token gallery and dark-scheme
stories make regressions _visible_, but only to a human who looks.

### 3.4 Storybook is not deployed

`build-storybook` produces `storybook-static/` and is verified to succeed, but
it is not published anywhere. A GitHub Pages job (or Chromatic, which would
also cover 3.3) would make it the living documentation it is meant to be.

---

## 4. Deliberately not built

Not in the brief; the brief explicitly says not to scaffold components that
were not asked for. Listed so the boundary is visible, not as a backlog.

**Components not built:** Dialog/Modal, Tooltip, Popover, Radio, Switch, Tabs,
Accordion, Table, Toast, Menu, Avatar, Spinner, Pagination, Breadcrumb.

The two hardest infrastructure problems a Dialog would need — portals with SSR
guards and framework-free behaviour utilities — are already solved and proven
by Select. A focus trap would be the new piece, and it belongs in
`src/utils/` with no React types, per CLAUDE.md.

**Select capabilities not built:** multi-select, option groups
(`role="group"`), async/remote options, filtering or free text (that is the
editable-combobox APG pattern, a different widget), and virtualization for
long lists. Current limits worth knowing:

- Option labels must be **strings** — they drive type-ahead. Rich option
  content goes through `slots.option`.
- **Space commits** the active option, so it cannot also extend a type-ahead
  query. Labels differing only after a space are unreachable by typing.
- No virtualization: every option renders. Fine for tens, not thousands.

**Packaging not built:** per-component deep entrypoints
(`@vegam-ui/ui/Button`). Tree-shaking already works via the side-effect-free
barrel, so this is mostly ergonomic; it would add exports-map surface and new
attw entrypoints to keep green.

---

## 5. Repo hygiene not set up

Small, cheap, none blocking:

- ~~**CONTRIBUTING.md**~~ — ✅ Done 2026-08-05. Points contributors to
  COMPONENT_RECIPE.md, RUNNING.md, and the pinned-versions warning.
- **Dependabot / Renovate** — no automated dependency updates. Note the
  pinned versions that must **not** be bumped casually (ESLint 9, TypeScript 5,
  Style Dictionary 4, Remix apps on Vite 6/React 18) — reasons in DECISIONS.md.
  Any bot config should ignore or flag those.
- ~~**Coverage thresholds**~~ — ✅ Done 2026-08-05. vitest.config.ts now enforces
  80% statements/functions/lines, 75% branches. Current coverage: 94%+.
  Run `pnpm --filter @vegam-ui/ui exec vitest run --coverage`.
- ~~**Bundle-size budget**~~ — ✅ Done 2026-08-05. `pnpm check:size` fails if
  any artifact exceeds its budget (JS 40KB, CJS 30KB, CSS 70KB). Current usage
  ~56-60% of budgets.
- **Issue/PR templates**, branch protection — all await the remote.

---

## 6. Landmines for whoever works on this next

Real traps that cost time once already. Full context in DECISIONS.md.

- **`vite-plugin-dts` v5 renamed `rollupTypes` → `bundleTypes`** and silently
  ignores the old name, emitting unbundled declarations that leak internal
  paths. After any bump, check that `dist/index.d.ts` is one rolled-up file.
- **attw needs `--exclude-entrypoints ./styles.css`** — a CSS subpath can never
  resolve to type declarations. Add any new non-JS subpath to that list.
- **Smoke temp dirs must use `realpathSync.native(tmpdir())`** — Windows 8.3
  short paths break Remix's manifest resolution.
- **Vitest globals are off**, so Testing Library's auto-cleanup never
  registers. `afterEach(cleanup)` is explicit in `src/test/setup.ts`. Do not
  "simplify" it away.
- **`@changesets/changelog-github` hard-fails `changeset version`** without
  `GITHUB_TOKEN`.
- **pnpm `allowBuilds`** in `pnpm-workspace.yaml` denies dependency install
  scripts (esbuild, sharp, style-dictionary). New native deps may need entries
  or installs fail with `ERR_PNPM_IGNORED_BUILDS`.
- **Storybook must keep its own empty `.storybook/vite.config.ts`** — it must
  never load the library's lib-mode build config.
- **The dark-block assertion** in `packages/tokens/build.js` throws if a dark
  override has no matching semantic token. Extend `SEMANTIC_GROUPS` there when
  adding a new semantic top-level group.
