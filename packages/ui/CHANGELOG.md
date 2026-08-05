# @vegam-ui/ui

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
