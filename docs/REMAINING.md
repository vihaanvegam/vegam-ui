# What's remaining

State as of 2026-08-05. All six phases of the brief are delivered; both
packages sit at 0.1.0, release-ready, with all four gates green. Nothing below
is a known defect — it is the work that was deliberately not done, plus the
decisions only the repo owner can make.

Ordered by how much it would hurt to leave undone.

---

## 1. Blocking — needs a human decision or credential

### ~~1.1 Commit the repository~~ ✅ Done 2026-08-05

First commit created (37b72cf): 162 files, 26,324 lines. Pre-commit hook
(lint-staged) ran successfully.

### ~~1.2 Decide the git remote and push~~ ✅ Done 2026-08-05

Remote: https://github.com/vihaanvegam/vegam-ui

### ~~1.3 Add repository links~~ ✅ Done 2026-08-05

- `repository`, `homepage`, `bugs` added to both package.json files
- `@changesets/changelog-github` installed and configured
- `.github/workflows/release.yml` created
- RELEASING.md section 2 removed

### ~~1.4 Publish to npm~~ ✅ Done 2026-08-05

Both packages published at 0.1.0:

- https://www.npmjs.com/package/@vegam-ui/ui
- https://www.npmjs.com/package/@vegam-ui/tokens

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

### 3.1 CI verification

CI workflows upgraded to Node 22 (pnpm 11.17.0 requires it). First run failed
due to Node version mismatch; should pass after this commit.

### ~~3.2 Accessibility is reasoned, not machine-verified~~ ✅ Done 2026-08-05

`vitest-axe` now runs axe-core against all 12 components in CI (19 tests in
`src/test/a11y.test.tsx`). Keyboard paths are covered by unit tests. A real
screen reader pass (NVDA/VoiceOver) remains manual.

### 3.3 No visual regression testing

Nothing catches an unintended CSS change. The token gallery and dark-scheme
stories make regressions _visible_, but only to a human who looks.

### ~~3.4 Storybook is not deployed~~ ✅ Done 2026-08-05

Repo is now public. `.github/workflows/storybook.yml` deploys to GitHub Pages.
Enable Pages: Settings → Pages → Source: **GitHub Actions**.

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
- ~~**Dependabot / Renovate**~~ — ✅ Done 2026-08-05. `.github/dependabot.yml`
  with ignore rules for pinned versions (ESLint 9, TypeScript 5, Style Dictionary 4).
- ~~**Coverage thresholds**~~ — ✅ Done 2026-08-05. vitest.config.ts now enforces
  80% statements/functions/lines, 75% branches. Current coverage: 94%+.
  Run `pnpm --filter @vegam-ui/ui exec vitest run --coverage`.
- ~~**Bundle-size budget**~~ — ✅ Done 2026-08-05. `pnpm check:size` fails if
  any artifact exceeds its budget (JS 40KB, CJS 30KB, CSS 70KB). Current usage
  ~56-60% of budgets.
- ~~**Issue/PR templates**~~ — ✅ Done 2026-08-05. Bug report, feature request,
  and PR template added.
- **Branch protection** — configure in GitHub repo settings (require PR reviews,
  status checks, etc.).

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
