# @vegam-ui/icons — build plan (BLUEPRINT Phase 5)

Authored 2026-08-06; the owner's three calls (codegen, sequencing, docs
coupling) are logged in DECISIONS.md the same date. **No code until Phases 0–4
close** — this file is the "how" for BLUEPRINT Phase 5's "what", written while
the context was fresh. CLAUDE.md's locked decisions and gates apply throughout.

Fixed by prior decisions (BLUEPRINT Phase 5 + DECISIONS 2026-08-06):

- Third workspace package, same packaging standard as ui (dual declarations,
  types-first exports, attw/publint/smoke-gated).
- One module per icon, named exports in the `IconCheck` prefix style,
  `sideEffects: false`.
- Color via `currentColor`; size from the `size.icon-*` scale; `aria-hidden`
  by default with an opt-in accessible name.
- **No `'use client'` anywhere** — icons stay server-component-safe.
- **ui never depends on icons at runtime.** A dev-only stories edge is allowed
  (owner, 2026-08-06); component source never imports an icon — Select's
  caret and the close ✕ stay border-drawn.
- Codegen: hand-rolled zero-dependency script (§8.2 resolved 2026-08-06).

## 1. Consumer contract

- `npm install @vegam-ui/icons` → `import { IconCheck } from '@vegam-ui/icons'`
  → `<IconCheck />`. **No CSS import** — the package ships no stylesheet.
- Works with only React installed: token `var()`s enhance, never gate — every
  named size bakes a rem fallback, colors ride on `currentColor`.
- **Server components: usable directly** — the only @vegam-ui package that is.
  No directive, no hooks, no context, no browser globals.
- Peers: `react >=18` (+ optional `@types/react`) — same range as ui. Zero
  runtime dependencies.
- Tree-shaking: ESM named exports from a side-effect-free barrel +
  `"sideEffects": false` — importing one icon bundles one icon.

## 2. API — one shape, every icon identical

```tsx
export interface IconProps extends SVGProps<SVGSVGElement> {
  /** Named steps map to the size.icon-* ramp; number = px. @default '1em' */
  size?: 'xxs' | 'sm' | 'md' | 'lg' | 'xxl' | 'xl' | number;
  /** Accessible name. Present → role="img" + <title>; absent → aria-hidden. */
  title?: string;
}
```

- `forwardRef<SVGSVGElement, IconProps>` + `displayName` per icon (React 18
  support; ref-as-prop is a later cleanup alongside ui's).
- Shared internal `createIcon(name, viewBox, children)` factory — hand-written
  once, unit-tested once; generated per-icon files are ~5 lines each and the
  API lives in ONE place.
- Root class `ui-icon` always present, consumer `className` appended via a
  local two-line join — `cx` lives in ui and cross-package runtime imports are
  banned.
- **Size resolution** (uniformly via inline `style` width/height, spread under
  consumer `style` so theirs wins): absent → `1em` (follows surrounding font —
  least-opinionated default); number → `${n}px`; named step →
  `var(--ui-size-icon-<step>, <rem fallback>)`, fallback baked at codegen time
  by reading the token export (repo file read, not a package dependency —
  graphify precedent). Standalone installs size correctly; themed apps stay
  token-driven.
- ⚠ The ramp's true order is **xxs(12) < sm(16) < md(20) < lg(24) < xxl(28) <
  xl(32)** — `xxl` is the 28px rung the Aug-2026 export added between 24 and
  32, and there is no `icon-xs`. The union preserves token names; the docs must
  show the ramp explicitly so nobody assumes alphabetical order.
- **Accessibility switch**: `title` present → `role="img"` + `<title>` as
  first SVG child (names the SVG without ids — deliberately no `useId`: it is
  a hook and would drag the package out of server-component territory);
  `title` absent → `aria-hidden="true"`. No `focusable` attribute — that is an
  IE-ism; no supported browser focuses an inline SVG without tabindex.
- No `color` prop. Glyphs are `currentColor`; consumers set CSS `color`. The
  theme ships `--ui-color-icon-default` / `--ui-color-icon-subtle` /
  `--ui-color-icon-disabled` for exactly this (docs recipe, §6). ⚠ Corrected
  at build time: this file originally wrote them as `--ui-icon-*`, but the
  tokens live under `theme.*.color.icon.*` and so emit with the `color`
  segment.
- Everything else spreads (`data-*`, `aria-*`, handlers) — but interactive
  icons are documented as "wrap in IconButton" (Phase 2); never tabindex on
  the SVG itself.

## 3. Source of truth & codegen (§8.2 resolved: hand-rolled)

- `packages/icons/svg/<kebab-name>.svg` — committed design inputs, exported
  from the Figma icon set. The tokens already carry the set's geometry facts:
  drawn at 1.25px stroke (`border-width.icon`, "the value the icon set was
  drawn at"). Like tokens.json: design-owned, arrives by export, never edited
  here — normalization happens in codegen output, sources stay verbatim.
- Figma Desktop Bridge was offline at planning time, so the inventory pull is
  the **first build-time step** (§7.1), not enumerated here.
- `packages/icons/scripts/build-icons.mjs` — zero dependencies (graphify
  precedent):
  1. **Validate**: single `<svg>` root with a viewBox; reject `<script>`,
     `<style>`, `<foreignObject>`, bitmap `<image>` content.
  2. **Normalize**: drop `width`/`height`/`xmlns`/`id`; kebab→camel
     presentation attributes (`fill-rule` → `fillRule`, …); literal paints →
     `currentColor` (fill and stroke); keep the exported `stroke-width`
     (1.25 — matches `border-width.icon`; a redrawn set regenerates).
  3. **Emit**: `src/icons/Icon<PascalName>.tsx` (calling `createIcon`),
     regenerated `src/index.ts` barrel, and `manifest.json` (names + viewBoxes
     for the gallery story).
  4. **Deterministic**: sorted inputs, LF endings, no timestamps. Output is
     COMMITTED; `pnpm icons:check` diffs regenerated output in CI's lint job
     and fails on drift or on svg/ ↔ src/icons/ mismatch (graph:check
     precedent).
- Naming: `chevron-down.svg` → `IconChevronDown`.

## 4. Package & build config

- `package.json` mirrors ui minus CSS: `"sideEffects": false` (no CSS array),
  exports map with `types` first in each branch (.d.ts import / .d.cts
  require) plus `./package.json`; root `main`/`module`/`types` legacy
  fallbacks; `files: ["dist"]`; `repository`/`homepage`/`bugs` with
  `directory` (2026-08-05 precedent); engines node >=20.
- Vite library mode, ESM + CJS, externals `react`, `react-dom`,
  `react/jsx-runtime`; vite-plugin-dts with **`bundleTypes: true`** (the v5
  rename landmine — verify dist/index.d.ts is one rolled-up file); postbuild
  .d.cts twin (ui's postbuild.mjs pattern). **No rollup-preserve-directives**,
  and the gate asserts the absence (§5).
- Single-chunk bundle is fine at tens of icons (ESM tree-shaking is
  per-export; CJS consumers eat one small file). `preserveModules` is the
  Tier-Later escape hatch if the set reaches hundreds — same stance ui
  records.
- No new tools: icons reuses the workspace's existing dev toolchain (vite,
  vite-plugin-dts + api-extractor, vitest, testing-library, jsdom, react
  types) at the already-pinned versions.

## 5. Gates — repo-level changes when the package lands

| Gate            | Change                                                                                                                                                                                                      |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| build           | none — `--filter ./packages/*` is topological and icons has no workspace deps                                                                                                                               |
| check:package   | extend the root script to run attw + publint for icons too; **no** `--exclude-entrypoints` (no CSS subpath)                                                                                                 |
| check:directive | scripts/check-directive.mjs gains the INVERSE assert: icons dist must NOT contain `'use client'` (ui keeps its line-1 positive assert)                                                                      |
| smoke           | scripts/smoke.mjs packs BOTH tarballs and rewrites both `workspace:*` specs; each of the 4 apps adds `@vegam-ui/icons` and renders one icon — in smoke-next-app OUTSIDE the client boundary (the RSC proof) |
| check:size      | add icons budgets once the count is known (ballpark ≤1 KB/icon ESM)                                                                                                                                         |
| graph           | zero script changes — graphify already discovers `packages/*` from manifests; run `pnpm graph`, commit output (workspace view gains the node + the ui dev edge)                                             |
| icons:check     | NEW — codegen drift gate in CI's lint job (§3.4)                                                                                                                                                            |
| tests           | vitest in the icons package: createIcon matrix (a11y switch, every size form, ref, className/style merge, spread) + a whole-set test (every export renders, has a viewBox, no literal paints)               |
| a11y            | axe pass on decorative and titled variants                                                                                                                                                                  |

CI needs no workflow edits — jobs run the root scripts. Chromatic gets the
gallery story: the entire set visually regression-tested in one snapshot.

## 6. Storybook & docs (devDep call, 2026-08-06)

- `@vegam-ui/icons` becomes a **devDependency of packages/ui** — stories/MDX
  only (tokens-as-devDependency precedent); story files never enter dist, so
  ui's zero-runtime-deps invariant stands untouched.
- Stories: **Icons/Gallery** — grid of the full set from manifest.json, name
  filter, click-to-copy import line; **Icons/Playground** — one icon with
  size/title controls (string/number controls only, so the disabled
  ReactNode-controls rule is not in play).
- MDX page per the §6 template: install (it is a separate package), sizing
  (default `1em`, the named ramp **with its real order**, numbers as px),
  color (`currentColor` + the `--ui-color-icon-*` theme tokens), a11y recipes
  (decorative default / `title` / inside IconButton with an accessible name),
  the RSC note, Figma source link.
- The interim "Icons recipe (lucide/heroicons)" workshop page is rewritten
  around @vegam-ui/icons, keeping a short third-party integration appendix.

## 7. Build order inside Phase 5 (when its turn comes)

1. **Inventory** — connect the Figma Desktop Bridge, enumerate the icon set,
   and put the initial cut to the owner (standing ask-first preference).
   Expected shape: chevrons ×4, close, check, plus/minus, search, dots,
   info/success/warning/danger glyphs, external-link, arrows — final list is
   the design's set ∩ component/docs needs. Export to `svg/`.
2. **Scaffold + pilot** — package, build config, `createIcon` + types,
   codegen script, ~5 pilot icons, every §5 gate change, `pnpm graph`,
   `pnpm gates` green.
3. **Full set** — codegen over the whole inventory; gallery + MDX; Chromatic
   baseline accepted.
4. **Release** — README + LICENSE, changeset (first release 0.1.0);
   release.yml already publishes workspace-wide.

## 8. Deliberately open until build time

- The exact initial icon list (needs the Figma inventory + the owner's cut).
- Whether `size`'s default moves from `1em` to `'md'` — start
  least-opinionated, revisit with real usage.
- `preserveModules` for per-icon files at scale (Tier-Later, mirrors ui).

Cross-references: [BLUEPRINT.md](BLUEPRINT.md) Phase 5 + §8.2 ·
DECISIONS.md 2026-08-06 (icons plan entry) ·
[TOKENS_PLAN.md](../packages/tokens/TOKENS_PLAN.md) §1 (size.icon ramp,
border-width.icon) · [COMPONENT_RECIPE.md](COMPONENT_RECIPE.md) (test/story
standards this plan adapts).
