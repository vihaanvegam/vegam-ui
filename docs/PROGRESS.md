# Progress — volatile, rewritten each session

## Current phase

Post-phase component work. Phase 6 (release) delivered 2026-07-30;
**all six phases of the brief are complete.** Nothing is published.

2026-08-04: **Banner** added from Figma (file "vk uig", page
"Component · Banner🟢", node 12:12249) via the figma-console MCP — the first
component built from a live design handoff. Full recipe followed (types, CSS,
tests, stories, barrel, theme defaults, graph). Verified visually in
Storybook against a Figma screenshot, light + dark. Covered by the
`.changeset/brave-banners-arrive.md` minor changeset.

2026-08-04 (later): **Breadcrumbs, Modal, Blanket** added from Figma pages
"Component · Breadcrumbs🟢" and "Component · Modal" (Popover/Tooltip
deliberately skipped per user). Blanket is Modal's dependent component from
the Figma composition, shipped standalone. New framework-free utils:
focusTrap.ts, scrollLock.ts (both tested). Figma variables were resolved to
token NAMES via the plugin API — those pages render in dark mode, so
hex-matching would mislead. Library is now 12 components, 217 tests.
Storybook stories model the Figma variant axes/booleans as controls (all
three batches). Covered by `.changeset/calm-overlays-appear.md`.
Note: Storybook's save-from-controls writes junk args into story files
(`{}` for ReactNode props) — ReactNode/object controls are disabled in all
story files for exactly this reason; keep doing that for new components.

2026-08-05: **Repo hygiene** from REMAINING.md section 5:

- CONTRIBUTING.md created — contributor entry point linking to COMPONENT_RECIPE,
  RUNNING, and pinned-versions warnings.
- Coverage thresholds added to vitest.config.ts (80% statements/functions/lines,
  75% branches). Current: 94%+. `@vitest/coverage-v8` installed.
- Bundle-size budget via `pnpm check:size` — fails if JS >40KB, CJS >30KB, or
  CSS >70KB. Current usage ~56-60% of budgets.

## State of the world

- Git repo on `main`, pushed to **github.com/vihaanvegam/vegam-ui**.
  Repository links configured, release workflow added.
- **Published to npm**: @vegam-ui/ui@0.1.0, @vegam-ui/tokens@0.1.0
- Both packages at **0.1.0** with CHANGELOG.md, README.md, and LICENSE.
- Changesets configured: plain changelog generator, `access: public`,
  `privatePackages: false` (smoke apps excluded). No repository links by
  user's decision — docs/RELEASING.md section 2 is the complete how-to.
- Publish dry-run clean. Tarball contents verified by hand:
  ui = dist/{index.js,.cjs,.css,.d.ts,.d.cts,+2 maps} + package.json + README + LICENSE;
  tokens = dist/{tokens.js,.cjs,.css,.scss,.d.ts,.d.cts} + package.json + README + LICENSE.
- Library surface: 12 components (Button, Input, Text, Card, Badge, Banner,
  Blanket, Breadcrumbs, Modal, Stack, Checkbox, Select) +
  ThemeProvider/useComponentDefaults/cx + utils (focusTrap, scrollLock,
  listNavigation, positioning). 217 tests.
- Gates green (attw ×4 modes, publint, directive, smoke ×4) — last full run
  was 2026-08-04, including Breadcrumbs/Modal/Blanket.

## Done (this phase)

- @changesets/cli installed + configured; initial-release changeset consumed
  by `changeset version` → 0.1.0 in both packages, changelogs written.
- packages/ui/README.md — install, one-CSS-import usage, per-framework import
  location table, framework support matrix, RSC note, theming (data-theme,
  ThemeProvider, token overrides, componentDefaults, class constants), slots,
  a11y summary, dual-package hazard + portal caveats.
- packages/tokens/README.md — three output formats, two-layer model, scales,
  theme blocks, customization.
- Root README.md (repo orientation), LICENSE ×3 (root + both packages).
- docs/RELEASING.md — release flow, bump policy, npm scope prerequisites, and
  section 2: exactly how/where to add repository links + GitHub changelog
  generator + release.yml, with token requirements and a checklist.
- Root scripts: `changeset`, `release:dry-run`, `release`.
- CLAUDE.md: Release section + pointers to RECIPE/RELEASING.
- DECISIONS.md: 2 new entries (release config choices; publint/repository finding).

## In flight

- `pnpm gates` background run against 0.1.0 — see chat for the result.

## Blocked

- ~~Actual `pnpm -r publish`~~ — ✅ Done 2026-08-05. Both packages at 0.1.0.
- ~~First git commit~~ — ✅ Done 2026-08-05 (37b72cf).

## Next actions (whenever the user wants them)

**docs/REMAINING.md is the full accounting** — blockers, verification gaps,
deliberate omissions, and landmines. Short version:

1. **Commit.** Nothing is in git yet (zero commits, no remote).
2. Decide the git remote, then apply docs/RELEASING.md section 2 (repository
   fields, @changesets/changelog-github, release.yml) and delete that section.
3. Publish when the npm scope is ready — never without an explicit request.

Do not start the optional follow-ups in REMAINING.md sections 3–5 unbidden.

## Post-phase additions

- docs/REMAINING.md — full accounting of what is left.
- scripts/graphify.mjs + graphify-html.mjs — relationship graphs derived from
  source (workspace deps, module imports, token layering, export surface).
  Two outputs: docs/ARCHITECTURE.md (Mermaid, renders in diffs/GitHub) and
  docs/graphify.html (interactive map: 3 views, drag/zoom, filter, detail
  panel, light/dark; self-contained, zero deps). `pnpm graph` regenerates both,
  `pnpm graph:check` runs in CI and fails on drift, `pnpm graph:serve` opens
  the map on :4173 (scripts/serve-docs.mjs; also a .claude/launch.json entry).
  **Both outputs are generated — never hand-edit.** graphify.html is in
  .prettierignore so formatting cannot fight the drift check.

## Known landmines

- vite-plugin-dts option is `bundleTypes` (v5 renamed it; `rollupTypes` is
  silently ignored → unbundled d.ts). Check dist/index.d.ts after any bump.
- attw needs `--exclude-entrypoints ./styles.css`; add any new non-JS subpath.
- Smoke temp dirs must use `realpathSync.native(tmpdir())` on Windows.
- @changesets/changelog-github hard-fails `changeset version` without
  GITHUB_TOKEN — that is why it is not enabled yet.
- Select: space commits (not type-ahead); option labels must be strings.
- Checkbox coarse-pointer target is 24px (WCAG 2.5.8 AA), a documented
  deviation from the blanket 44px rule.
