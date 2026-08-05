# @vegam-ui/ui

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
