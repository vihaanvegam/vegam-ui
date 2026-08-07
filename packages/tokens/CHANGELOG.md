# @vegam-ui/tokens

## 0.2.0

### Minor Changes

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
