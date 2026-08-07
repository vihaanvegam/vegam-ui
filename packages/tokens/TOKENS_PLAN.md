# Token plan — tracking the design export (`src/tokens.json` is read-only)

Created 2026-08-06 with [docs/BLUEPRINT.md](../../docs/BLUEPRINT.md); rewritten
the same day after the **Aug-2026 export** landed and the code migrated to it
(DECISIONS.md 2026-08-06 "Token schema migration").

`src/tokens.json` is the design system's export, reproduced verbatim. **Never
edit it in this repo** — changes happen in the design source and arrive as a
fresh export. It is also in `.prettierignore` for the same reason: formatting
must not fight the next export. This file is the request queue for that export
and the code-side contract for what happens when it lands (§5).

## 1. Inventory — the Aug-2026 export

Four tiers (emission details in [build.js](build.js)):

| Tier       | Shape                                                               | Emitted as                                                                                  |
| ---------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| primitives | everything not below                                                | `:root`, full path (`--ui-grey-500`, `--ui-z-modal`, `--ui-viewport-*`, `--ui-component-*`) |
| `theme`    | `theme.<light\|dark>.{color,elevation}`                             | variant-relative names in `:root` + `[data-theme="light"\|"dark"]`                          |
| `platform` | `platform.<web\|mobile>.{size,icon,spacing,typography,radius,text}` | variant-relative names in `:root` + `[data-platform="web"\|"mobile"]`                       |
| aliases    | `viewport.*`, `component.*` and any `{theme.x}`/`{platform.x}` ref  | full path; re-declared in every block of every axis the ref chain reaches                   |

Primitive groups: 10 color ramps (grey/blue/yellow **redrawn Aug 2026**) ·
space (0–24 incl. sub-grid 0.5/1.5/2.5; **11 still null**) · radius (…xxl,
xxxl) · border-width (hairline/thick/selected/icon — `focus` was renamed into
`focus.ring-width`) · font (sans + mono; sizes xxs–display; weights) ·
z (base/raised/sticky/dropdown/drawer/overlay/modal/popover/toast/tooltip) ·
elevation geometry (sm–xl offset/blur/spread) · motion (5 durations; standard/
enter/exit/linear easings) · focus (ring-width 3px, ring-offset 2px) · size
(controls, icons xxs–xxl, switch tracks, pills, dot) · opacity · breakpoint
(mobile…wide) · blur.

Theme semantic groups (per scheme): text (standard/high contrast pairs +
disabled/placeholder/on-accent) · border · surface · cards (⚠ §4) · divider
(⚠ §4) · **feedback — filled: 6 intents × strong/subtle/fg** · icon · action
(6 intents × 7 roles) · focus.ring · **elevation (composed shadows, dark
alphas 32–64%)**.

## 2. The old request list — status

| Requested (pre-Aug-2026)              | Status                                                                                                                                                           |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| focus.ring-width / ring-offset        | ✅ 3px / 2px (library's 3px kept over Figma's 2px note)                                                                                                          |
| space.11 (44px)                       | ❌ **still null** — code keeps `var(--ui-space-11, var(--ui-space-12))`; `platform.mobile.size.touch-target-min` (2.75rem) now exists as the design's own answer |
| z scale                               | ✅ full 10-step scale                                                                                                                                            |
| motion.easing.standard / enter / exit | ✅ + bonus `linear` for continuous motion                                                                                                                        |
| motion.duration.slow                  | ✅ 300ms                                                                                                                                                         |
| elevation ramp + dark answer          | ✅ geometry primitives + composed per-scheme shadows                                                                                                             |
| font.family.mono                      | ✅ Roboto Mono                                                                                                                                                   |
| feedback.\* (32 nulls)                | ✅ filled and extended (neutral, tag, `-fg` pairs) — component adoption queued (§3)                                                                              |
| container max-widths                  | ✅ as `viewport.<bp>.content-max`                                                                                                                                |
| color.surface.skeleton                | still optional — decide at Skeleton build time (surface.subtle may suffice)                                                                                      |

## 3. Open queue

**For the design source (next export):**

1. `space.11` — the last null. Either fill (2.75rem) or formally drop it in
   favor of `platform.*.size.touch-target-min`; code then swaps its one
   fallback chain.
2. **z.dropdown (200) sits below z.modal (500)** — a dropdown portaled out of
   a modal's DOM cannot use its own layer. Code uses z.popover (600, "can
   open from inside a modal") for the Select popup meanwhile. Either raise
   dropdown above modal or bless the popover assignment.
3. `blur.standard` carries a copy-pasted breakpoint comment.
4. §4 data errors below.
5. **`color.surface.inverse` (+ a matching `text.on-inverse`)** — requested
   2026-08-07 for Tooltip. The classic tooltip is an inverted bubble (dark
   chip on a light page, light chip on a dark page), which needs a surface
   that flips WITH the scheme. There is no such token, and component CSS may
   not reach for a raw grey, so Tooltip currently renders as a small
   elevated `surface.page` card with a hairline border. That reads fine and
   is a pure dark-mode remap — but if design wants the inverted look, this
   pair is what it takes.
6. `color.surface.skeleton` — still optional (§2). Skeleton currently uses
   `surface.disabled` as the base with `surface.subtle` as the shimmer band;
   revisit only if design wants a dedicated placeholder colour.

**For the code (no export needed):**

- Move Banner/Badge/Text intent colors from `action.*` soft pairs onto the
  now-filled `feedback.*` names — byte-identical values today, rename-only;
  batch with a future component change.
- Exporting token key unions from the JS build (so Box's token-typed props can
  derive instead of being hand-written) — decide when Box lands (BLUEPRINT §4).

### 1.0 reconciliation (2026-08-07)

BLUEPRINT §9 requires the nulls to be "resolved by a design export — or
consciously shipped on fallbacks, logged". This is that log.

**Verified against the export**: exactly **one** null value remains in
`tokens.json` — `space.11`. Every other placeholder the Aug-2026 export
arrived with has been filled.

`space.11` is **consciously shipped on its fallback**. Its single use is a
`var(--ui-space-11, var(--ui-space-12))` chain, so the value resolves today and
resolves to the intended 44px the moment design fills it — nothing in the
library is waiting on it, and no consumer can observe the difference.

Everything else in this section is an **enhancement request or a rename**, not
a gap: `color.surface.inverse` would let Tooltip take the classic inverted
look (it renders correctly without it), `color.surface.skeleton` is optional,
the `feedback.*` migration is byte-identical today, and `z.dropdown` is a
design question whose current answer (`z.popover` for the Select popup) is
correct behaviour. None of them block 1.0; all of them stay queued for the
next export.

## 4. Known data errors in the export — still present (owner: fix later, 2026-08-06)

1. **`cards.background` is inverted**: `{grey.900}` in light, `{grey.100}` in
   dark (whole group likewise). Components keep using `surface.page`.
2. **`divider.strong` is `{red.500}`/`{red.300}`** among grey siblings.
   Components keep using `border.hover` for strong borders.

When a corrected export lands, decide whether components adopt the fixed
`cards.*` / `divider.strong` and log it.

## 5. When a new export arrives — the procedure

1. Replace `src/tokens.json` wholesale. Verbatim file, no local edits.
2. `pnpm --filter @vegam-ui/tokens build`. The build asserts theme.light ↔
   theme.dark and platform.web ↔ platform.mobile declare identical sets, and
   re-points variant-named references (`{theme.light.x}` → relative var) —
   see build.js's header, including the custom-property substitution subtlety
   that makes the per-axis re-declarations necessary.
3. A NEW tier or a rename of `theme`/`platform`/scheme/platform keys requires
   a build.js update (SCHEMES/PLATFORMS/relativePath).
4. Verify in the Storybook token gallery (reads the shipped CSS at runtime)
   plus one DarkScheme story.
5. `pnpm graph` (token edges), `pnpm gates`.
6. Version per RELEASING.md: renames/removals/value changes are breaking
   (minor while 0.x, majors after 1.0); ship a ui release alongside — the
   inlined CSS only refreshes when ui rebuilds. Chromatic baselines need
   re-acceptance when values change.
7. Update §1–§4 here, PROGRESS.md, and changesets for both packages.
