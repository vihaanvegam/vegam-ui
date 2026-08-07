# @vegam-ui/icons

## 0.1.0

### Minor Changes

- [`b961821`](https://github.com/vihaanvegam/vegam-ui/commit/b961821cf8abb48ca5437e60fbcfcce90ebf8294) Thanks [@vihaanvegam](https://github.com/vihaanvegam)! - Initial release of `@vegam-ui/icons` — the drawn icon set from the Figma
  library as one tree-shakeable React component per glyph.

  - **Uniform API.** Every icon is a call to the exported `createIcon` factory,
    so sizing, the accessibility switch, ref forwarding and class merging are
    defined exactly once. `size` takes a named step from the `size.icon-*` ramp
    (`xxs` 12 · `sm` 16 · `md` 20 · `lg` 24 · `xxl` 28 · `xl` 32 — deliberately
    not alphabetical) or a number in px, and defaults to `1em` so an icon
    follows the text around it. Named steps resolve to the token `var()` with
    the token's own value baked in as a fallback, so icons size correctly even
    without `@vegam-ui/tokens` loaded.
  - **Accessible by default.** Icons ship `aria-hidden="true"`, which is right
    whenever a visible label already carries the meaning. Passing `title` — or
    an `aria-label`/`aria-labelledby` of your own — switches them to
    `role="img"` with that accessible name.
  - **Server-component safe.** No `'use client'`, no hooks, no context, no
    browser globals, so icons render straight from an RSC. Enforced by gates
    rather than asserted: `check:directive` fails if the built bundles contain
    the directive, and the Next.js App Router smoke app renders an icon from its
    root layout.
  - **Colour via `currentColor`.** No `color` prop; set CSS `color` or use the
    `--ui-color-icon-*` theme tokens, which remap in dark mode.
  - **Zero dependencies**, no stylesheet, `sideEffects: false`, ESM + CJS with
    dual type declarations — the same packaging standard as `@vegam-ui/ui`.

  The components are generated from committed Figma exports in
  `packages/icons/svg/` by a zero-dependency codegen script; `pnpm icons:check`
  gates the two against drift so the code cannot silently disagree with the
  design file.
