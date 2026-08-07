# @vegam-ui/ui

## 0.3.0

### Minor Changes

- [`b961821`](https://github.com/vihaanvegam/vegam-ui/commit/b961821cf8abb48ca5437e60fbcfcce90ebf8294) Thanks [@vihaanvegam](https://github.com/vihaanvegam)! - Phase 2 forms — seven new components plus field wiring for the existing
  controls:

  - `Field` — label/description/error wiring around exactly one control via a
    new `FieldContext` (+ public `useField()` for custom controls). Error
    presence drives `aria-invalid`; `required` renders a consumer-provided
    marker slot and sets `aria-required`. **Input, Checkbox, and Select now
    read the context automatically** (id, `aria-describedby`, `aria-invalid`,
    `aria-required`, `disabled`) — additive; explicit props always win.
  - `IconButton` — Button's square sibling, composing Button's variant classes;
    the accessible name (`aria-label` or `aria-labelledby`) is required at the
    type level. Default variant `ghost`.
  - `Textarea` — Input's multi-line sibling; `minRows`/`maxRows` opt into
    content-tracking autosize (fixed `rows` otherwise).
  - `Radio` + `RadioGroup` — native radios with a drawn appearance (checked
    ring on the `border-width.selected` token; forced-colors falls back to
    native); the group owns selection (controlled/uncontrolled), name, size,
    and disabled.
  - `Switch` — a native checkbox with `role="switch"`, track/thumb drawn on
    the input from the `size.switch-track-*` tokens.
  - `Slider` — APG slider: drag via new framework-free `utils/drag.ts`
    (pointer capture), keyboard steps, step snapping, hidden form input via
    `name`, component-custom-property geometry. Widget ARIA
    (`aria-valuetext`, `aria-errormessage`, and the label/description props)
    is routed to the `role="slider"` thumb; the ref forwards there too, while
    everything else spreads on the root. `aria-orientation` is omitted from the
    props — this slider is horizontal-only. A wrapping Field's `required` is
    deliberately not forwarded, since `aria-required` is unsupported on the
    `slider` role.

  New `componentDefaults` keys: `IconButton` (variant, size), `Textarea`
  (size), `Radio` (size).

- [`b961821`](https://github.com/vihaanvegam/vegam-ui/commit/b961821cf8abb48ca5437e60fbcfcce90ebf8294) Thanks [@vihaanvegam](https://github.com/vihaanvegam)! - Phase 4 navigation & data — seven new components, completing the committed
  catalog:

  - `Tabs` — APG tabs with roving tabindex, wrapping arrows, and
    `automatic`/`manual` activation; items carry their own panel content.
  - `Link` — real anchors with `slots.anchor` for router integration;
    `external` pairs a safe `target`/`rel` with a required, announced
    `newTabLabel`.
  - `Pagination` — `<nav>` landmark composed from Button/IconButton, with
    `aria-current="page"`, inert ellipses, and an exported `paginationRange`.
  - `Accordion` — disclosure sections at a configurable heading level, single
    or `multiple`; collapsed panels unmount.
  - `Avatar` — image with initials fallback (grapheme-safe via
    `Intl.Segmenter`) and automatic fallback on image error.
  - `Chip` — this library's Tag: static, activatable (`aria-pressed`), and/or
    removable; an activatable+removable chip renders sibling buttons rather
    than invalid nested ones.
  - `Table` — semantic data table with `slots.headerCell`/`slots.cell`,
    `aria-sort` reporting, sticky header, and empty state. **ui never sorts
    data** — it reports intent via `onSortChange`.

  Also: roving tabindex is now the shared `useRovingFocus` hook, which Menu
  adopts too, and `nextEnabledIndex` gained an opt-in `loop`. New
  `componentDefaults` keys: `Tabs` (orientation, activation), `Link` (variant),
  `Avatar` (size, shape), `Chip` (tone, size).

- [`b961821`](https://github.com/vihaanvegam/vegam-ui/commit/b961821cf8abb48ca5437e60fbcfcce90ebf8294) Thanks [@vihaanvegam](https://github.com/vihaanvegam)! - Add the public hooks layer and responsive foundations (BLUEPRINT Phase 0):

  - New hooks: `useControlled` (controlled/uncontrolled prop pairs),
    `useMediaQuery` and `useBreakpoint` (SSR-safe via `useSyncExternalStore`;
    server snapshots `false`/`'base'`), `useDismiss` (Escape + outside-pointer
    light dismiss), and `useTransitionState` (enter/exit mount states for CSS
    transitions, honoring `prefers-reduced-motion`).
  - New exports: `breakpointWidths`, `breakpointOrder`, and the `Breakpoint`,
    `ResponsiveValue`, `ResponsiveObject`, `UseDismissOptions`,
    `TransitionState`, and `UseTransitionStateResult` types.
  - Select and Breadcrumbs now use the shared hooks internally — behavior
    unchanged, with one deliberate nuance: an outside `pointerdown` whose
    `defaultPrevented` is set no longer closes Select's popup (events claimed
    by other UI never dismiss).
  - Storybook docs: autodocs prop tables generated from the TypeScript types,
    plus Getting Started and Theming guide pages (docs-only; no runtime
    change).

- [`b961821`](https://github.com/vihaanvegam/vegam-ui/commit/b961821cf8abb48ca5437e60fbcfcce90ebf8294) Thanks [@vihaanvegam](https://github.com/vihaanvegam)! - Phase 1 layout primitives — five new components:

  - `Box` — token-typed style primitive: padding/margin (side > axis > all
    precedence), `bg`, `radius`, `borderColor` (hairline border), `shadow`,
    polymorphic `as`; every prop responsive via per-breakpoint custom
    properties consumed by static CSS. Deliberately not an `sx` escape hatch.
  - `Flex` — full flexbox container surface (`direction`, `wrap`, `align`,
    `justify`, `gap`, all responsive) plus flex-item props
    (`grow`/`shrink`/`basis`). Stack remains the simple one-axis primitive.
  - `Grid` — responsive equal-width `columns` with token `gap`/`rowGap`/
    `columnGap`.
  - `Container` — centered page shell: `size` caps at the viewport tier's
    `content-max`; inline padding follows the current breakpoint's
    `viewport.*.margin`.
  - `Divider` — themed hairline rule; horizontal `<hr>` or vertical
    `role="separator"`; tones `subtle`/`default`/`accent`.

  Also public: the token scale constants/types (`spaceSteps`, `radiusSteps`,
  `surfaceKeys`, `borderColorKeys`, `elevationSteps`, `dividerTones` and their
  union types). `ResponsiveObject` keys are now all optional — sparse objects
  like `{ tablet: 4 }` apply from that bound upward. New `componentDefaults`
  keys: `Flex.gap`, `Grid.gap`, `Container.size`, `Divider.tone`.

- [`b961821`](https://github.com/vihaanvegam/vegam-ui/commit/b961821cf8abb48ca5437e60fbcfcce90ebf8294) Thanks [@vihaanvegam](https://github.com/vihaanvegam)! - Migrate to the Aug-2026 token export (breaking — pre-1.0 minor per version policy).

  **@vegam-ui/tokens**: the semantic tree moves from `web/mobile × light/dark`
  blocks to four tiers — `theme.<scheme>`, `platform.<web|mobile>`,
  `viewport.*`, `component.*` — and the build emits `:root` +
  `[data-theme="light"|"dark"]` + `[data-platform="web"|"mobile"]`, with
  variant-named aliases re-declared per axis so scoped theme/platform wrappers
  resolve correctly. New tokens: full z scale, per-scheme composed elevation
  shadows, enter/exit/linear easings, blur, viewport grid values, component
  aliases, platform sizes/typography, filled feedback intents, mono font,
  focus ring width/offset. Removed: `font.line-height.*` ratio scale,
  `border-width.focus`, `size.icon-xs`, `size.pill-s` (now `pill-sm`).
  Renamed text semantics: `--ui-color-text-primary/secondary/tertiary` are now
  `--ui-color-text-*-standard/-high` pairs selected per platform as
  `--ui-text-primary/secondary/tertiary`. The grey, blue, and yellow ramps were
  redrawn, and radius md/lg/xl grew one step — rendered output changes visibly.

  **@vegam-ui/ui**: component CSS consumes the new names (platform-selected
  text colors, real focus-ring/easing/elevation/blur tokens instead of
  fallbacks, layered z: scrim 400 / modal 500 / select popup 600) and the
  rebuilt stylesheet inlines the new token CSS. No component API changes.

- [`b961821`](https://github.com/vihaanvegam/vegam-ui/commit/b961821cf8abb48ca5437e60fbcfcce90ebf8294) Thanks [@vihaanvegam](https://github.com/vihaanvegam)! - Phase 3 overlays & feedback — eight new components:

  - `Tooltip` — hover/focus text hint; `role="tooltip"` wired to the trigger
    via `aria-describedby`, hover delay from the tooltip-delay token, focus
    opens immediately, Escape dismisses.
  - `Popover` — non-modal anchored `role="dialog"` surface for interactive
    content; focus moves in on open and returns to the trigger on close.
  - `Menu` — APG menu-button with roving focus, type-ahead, and `slots.item`
    for router links (no ref forwarding needed — items are located by role).
  - `Drawer` — edge-anchored modal panel reusing Modal's scrim, focus trap and
    scroll lock, with `placement` and slide transitions.
  - `ToastProvider` + `useToast()` — queue with polite/assertive live regions
    by intent, auto-dismiss that pauses on hover and focus-within, action and
    close slots.
  - `Spinner`, `Progress` (determinate + indeterminate), `Skeleton` — feedback
    primitives; all motion honors `prefers-reduced-motion`.

  Also public: `computeAnchoredPlacement` side/align/flip/shift positioning
  behind the anchored overlays, and the `Side`/`Align` types. New
  `componentDefaults` keys: `Drawer` (placement, size), `Progress` (size,
  tone), `Skeleton` (variant), `Spinner` (size).

## 0.2.0

### Minor Changes

- [`37b72cf`](https://github.com/vihaanvegam/vegam-ui/commit/37b72cf9f6dc786c56b9b21848b1b618d4712ef0) Thanks [@vihaanvegam](https://github.com/vihaanvegam)! - Add `Banner` — an intent-colored inline status message (info | success |
  warning | danger) with title, optional description, consumer-provided icon
  and actions, and an optional accessible close button (`onClose` +
  `closeLabel`). Ships `bannerClasses`, `slotProps` for every internal part,
  theme-defaultable `intent`, and `role="status"` / `role="alert"` live-region
  semantics by intent.

- [`37b72cf`](https://github.com/vihaanvegam/vegam-ui/commit/37b72cf9f6dc786c56b9b21848b1b618d4712ef0) Thanks [@vihaanvegam](https://github.com/vihaanvegam)! - Add `Breadcrumbs`, `Modal`, and `Blanket`. Breadcrumbs renders a trail from
  `items` data with a collapsible middle (overflow trigger), per-item icons,
  opt-in label truncation, and a `slots.link` render prop for router links.
  Modal is a controlled dialog (sizes sm–fullscreen, appearance icon tints,
  consumer footer/icon) with focus trap, scroll lock, Escape/blanket/close
  dismissal, focus restore, and theme-scoped portaling. Blanket — the scrim
  Modal composes — is also exported standalone. Ships `breadcrumbsClasses`,
  `modalClasses`, `blanketClasses`, full `slotProps` surfaces, and
  theme-defaultable `Modal.size`/`Modal.appearance`.

## 0.1.0

### Minor Changes

- Initial release.

  `@vegam-ui/tokens`: design tokens generated from a single `tokens.json` into CSS
  custom properties, SCSS variables, and dual ESM/CJS JS constants. Two layers —
  primitives and semantic tokens — with dark mode as a `[data-theme="dark"]` remap.

  `@vegam-ui/ui`: `Button`, `Input`, `Text`, `Card`, `Badge`, `Stack`, `Checkbox`,
  and `Select`, plus `ThemeProvider`, `useComponentDefaults`, and `cx`. ESM + CJS
  with dual type declarations, one stylesheet, `'use client'` preserved, verified
  against Next.js (App and Pages Router), Vite, and Remix.
