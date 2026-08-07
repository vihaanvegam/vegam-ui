# Blueprint — the road to a full component library

Adopted 2026-08-06 (owner's decisions logged in DECISIONS.md, same date).
This file says **what** to build and **in which order** to take @vegam-ui
from 12 components to a full-featured library — MUI-class capability,
deliberately not MUI's architecture. [COMPONENT_RECIPE.md](COMPONENT_RECIPE.md)
stays the authority on **how** to build any single component; every locked
decision and gate in CLAUDE.md applies to every line of this plan.

**How a session uses this file:**

1. Session ritual first (CLAUDE.md → PROGRESS.md → DECISIONS.md), then open
   this file to pick work: the first unchecked item in the earliest open
   phase, unless the user directs otherwise.
2. **Ask before acting.** The owner wants a question before significant work:
   confirm scope before starting a phase or a component, before ANY new
   dependency, and before resolving an open decision (§8).
3. On completion: tick the item here (☐ → ✅ with date), update PROGRESS.md,
   append DECISIONS.md for anything decided along the way, add the changeset,
   run `pnpm graph`, and have `pnpm gates` green before calling a phase done.
4. The status ticks are the only routine hand-edits to this file. Adding,
   removing, or reordering catalog items is the user's call — never a silent
   edit — and gets a DECISIONS.md entry.

---

## 1. What "full-featured" means here

| Capability    | Today                                                             | This blueprint adds                                                     |
| ------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Theming       | CSS-variable system, `[data-theme]` remap, ThemeProvider defaults | componentDefaults for every new component; consumer theming guide (§6)  |
| Dark/light    | Pure semantic remap, zero component CSS per scheme                | Same bar for all new components, proven by a DarkScheme story           |
| Accessibility | APG-patterned components, axe suite, keyboard tests               | Pattern mapping per new component (§3–4); manual SR pass before 1.0     |
| Responsive    | Breakpoint tokens exist (48/64/80/100rem) but nothing uses them   | `ResponsiveValue` props, `useBreakpoint`, media-query policy (§5, §8.1) |
| Documentation | Storybook 10 on GitHub Pages, token gallery, Chromatic            | Storybook **is** the docs site: MDX guide per component (§6)            |
| Tests         | 217 tests, 80/75 coverage gates, axe, Chromatic                   | Same matrix for every new item; interaction depth for overlays          |
| TypeScript    | strict, dual declarations, attw/publint-gated                     | Unchanged — every phase re-passes all four gates                        |
| Versioning    | Changesets, independent versions, release CI                      | Changeset per shipped item; 1.0 criteria (§9)                           |

"Fix other things first" = **Phase 0**: the infrastructure gaps (hooks layer,
responsive + motion conventions, docs template) that every later component
leans on. Components resume only when Phase 0 is done.

## 2. Architecture — one core package (decided 2026-08-06)

| Package            | Role                                                                           |
| ------------------ | ------------------------------------------------------------------------------ |
| `@vegam-ui/ui`     | **The** library: components, hooks, theme, utils — one install, one CSS import |
| `@vegam-ui/tokens` | Framework-free token build (`src/tokens.json` is a READ-ONLY design export)    |
| `@vegam-ui/icons`  | PLANNED (Phase 5): tree-shakeable SVG icon components                          |

**Rejected: the MUI-style split** (separate core/theme/hooks/utils packages).
Every published package repeats the expensive part of this repo — exports
maps, dual declarations, attw/publint/smoke coverage, independent versioning —
for zero consumer benefit at this scale. MUI itself ships components, hooks,
and theme from one package. Nothing precludes a split later: the barrel is the
API, so package boundaries stay an implementation detail.

Source layout inside `packages/ui/src` grows by exactly ONE top-level folder:

```
components/   # one folder per component (recipe layout, unchanged)
theme/        # ThemeProvider, defaultProps context (unchanged)
hooks/        # NEW — React hooks; may import utils/, never the reverse
utils/        # framework-free TS, no React types (unchanged rule)
```

⚠ Creating `hooks/` requires updating `moduleIdFor` + `LAYER_OF` in
[scripts/graphify.mjs](../scripts/graphify.mjs) **in the same commit**
(COMPONENT_RECIPE.md "Anything new?"), or every hook lands in the wrong
subgraph.

Layering stays acyclic (visible in `pnpm graph`):
`utils` ← `hooks` ← (`theme`, `components`) ← barrel.

## 3. Catalog — the committed core set

✅ = shipped today · ☐ n = planned, built in phase n. Names deliberately reuse
what exists — **Banner is this library's Alert, Modal is its Dialog, Chip is
its Tag** — never build duplicates under MUI's names. Anything NOT in these
tables is Tier-Later (§7) and needs a user decision to promote.

### Layout

| Status | Component | Notes                                                                       |
| ------ | --------- | --------------------------------------------------------------------------- |
| ✅     | Stack     | Simple flex column/row + gap — stays the simple one                         |
| ✅     | Box       | Token-typed style primitive — the §4 pattern, NOT an sx escape (2026-08-07) |
| ✅     | Flex      | Full flexbox surface (wrap, grow, shrink, basis) (2026-08-07)               |
| ✅     | Grid      | CSS grid; responsive `columns` (2026-08-07)                                 |
| ✅     | Container | Centered max-width page shell from viewport tokens (2026-08-07)             |
| ✅     | Divider   | `hr`/separator semantics; `divider.*` tokens (2026-08-07)                   |

### Typography

| Status | Component | Notes                                                              |
| ------ | --------- | ------------------------------------------------------------------ |
| ✅     | Text      | `as` + independent size/weight/tone — there is no separate Heading |

### Inputs & forms

| Status | Component          | Notes                                                                          |
| ------ | ------------------ | ------------------------------------------------------------------------------ |
| ✅     | Button             |                                                                                |
| ✅     | Input              |                                                                                |
| ✅     | Checkbox           | Native + accent-color precedent                                                |
| ✅     | Select             | APG select-only combobox; upgrades are Tier-Later                              |
| ✅     | Field              | Label/description/error wiring for every control — §4 (2026-08-07)             |
| ✅     | IconButton         | Square Button sibling; accessible name REQUIRED at the type level (2026-08-07) |
| ✅     | Textarea           | Input sibling; autosize via minRows/maxRows only (2026-08-07)                  |
| ✅     | Radio + RadioGroup | Native radios, drawn appearance; group owns selection (2026-08-07)             |
| ✅     | Switch             | `size.switch-track-*` tokens (64×32); role="switch" (2026-08-07)               |
| ✅     | Slider             | APG slider; framework-free `utils/drag.ts` (2026-08-07)                        |

### Overlays

| Status | Component | Notes                                                             |
| ------ | --------- | ----------------------------------------------------------------- |
| ✅     | Modal     | = Dialog                                                          |
| ✅     | Blanket   | Scrim, composed by Modal/Drawer                                   |
| ✅     | Tooltip   | Hover delay from the tooltip-delay token (2026-08-07)             |
| ✅     | Popover   | Non-modal anchored surface — the interactive tooltip (2026-08-07) |
| ✅     | Menu      | = Dropdown; APG menu-button, roving focus (2026-08-07)            |
| ✅     | Drawer    | Modal's machinery + placement axis (2026-08-07)                   |

### Feedback

| Status | Component | Notes                                                          |
| ------ | --------- | -------------------------------------------------------------- |
| ✅     | Banner    | = Alert                                                        |
| ✅     | Badge     | Static status; interactive/dismissible is Chip                 |
| ✅     | Toast     | Provider + `useToast()` (2026-08-07)                           |
| ✅     | Spinner   | `role="status"` + consumer label (2026-08-07)                  |
| ✅     | Progress  | `role="progressbar"`, determinate + indeterminate (2026-08-07) |
| ✅     | Skeleton  | Shimmer honors `prefers-reduced-motion` (2026-08-07)           |

### Navigation

| Status | Component   | Notes                                                            |
| ------ | ----------- | ---------------------------------------------------------------- |
| ✅     | Breadcrumbs |                                                                  |
| ✅     | Tabs        | APG tabs; roving-tabindex util now shared with Menu (2026-08-07) |
| ✅     | Link        | Router integration via `slots.anchor` (2026-08-07)               |
| ✅     | Pagination  | Composes Button/IconButton (2026-08-07)                          |

### Data display

| Status | Component | Notes                                                       |
| ------ | --------- | ----------------------------------------------------------- |
| ✅     | Card      |                                                             |
| ✅     | Accordion | Disclosure pattern; single + multiple expanded (2026-08-07) |
| ✅     | Avatar    | Image + initials fallback; no icon assets (2026-08-07)      |
| ✅     | Chip      | = Tag; interactive, dismissible (2026-08-07)                |
| ✅     | Table     | Basic semantic table, data-driven — §4 (2026-08-07)         |

### Exported utilities & hooks

| Status | Export                                                                          | Notes                                                   |
| ------ | ------------------------------------------------------------------------------- | ------------------------------------------------------- |
| ✅     | ThemeProvider · useComponentDefaults · cx · useIsomorphicLayoutEffect           |                                                         |
| ✅     | useControlled · useMediaQuery · useBreakpoint · useDismiss · useTransitionState | Public (§8.6 resolved); shipped 2026-08-07 with Phase 0 |

**Count: 12 shipped + 26 planned = 38 components**, plus the hooks layer.

## Phases

### Phase 0 — Foundations ("fix other things first")

| #   | Item                   | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1 | `hooks/` layer         | `useControlled` (controlled/uncontrolled state — extract the pattern Select/Breadcrumbs hand-roll); `useMediaQuery` + `useBreakpoint` (SSR-safe via `useSyncExternalStore`; server snapshot = `false`/`'base'`, no hydration mismatch); `useDismiss` (Escape + outside-pointer, extracted from Select's inline handlers); `useTransitionState` (enter/exit mount states driving CSS transitions; reduced motion skips straight to the end state). Update graphify's `moduleIdFor`/`LAYER_OF` in the same commit. |
| 0.2 | Responsive convention  | `ResponsiveValue<T> = T \| { base: T; tablet?: T; laptop?: T; desktop?: T; wide?: T }`, resolved to per-breakpoint custom properties + fixed media queries. Resolve §8.1 first.                                                                                                                                                                                                                                                                                                                                  |
| 0.3 | Motion convention      | Durations from `motion.*` tokens (fallbacks where null, per TOKENS_PLAN); every transition behind `prefers-reduced-motion` (recipe already demands it); overlay enter/exit standardized on `useTransitionState`.                                                                                                                                                                                                                                                                                                 |
| 0.4 | Storybook-as-docs      | Autodocs + the §6 MDX template; Getting Started and Theming guide pages; retrofit MDX to existing components opportunistically (one per component touched).                                                                                                                                                                                                                                                                                                                                                      |
| 0.5 | Token queue handed off | [packages/tokens/TOKENS_PLAN.md](../packages/tokens/TOKENS_PLAN.md) goes to design. Nothing blocks on it — the `var(--token, fallback)` policy already covers every null.                                                                                                                                                                                                                                                                                                                                        |

Exit: hooks tested + graphed (barrel exports per §8.6), conventions appended
to COMPONENT_RECIPE.md as a "Hooks, responsive & motion" section, gates green.

**✅ Phase 0 complete 2026-08-07** — all five items delivered; §8.1 + §8.6
resolved and @storybook/addon-docs approved (DECISIONS same date); 0.5 was
already satisfied (TOKENS_PLAN.md is the standing handoff document).

### Phase 1 — Layout

Box, Flex, Grid, Container, Divider. Key specs in §4. Stack is NOT rebuilt on
Box unless it falls out for free — its simple API is the point.

**✅ Phase 1 complete 2026-08-07** — all five shipped (Stack untouched);
build-time calls logged in DECISIONS the same date (Grid columns model,
sparse ResponsiveObject, Box border/`as` details, divider `strong` excluded).

### Phase 2 — Forms

Field ships **first** — the other five adopt its context in the same phase.
Existing Input/Checkbox/Select also adopt FieldContext (additive, minor bump).
Radio's selected ring is literally what `border-width.selected` was tokenized
for. Slider needs `utils/drag.ts` (pointer capture + keyboard steps,
framework-free, tested like listNavigation).

**✅ Phase 2 complete 2026-08-07** — all seven shipped (Field, IconButton,
Textarea, Radio+RadioGroup, Switch, Slider) plus `utils/drag.ts` and
FieldContext adoption in Input/Checkbox/Select. Build-time calls and the four
defects found by review (three by a multi-agent adversarial pass, one by live
browser verification) are logged in DECISIONS the same date.

### Phase 3 — Overlays & feedback

Everything reuses what exists: `positioning.ts` (extend with side/align
placement for Tooltip/Popover/Menu — extend our util, do not add floating-ui),
portal-to-nearest-`[data-theme]` (Select/Modal precedent), focusTrap +
scrollLock (Drawer), useDismiss + useTransitionState everywhere.
Spinner/Progress/Skeleton are cheap; Tooltip/Popover/Menu/Toast are the real
work. Toast API per §4; z-index values per TOKENS_PLAN (interim fallbacks).

**✅ Phase 3 complete 2026-08-07** — all eight shipped, plus
`computeAnchoredPlacement` (side/align/flip/shift) and the `useAnchoredPosition`
/ `useThemedPortal` / `useTriggerRef` hooks. floating-ui was NOT added, as
planned. Fifteen defects found by adversarial review and fixed; the notable
ones are logged in DECISIONS the same date.

### Phase 4 — Navigation & data

Tabs, Link, Pagination, Accordion, Avatar, Chip, Table. Roving-tabindex util
lands here at the latest (Tabs) and RadioGroup switches to it if it shipped
earlier with a local implementation. Table per §4.

**✅ Phase 4 complete 2026-08-07** — all seven shipped. Roving tabindex was
extracted to `hooks/useRovingFocus` and **Menu** adopted it (RadioGroup did
not need it: native radios get arrow-key roving from the platform, so
re-implementing it would have been a regression). Fifteen defects found by
adversarial review, all fixed; the notable ones are in DECISIONS same date.

**The §3 catalog is now complete: 38 of 38 components.** Remaining:
Phase 5 (@vegam-ui/icons, plan in ICONS_PLAN.md) and Phase 6 (1.0, §9).

### Phase 5 — `@vegam-ui/icons`

- **Detailed build plan: [ICONS_PLAN.md](ICONS_PLAN.md)** (authored
  2026-08-06 — API, codegen, packaging, gate changes, Storybook gallery,
  build order; §8.2 resolved the same day).
- Third workspace package, same packaging standard as ui: dual declarations,
  types-first exports, added to attw/publint and the smoke apps (each imports
  one icon), graph picks it up from the manifest.
- Source SVGs exported from the design's Figma icon set (`size.icon-*` and
  `border-width.icon` tokens exist for exactly this); codegen per §8.2.
- One module per icon, per-icon named exports (`IconCheck`, …),
  `sideEffects: false`, color via `currentColor`, size prop from the
  `size.icon-*` scale, `aria-hidden` by default with an opt-in label.
- **No `'use client'`** — icons are stateless SVG functions that never read
  context, so they stay server-component-safe. The line-1 directive gate is
  ui-only.
- ui components keep drawing their built-in glyphs (Select caret, close ✕):
  **ui must never depend on icons** — that would break ui's zero-runtime-deps
  invariant and force icon opinions on consumers.

**🟡 Phase 5 built 2026-08-07, one step outstanding.** The package ships:
`createIcon` (exported, so consumers can mint matching icons), the zero-dep
codegen + `icons:check` drift gate, 94 tests, and every §5 gate change —
attw/publint on icons, the **inverse** directive assert, both tarballs in
smoke with next-app rendering an icon from its root layout (the RSC proof),
and icons budgets in `check:size`. Storybook has the Icons gallery, playground,
size-ramp and colour stories plus the MDX page. All gates green.

**Outstanding: 17 of the 85 icons are exported.** The Figma Desktop Bridge
crashed repeatedly mid-export (it drops its socket when an `exportAsync` loop
runs much past 5s), so the remaining 68 need re-running. This is mechanical,
not a design question: `pnpm icons:import` prints the exact next batch, and
`packages/icons/figma-nodes.json` holds all 85 node ids. Nothing else in the
package changes when they land.

### Phase 6 — 1.0

§9 checklist. Breaking-change sweep batched into one release.

**🟡 Prepared 2026-08-07 (owner: "prep it, I'll test later") — everything
except the manual pass:**

- **Docs complete.** The 11 pre-blueprint components that never got an MDX
  page (Badge, Banner, Blanket, Breadcrumbs, Card, Checkbox, Input, Modal,
  Select, Stack, Text) now have one. **38 of 38 components documented**;
  Storybook builds clean.
- **API sweep done**, results written into COMPONENT_RECIPE "Which axis name"
  so they bind future components: the `size`/`variant`/`tone`/`intent` rule,
  with `intent` reserved for axes that change ARIA semantics. Two exceptions
  logged rather than changed (`Button.variant`'s `danger`,
  `Modal.appearance`). Verified clean: no default exports, no deep-import
  surface, every native-attribute collision `Omit`-ed and documented.
- **Token nulls reconciled** — one remains (`space.11`), consciously shipped
  on its fallback chain; logged in TOKENS_PLAN "1.0 reconciliation".
- **The manual screen-reader pass is written up and waiting**:
  [SCREEN_READER_CHECKLIST.md](SCREEN_READER_CHECKLIST.md) — NVDA and
  VoiceOver setup, per-component keys and expected announcements, and a
  results table.

**The version bump is deliberately NOT done.** 1.0 promises semver, and that
promise should not be made until the screen-reader pass has actually been run.

## 4. Component specs — the non-obvious ones

### Box — token-typed style props WITHOUT a style engine

Box must not become `sx`. Fixed, finite prop surface; every value is a token
key, not a CSS value:

- `p px py pt pr pb pl · m mx my mt mr mb ml` — keys of the space scale
- `bg` — keys of `color.surface.*` only; `radius` — radius scale keys;
  `borderColor` — keys of `color.border.*`; `shadow` — elevation keys once
  TOKENS_PLAN fills them
- `as` — polymorphic element (Text precedent)
- every prop accepts `ResponsiveValue<key>`

Implementation: each prop maps to an inline custom property
(`style={{ '--ui-box-p': 'var(--ui-space-4)' }}`) consumed by static CSS
(`padding: var(--ui-box-p, 0)`). A map lookup, not style generation — zero
runtime engine, arbitrary values impossible. Anything beyond the surface is
what `className`/`style` are for (they already merge). Token-key prop unions
are hand-written in `.types.ts` (the scales are stable; regenerate-from-tokens
is a TOKENS_PLAN note, not a build step).

### Grid + Container

Grid: `columns?: ResponsiveValue<number>`, `gap` from the space scale
(StackGap precedent), plus either `minChildWidth` (auto-fill/minmax) or
explicit responsive columns — implementer picks ONE model at build time and
logs it. Container: `size?: 'tablet' | 'laptop' | 'desktop' | 'wide'` —
max-widths, margins, and gutters now come straight from the Aug-2026 export's
`viewport.<bp>.content-max/margin/gutter` tokens (`--ui-viewport-*`);
centered, `as`-polymorphic.

### Field

Wraps ONE control with label + optional description + error. `useId` wires
`htmlFor`/`aria-describedby`/`aria-invalid` through a FieldContext; controls
read the context when present, explicit props always win. All copy (label,
error, description) is consumer content — no hardcoded strings, per the
locked rule. `aria-required` from a prop; the visual required marker is a
slot, not a `*` literal.

### Toast — provider + hook, NOT an import-and-call singleton

`<ToastProvider max placement>` + `useToast()` → `{ show, dismiss }`. A
module-level `toast()` import is rejected by default for the same reason
theme state lives in CSS: two React copies would mean two queues (the
dual-package hazard, DECISIONS 2026-07-29). Regions: `role="status"` for
info/success, `role="alert"` for warning/danger (Banner precedent).
Auto-dismiss timers pause on hover/focus. Placement from a fixed union;
portal via the `[data-theme]` mechanism; content is consumer ReactNode +
action slot — no icons, no default copy.

### Table — basic data-driven table, not a grid

`columns: TableColumn<Row>[]` + `data: Row[]` + `getRowKey`. Custom rendering
via `slots.headerCell`/`slots.cell` (the locked composite pattern — NOT
compound children). Semantic `table/thead/tbody/th scope`. Optional sortable
columns emit `aria-sort` + `onSortChange` — **sorting the data is the
consumer's job**; ui performs no data operations. Sticky header via a
component custom property. Selection, expansion, virtualization, editing =
DataGrid = Tier-Later.

### Menu

APG menu-button: trigger with `aria-haspopup="menu"`; focus MOVES into the
menu (roving tabindex — the APG default; activedescendant stays Select's
model, see §8.4). Typeahead + arrow order reuse `listNavigation`. Items are
data with `slots.item` for router links/rich content. Submenus are
Tier-Later.

### Tooltip / Popover split

Tooltip: `role="tooltip"` + `aria-describedby`, opens on focus immediately
and on hover after `motion.duration.tooltip-delay`, Escape dismisses, never
contains interactive content, and is unreliable on touch — docs must say
critical info can't live only in a tooltip. Anything interactive or
click-opened is Popover (focus management, useDismiss, positioning; no trap —
it is non-modal).

### Drawer

Modal's machinery end-to-end (Blanket, focusTrap, scrollLock, controlled-only
API, `[data-theme]` portal) + `placement: 'left' | 'right' | 'top' | 'bottom'`

- size custom properties + slide transitions via useTransitionState.

## 5. Conventions binding every new component

Fold into COMPONENT_RECIPE.md during Phase 0; from then on they are recipe,
not suggestions.

- **Logical properties**: all new CSS uses `padding-inline`,
  `margin-block-start`, `inset-inline-end`, … so RTL becomes a `dir`
  attribute, not a rewrite. Retrofitting the existing 12 is Tier-Later.
- **Responsive props** use `ResponsiveValue<T>`; media queries appear only at
  the four breakpoint values, each annotated with the token name (§8.1).
- **Controlled + uncontrolled** via `useControlled` wherever state exists.
- **Overlay checklist**: portal to nearest `[data-theme]` · positioning via
  `utils/positioning` · dismissal via `useDismiss` · focus trap + scroll lock
  only for modal surfaces · z-index via `var(--ui-z-*, fallback)` per
  TOKENS_PLAN.
- **No module-level mutable state**, ever — dual-package hazard.
- **Every new component**: entry in `src/test/a11y.test.tsx` (axe) · keyboard
  interaction tests · DarkScheme story · MDX doc (§6) ·
  `ThemeComponentDefaults` registration when it has cosmetic axes · changeset
  · `pnpm graph`.
- **Dimensions with no token** become component custom properties
  (`--ui-<block>-*`, Modal-sizes precedent). Reusable values get REQUESTED in
  TOKENS_PLAN.md instead — `tokens.json` is never edited here.

## 6. Documentation standard — Storybook is the docs site

Decided 2026-08-06: no separate docs site; invest in the deployed Storybook.

Per component: the recipe's stories (variant each, composites, DarkScheme,
Playground) **plus an MDX page**: what it is / when to use it — and when NOT
(point at the sibling: Badge vs Chip, Tooltip vs Popover, Banner vs Toast);
import snippet; prop table from the types; a11y notes (keyboard map, SR
behavior); theming surface (class constants, component custom properties,
componentDefaults key); Figma source link when built from a handoff.

Workshop pages: Getting Started (install → one CSS import → first component),
Theming guide (data-theme, token overrides, componentDefaults), an Icons
recipe (lucide/heroicons integration until Phase 5 ships), and the existing
token gallery. ReactNode/object controls stay disabled in stories (Storybook
writes junk args — PROGRESS 2026-08-04).

## 7. Tier-Later — visible, deliberately uncommitted

Promotion into §3 is a user decision. Autocomplete/editable combobox (a
different APG pattern from Select) · DatePicker/TimePicker/Calendar (i18n +
locale data; the single most expensive item on this page) · DataGrid
(virtualization, selection, editing) · TreeView · Stepper · Rating ·
FileUpload · NumberInput/spinbutton · Select upgrades (multi, groups, async,
virtualization — REMAINING.md §4) · Menu submenus/Menubar · Carousel ·
Transfer list · density axis · full RTL audit of the pre-blueprint 12 ·
per-component entrypoints · `preserveModules` RSC granularity · a dedicated
docs site.

## 8. Open decisions — ask the user, then log in DECISIONS.md

| #   | Decision                                                                 | Recommendation                                                                                                                                                                                  |
| --- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 8.1 | Breakpoint values in media queries (custom properties are invalid there) | **Resolved 2026-08-07 — annotated rem literals** + one JS home (`utils/breakpoints.ts`, drift-tested against tokens.json); DECISIONS same date. PostCSS `@custom-media` rejected (new dep).     |
| 8.2 | Icon codegen                                                             | **Resolved 2026-08-06 — hand-rolled, zero deps** (owner's call; DECISIONS.md same date, plan in [ICONS_PLAN.md](ICONS_PLAN.md)). SVGR rejected: new devDeps for a job a ~150-line script does.  |
| 8.3 | Toast API shape                                                          | Provider + `useToast` (dual-package-safe). Module singleton rejected by default.                                                                                                                |
| 8.4 | Menu focus model                                                         | Roving focus per APG menu pattern; activedescendant remains Select-only. Unifying both on one model is allowed if tests stay green.                                                             |
| 8.5 | Table sorting scope                                                      | `aria-sort` + `onSortChange` callback only; ui never sorts data.                                                                                                                                |
| 8.6 | Hook visibility                                                          | **Resolved 2026-08-07 — all five public** from the barrel, with Breakpoint/ResponsiveValue types and breakpoint constants; DECISIONS same date. `responsiveStyleVars` stays internal until Box. |

## 9. 1.0 criteria

- §3 catalog fully ✅, or items descoped by a logged user decision.
- TOKENS_PLAN nulls resolved by a design export — or consciously shipped on
  fallbacks, logged.
- Manual screen-reader pass (NVDA + VoiceOver) across interactive components —
  the one check that stays manual (REMAINING.md §3.2).
- API consistency sweep: `variant`/`size`/`tone`/`intent` naming coherent,
  native-attr collisions documented, no default exports, no accidental deep
  imports.
- §6 docs complete for every component; Chromatic baselines accepted.
- Breaking changes batched into the 1.0 changesets; from 1.0 on, semver is a
  promise (RELEASING.md).

---

Cross-references: [TOKENS_PLAN.md](../packages/tokens/TOKENS_PLAN.md) (token
queue) · [COMPONENT_RECIPE.md](COMPONENT_RECIPE.md) (how to build one thing) ·
[REMAINING.md](REMAINING.md) §4 (historical scope boundary — superseded by
this file for roadmap purposes) · [RELEASING.md](RELEASING.md) (shipping).
