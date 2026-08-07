# Progress — volatile, rewritten each session

## Current phase

**All six BLUEPRINT phases are built (0–6, complete 2026-08-07).** Three
packages: ui (38 components, docs complete), tokens, and the new icons.

Two things are outstanding, both needing the owner rather than more code:
**68 of the 85 icons still need exporting from Figma** (mechanical — see Next
actions), and **the manual screen-reader pass has not been run**, which is the
last gate before 1.0. The version bump to 1.0 is deliberately not done.

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

2026-08-06: **Full-library blueprint adopted** (planning session, no code).

- docs/BLUEPRINT.md — the roadmap: one core package (no MUI-style split),
  committed catalog of 12 shipped + 26 planned = 38 components, phases 0–6
  (foundations → layout → forms → overlays/feedback → nav/data → icons → 1.0),
  specs for the non-obvious components (Box without a style engine, Field,
  Toast, Table, Menu), binding conventions, open decisions (§8), 1.0 criteria.
- packages/tokens/TOKENS_PLAN.md — token inventory, the 40 null placeholders
  prioritized with their current fallbacks, new-token requests per phase
  (z scale, elevation ramp, enter/exit easings), the two known export data
  errors. tokens.json untouched — read-only rule reaffirmed.
- CLAUDE.md: ritual + Where-things-are now point at both files; stale Release
  paragraph (pre-2026-08-05 repository-links state) corrected.
- Owner's four scope decisions logged in DECISIONS.md (same date).

2026-08-06 (later): **Aug-2026 token export migrated.** The owner replaced
tokens.json wholesale (new theme/platform/viewport/component tiers, redrawn
grey/blue/yellow ramps, all nulls filled except space.11, errors in §4 of
TOKENS_PLAN left in place by choice). Code migrated the same day:

- build.js rewritten for the four tiers; emits :root, both [data-theme]
  blocks, and both [data-platform] blocks, with transitive axis analysis
  re-declaring aliases per block. **Landmine found live: var() inside a custom
  property substitutes at the DECLARING element, so :root-only aliases freeze
  inside scoped theme wrappers** — full story in DECISIONS 2026-08-06.
- All 14 component stylesheets migrated: platform text tokens
  (--ui-text-primary/…), real focus/easing/elevation/blur tokens (fallbacks
  dropped), line-height policy per the owner (platform body token on fixed
  body text, literals on multi-size/heading text), layered z (scrim 400,
  modal 500, Select popup on z.popover 600 — dropdown-below-modal flagged).
- Nine stories still carried pre-Jul-2026 var names (silent no-ops) — fixed;
  token gallery rebuilt for the new tiers. tokens.json added to
  .prettierignore (verbatim export; graphify.html precedent).
- Verified in Storybook: computed values probed (dark island grey.100,
  mobile+dark composes white, elevation dark alphas) + dark Banner screenshot.
  Build, typecheck, 236 tests, lint, format, graph, size (CSS 72% of budget),
  directive all green. Changeset `.changeset/smart-tiers-arrive.md` (minor
  both packages, breaking noted).
- TOKENS_PLAN.md rewritten around the new export; residuals: space.11 null,
  cards inversion, divider.strong red, z.dropdown design question.

2026-08-06 (evening): **@vegam-ui/icons planned** (docs only, no code).
docs/ICONS_PLAN.md authored. Owner's three calls (DECISIONS same date):
codegen is a hand-rolled zero-dep script (§8.2 RESOLVED), the build keeps its
Phase-5 slot behind Phases 0–4, and packages/ui may take icons as a
devDependency for stories/MDX only. BLUEPRINT (Phase 5 pointer + §8.2 row) and
CLAUDE.md Where-things-are updated. Figma bridge was offline — icon inventory
is the first build-time step. No changeset (nothing consumer-visible), no
graph run (no structural change).

2026-08-07: **Phase 0 (foundations) complete** — BLUEPRINT's "fix other
things first", all five items:

- **hooks/ layer** (0.1): useControlled (extracted from Select/Breadcrumbs,
  both refactored onto it), useMediaQuery + useBreakpoint
  (useSyncExternalStore, SSR snapshots false/'base'), useDismiss (over new
  framework-free utils/dismiss.ts; Select's outside-pointer dismissal
  extracted, escape stays in its keydown), useTransitionState (data-state
  driven CSS transitions, reduced-motion snap). useIsomorphicLayoutEffect
  moved utils/ → hooks/ (it is a hook; utils bans React types; barrel path
  unchanged). All five PUBLIC per §8.6 (owner). 39 new tests → 275 total.
- **Responsive convention** (0.2): §8.1 resolved (owner) — annotated rem
  literals in CSS + utils/breakpoints.ts as the one JS home, drift-tested
  against tokens.json; ResponsiveValue<T> + responsiveStyleVars ready for Box.
- **Motion convention** (0.3): motion-token rule + useTransitionState
  data-state pattern, written into COMPONENT_RECIPE "Hooks, responsive &
  motion".
- **Storybook-as-docs** (0.4): @storybook/addon-docs added (owner approved;
  family aligned to 10.5.6 — addon peer needed it), autodocs prop tables via
  react-docgen-typescript with node_modules propFilter, Button.mdx as the §6
  per-component template, Guides/Getting Started + Guides/Theming pages,
  Guides sorted first.
- **Token queue** (0.5): TOKENS_PLAN.md already the standing handoff; nothing
  further.

Found & fixed along the way: graphify's LAYER_OF name-list had rotted
(focusTrap/scrollLock drawn as components) — layering is now path-based and
warns on unknown folders; graphify.html's chrome had been ALL BLACK since the
Aug-2026 migration (LIGHT/DARK maps still on dead web.* paths, masked by the
'#000' fallback) — repointed to theme.*. Changeset: gentle-hooks-arrive
(minor). DECISIONS: four new entries.

2026-08-07 (later): **Phase 1 (layout) complete** — Box, Flex, Grid,
Container, Divider, full recipe each (types/CSS/tests/stories/MDX/a11y/
barrel). Box proves the responsive machinery: token-typed props → inline
per-breakpoint custom properties → static CSS fallback chains; side > axis >
all precedence resolved per breakpoint in JS. First real bug caught by its
tests: base-required ResponsiveObject detection broke sparse objects —
ResponsiveObject keys are now ALL optional ({ tablet: 4 } = "from tablet
up"), a logged deviation from the blueprint sketch. New utils/tokenScales.ts
(drift-tested token-key unions, barrel-exported). Grid = explicit responsive
columns (minChildWidth rejected); Container caps via viewport content-max
with current-breakpoint margins; Divider excludes the red `strong` token
with a drift test that flags the corrected export. componentDefaults grew
Flex/Grid gap, Container.size, Divider.tone. All new CSS uses logical
properties (§5 conventions folded into RECIPE). 326 tests (51 new).
Changeset: proud-layouts-arrive (minor). DECISIONS: one entry with the six
build-time calls.

2026-08-07 (evening): **Storybook Vitest addon installed** (owner pasted
Storybook's install prompt). `@storybook/addon-vitest` + `@vitest/browser-playwright`

- `playwright` devDeps (10.5.6 family); Chromium binaries installed locally.
  vitest.config.ts is now two named projects — `unit` (the former jsdom config,
  verbatim) and `storybook` (every story rendered headless in Chromium via the
  addon's plugin; a11y checks in `todo` mode from the wizard's preview.ts
  parameter). **`pnpm test` is scoped to `--project=unit`** so CI stays green
  (runners have no Playwright browsers); `pnpm test:storybook` runs the story
  project. Verified both ways: CLI 111 story tests / 19 files green in 34s, and
  the Storybook UI testing panel ("Run tests" → "Ran 111 tests") live at :6006.
  Unit suite unchanged (329 green). Wizard landmine + CI question in DECISIONS
  same date. No changeset (devDeps only). Graph regenerated — drift found was
  pre-existing (untracked utils/drag.ts), not from this change.

2026-08-07 (later still): **Phase 2 (forms) complete** — Field, IconButton,
Textarea, Radio+RadioGroup, Switch, Slider, full recipe each, plus
framework-free `utils/drag.ts` and FieldContext adoption in Input/Checkbox/
Select (additive; explicit props still win). `useField()` is public so
consumer controls can join the same wiring. 403 tests (77 new). Changeset:
bright-forms-arrive (minor).

**Four defects found after the suite was green** — worth remembering how each
surfaced:

- **Live browser** caught Slider's drag going stale mid-gesture (the move
  handler froze `current` at pointerdown, so dragging back to the start value
  was dropped). jsdom passed because assertions only moved forward.
- **Multi-agent adversarial review** (6 lenses, every finding refuted-or-
  confirmed by an independent verifier; 5 of ~18 candidates survived) caught
  Slider misrouting `aria-valuetext` to the roleless root, Slider's
  hand-rolled ref merge breaking React 19 ref cleanup, and Textarea freezing
  at its last autosized height when autosize is switched off.
- **eslint** caught `aria-required` on `role="slider"` (unsupported).

All four are fixed with regression tests. `jsx-a11y/label-has-associated-control`
is now configured with `controlComponents` naming our wrappers rather than
disabled, so it keeps checking real cases.

Bundle budgets re-based (js 60k / cjs 48k / css 100k) — measured composition:
~30KB tokens is a fixed floor, ~40KB is component CSS at ~1.7KB/component.
Note `check:size` is not in ci.yml; wiring it in is an open owner question.

2026-08-07 (evening): **Phase 3 (overlays & feedback) complete** — Tooltip,
Popover, Menu, Drawer, Toast (provider + `useToast`), Spinner, Progress,
Skeleton. `utils/positioning` gained `computeAnchoredPlacement`
(side × align, flip, shift) and three internal hooks carry the shared
machinery: `useThemedPortal`, `useAnchoredPosition`, `useTriggerRef`.
**floating-ui was not added**, per the phase plan. 524 tests (108 new).
Changeset: swift-overlays-arrive (minor).

**A 24-agent adversarial review confirmed 15 defects — all fixed.** The two
worth remembering:

- **`visibility: hidden` silently breaks `focus()`** (and removes the element
  from the a11y tree). Floating surfaces are hidden for one frame before
  measurement; using `visibility` meant Menu's roving focus and Popover's
  initial focus both landed nowhere. Now `opacity: 0` + `pointer-events: none`.
- **A pointer-opened Menu was completely keyboard-dead** — focus stayed on
  the trigger, the keydown handler lives on the portalled surface (a React
  sibling, so trigger keys never reach it), and `useDismiss` runs with
  `escape: false`, so nothing handled Escape either. It contradicted the
  contract Menu.mdx already documented. Fixed by focusing the surface when
  there is no active item.

Plus: Toast's exit transition was unreachable, its two live regions were
drawn on top of each other, they needed `aria-atomic="false"`, `regionProps`
could override the live-region contract, centre placement broke in RTL,
Popover stole focus on close, Menu's type-ahead buffer leaked between
sessions, the trigger ref churned every render (discarding React 19 ref
cleanups), and `DrawerSlotProps.close` had the wrong attribute type.

⚠ **The Browser pane runs `visibilityState: "hidden"`, so
`requestAnimationFrame` never fires there** — `useTransitionState` stays at
`exited` and animations cannot be verified in it. Layout, focus, and ARIA
can. Also: driving a component by dispatching events on its internal element
proves the handler, not the user path — that is exactly how the Menu bug
survived a browser check.

Bundle budgets re-based ONCE for the full catalog (js 92k / cjs 74k /
css 112k) with the measured growth curves recorded in the script.

2026-08-07 (night): **Phase 4 (navigation & data) complete — the §3 catalog
is CLOSED at 38 components.** Tabs, Link, Pagination, Accordion, Avatar,
Chip, Table. Roving tabindex extracted to `hooks/useRovingFocus`; Menu
refactored onto it. RadioGroup deliberately did NOT adopt it — native radios
get roving from the platform, so layering JS on top would be a regression
(the blueprint's note predates Phase 2's native-radio choice). 653 tests
(129 new). Changeset: clever-navigation-arrives (minor).

**15 defects confirmed by adversarial review, all fixed.** Two lessons worth
carrying into Phase 5/6:

- **Never emit state from an effect.** Tabs' automatic activation called
  `onChange` from a `useEffect` whose guard was "selected ≠ active". A
  controlled owner that declines the change never closes that guard, and
  since `items`/`onChange` are fresh identities inline, it re-fired every
  render — a verifier reproduced "Maximum update depth exceeded". Selection
  is a user action; it belongs in the handler. Now written into the RECIPE.
- **Logical borders + a physical `transform` is an RTL trap.** It hit
  Pagination, Accordion, and Table at once (and Toast last phase):
  `border-inline-end` flips under `dir="rtl"` while `rotate()` does not, so
  the glyph mirrors out from under its own transform. Drawn glyphs now use
  PHYSICAL borders plus an explicit `[dir='rtl']` rule only where they carry
  direction. Verified in a real browser. The exception is in the RECIPE.

Also fixed: three more stale-selection bugs in Tabs (async items, removed
tab, disabled selection — each left the widget with no tab stop), a
`useRovingFocus` index not reconciled when items shrink, button-part
`slotProps` typed `HTMLAttributes` instead of `ButtonHTMLAttributes` (the
Drawer bug again — a lint rule would be cheaper than catching it a third
time), and Link's new-tab text concatenating as "Docsopens in a new tab"
because the accessible-name algorithm trims each element's text.

⚠ Reminder that bit twice now: the Browser pane is `visibilityState:
"hidden"`, so **transitions never advance there**. Reading a transitioned
property (`transform`, `opacity`, `background-position`) gives the start
value forever. Inject `transition: none !important` before measuring, or you
will "find" a bug that is not there.

2026-08-07 (later): **`@chromatic-com/storybook` addon added** (owner
request). devDependency + one line in `.storybook/main.ts`; nothing else.
The existing `chromatic` CLI and `.github/workflows/chromatic.yml` are
untouched and still do the CI gating. The addon adds a Visual Tests panel in
the Storybook UI, but **it is installed, not enabled** — it needs the project
linked from that panel (which writes `chromatic.config.json`) before it runs
anything locally. Installed with `--yes` per the recorded landmine. No
changeset (tooling only).

2026-08-07 (later still): **Story tests now run in CI** — the open owner
question from the Vitest-addon entry is closed. ci.yml gains a third job,
`stories`, parallel to `verify` and `gates`: install → build tokens only
(preview.ts's `tokens.css` is the one dist dependency; stories themselves
import from relative source) → restore/install Chromium → `pnpm test:storybook`.
Playwright binaries are cached on the resolved version (1.62.1 → chromium-1234),
and the cache-hit branch still runs `install-deps` because apt libraries are not
in `~/.cache` — skipping that fails only on the _second_ run. New root script
`pnpm test:storybook`; `pnpm test` still means the unit project. a11y stays
`test: 'todo'` (reported, not failed on) — promoting it is a separate call.
The story suite has grown with the catalog: **40 files / 243 tests**, up from
the 19/111 recorded when the addon landed. Verified locally (green through the
new root script, ci.yml parsed, cache key + tokens build + format + graph:check
checked); **the Linux-runner half — apt deps and the cache branches — is
unverified until it runs on GitHub.** No changeset (tooling only).

2026-08-07 (night): **Phase 5 — `@vegam-ui/icons` built.** Third workspace
package, same packaging standard as ui minus everything CSS- and
directive-related. `createIcon` (exported, not internal — consumers need to
mint matching glyphs), zero-dep codegen from committed Figma SVGs, 94 tests,
Storybook gallery/playground/size-ramp/colour + MDX. All gates green: attw 🟢
across four modes, publint clean, both tarballs through all four smoke apps,
size at 15–16% of the 85-icon budget.

⚠ **17 of 85 icons are exported — the remaining 68 are the one outstanding
item.** The Figma Desktop Bridge drops its socket when an `exportAsync` loop
runs much past 5s and then needs a manual restart in Figma; it crashed four
times. The rest is mechanical: `packages/icons/figma-nodes.json` has all 85
node ids, and `pnpm icons:import` reports what is missing and prints the exact
next-batch snippet. Batches that land are never lost.

Build-time corrections to ICONS_PLAN (details in DECISIONS same date): the
theme's icon tokens are `--ui-color-icon-*`, **not** `--ui-icon-*` as the plan
claimed (the wrong name would have resolved to nothing, silently); a consumer
`aria-label` now counts as naming an icon, not just `title` (otherwise a
labelled icon stayed `aria-hidden` — a silent a11y failure); codegen **rejects**
`id=`/`url(#…)` because unique ids would need `useId`, which would cost
server-component safety. The `xxl` (28px) between `lg` and `xl` trap is
handled by sorting the ramp by value and asserting the order in a test.
Changeset: eighty-icons-arrive (minor, first release → 0.1.0).

2026-08-07 (night, later): **Phase 6 — 1.0 prepared, deliberately not bumped**
(owner: "prep it, I'll test later").

- **docs/SCREEN_READER_CHECKLIST.md** — the one gate that cannot be automated,
  written up so it is a task to run rather than a task to design: NVDA and
  VoiceOver setup with the keys that matter, per-component steps ("press this,
  you should hear that"), cross-cutting checks (200% zoom, reduced motion,
  Windows high contrast), and a results table. Several entries encode bugs this
  library has actually shipped — Menu's pointer-opened-then-keyboard path,
  Link's "Docsopens in a new tab" run-together, Checkbox's indeterminate.
- **11 missing MDX pages written** (Badge, Banner, Blanket, Breadcrumbs, Card,
  Checkbox, Input, Modal, Select, Stack, Text) — the pre-blueprint twelve minus
  Button. §6 docs now complete at **38/38**; Storybook builds clean.
- **API sweep** → COMPONENT_RECIPE "Which axis name": `size` = scale,
  `variant` = structural, `tone` = colour only, `intent` = status that ALSO
  changes ARIA semantics. Verified clean: no default exports, no deep-import
  surface, every native-attr collision `Omit`-ed with a documented reason.
  `Modal.appearance` is flagged as the one 1.0 rename candidate — **not
  renamed**, because changing a shipped public prop is the owner's call.
- **Token nulls reconciled**: one left (`space.11`), consciously shipped on its
  fallback chain; logged in TOKENS_PLAN "1.0 reconciliation".

## State of the world

- Git repo on `main`, pushed to **github.com/vihaanvegam/vegam-ui**.
  Repository links configured, release workflow added.
- **Published to npm**: @vegam-ui/ui@0.1.0, @vegam-ui/tokens@0.1.0.
  **@vegam-ui/icons is new and unpublished** (0.0.0 → 0.1.0 on the next
  `changeset version`). Local versions are ahead with pending changesets
  (brave-banners-arrive, calm-overlays-appear, smart-tiers-arrive,
  gentle-hooks-arrive, proud-layouts-arrive, bright-forms-arrive,
  swift-overlays-arrive, clever-navigation-arrives, eighty-icons-arrive) —
  next `changeset version` + publish ships the Figma components, the token
  schema migration, the public hooks layer, every component from Phases 1–4,
  and the icon package.
- Changesets configured: @changesets/changelog-github generator (needs
  GITHUB_TOKEN), `access: public`, `privatePackages: false`.
- Publish dry-run clean. Tarball contents verified by hand:
  ui = dist/{index.js,.cjs,.css,.d.ts,.d.cts,+2 maps} + package.json + README + LICENSE;
  tokens = dist/{tokens.js,.cjs,.css,.scss,.d.ts,.d.cts} + package.json + README + LICENSE.
- Library surface: **38 components — the committed catalog, complete**
  (Button, Input, Text, Card, Badge, Banner, Blanket, Breadcrumbs, Modal,
  Stack, Checkbox, Select · P1: Box, Flex, Grid, Container, Divider ·
  P2: Field, IconButton, Textarea, Radio, RadioGroup, Switch, Slider ·
  P3: Tooltip, Popover, Menu, Drawer, Toast, Spinner, Progress, Skeleton ·
  P4: Tabs, Link, Pagination, Accordion, Avatar, Chip, Table)
  - ThemeProvider/useComponentDefaults/cx + PUBLIC hooks (useControlled,
    useMediaQuery, useBreakpoint, useDismiss, useTransitionState,
    useIsomorphicLayoutEffect) + `useField` + `useToast` + breakpoint and
    token-scale constants/types + `computeAnchoredPlacement` + internal utils
    (focusTrap, scrollLock, listNavigation, positioning, dismiss, responsive,
    tokenScales, drag) and internal hooks (useThemedPortal,
    useAnchoredPosition, useTriggerRef, useRovingFocus). 653 tests.
  - **MDX docs complete at 38/38** (the 11 pre-blueprint gaps closed 2026-08-07).
- **@vegam-ui/icons**: `createIcon` + `ICON_SIZES` + 17 of 85 glyphs, 94 tests.
  No CSS, no runtime deps, no `'use client'` — the only RSC-safe package.
  Story suite: 41 files / 247 tests.
- Gates green (attw ×4 modes, publint, directive, smoke ×4) — last full run
  2026-08-07 with Phases 1+2 in the bundle. Size budgets re-based and now at
  65–70%. Storybook prod build green. Verified LIVE in the browser, not just
  jsdom: Box padding 8px→24px across breakpoints and Grid 1→2→4 tracks at
  375/900/1400px; Textarea autosize 66→114→162px capped at maxRows and back
  (the path jsdom cannot exercise — it reports no layout metrics); Slider
  drag + full APG keyboard map; Field label-click focusing its control with
  both description and error in `aria-describedby`; Radio's 2px selected ring
  and single-selection; Switch's grey/left ↔ blue/right states.
  ⚠ Probing computed styles while a CSS transition is mid-flight returns the
  animated value — it made a correct Switch look broken for several rounds.
  Kill the transition (or read a story rendered in its final state) before
  concluding anything from `getComputedStyle`.

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

Nothing.

## Blocked

Nothing.

## Next actions (whenever the user wants them)

**All six BLUEPRINT phases are built.** Two things are genuinely outstanding,
and both need the owner rather than more code:

1. **Export the remaining 68 icons.** Mechanical, ~20 minutes once the Figma
   Desktop Bridge is stable. Loop until `pnpm icons:import` reports nothing
   missing:
   - Reopen the Desktop Bridge plugin in Figma (it crashes on long export
     loops and does not come back on its own).
   - `pnpm icons:import` → prints the next batch of 8 as a ready-to-run
     snippet. Run it through the bridge, save the JSON, `pnpm icons:import
that.json`.
   - Then `pnpm icons` → `pnpm graph` → `pnpm gates`. Nothing else changes; the
     gallery story enumerates the barrel, so new glyphs appear on their own.
2. **Run the screen-reader pass** — docs/SCREEN_READER_CHECKLIST.md, start to
   finish. **This is the last 1.0 gate.** When it passes: bump per
   RELEASING.md and record the pass (screen-reader + browser versions, date)
   in DECISIONS.md.

Decisions waiting on the owner (none blocking):

- **`Modal.appearance` → `tone`?** The one axis named after Figma rather than
  the library's own rule. Pre-1.0 is the free moment to rename it; after 1.0 it
  is a breaking change. Flagged, not done.
- Whether to consume the pending changesets and publish, or hold for 1.0.

Worth doing before or during 1.0 (owner's call, none blocking):
`check:size` is still not wired into ci.yml; a lint rule for button-part
`slotProps` would stop the `ButtonHTMLAttributes` slip recurring; promoting
Storybook's a11y check from `test: 'todo'` to `'error'` would gate CI on
violations (untriaged today); and REMAINING.md's Tier-Later list (RTL audit of
the pre-blueprint 12, per-component entrypoints, DataGrid) is untouched.

- Ask the user before starting each phase/component/new dependency — standing
  preference, recorded in BLUEPRINT's usage rules.
- Phase 5 now has its full build plan in docs/ICONS_PLAN.md — no code until
  Phases 0–4 close; its first build step is the Figma icon-set inventory.
- packages/tokens/TOKENS_PLAN.md is ready to hand to the design team; nothing
  in code blocks on it.
- docs/REMAINING.md still holds pre-blueprint gaps and landmines; its §4
  roadmap role is superseded by BLUEPRINT.

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
