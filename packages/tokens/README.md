# @vegam-ui/tokens

Design tokens for vegam-ui, generated from a single `tokens.json` into CSS
custom properties, SCSS variables, and JS constants. Framework-free — no React,
no runtime.

Most consumers do **not** need this package: `@vegam-ui/ui` already bundles the
CSS into its own stylesheet. Install it directly when you want to use the tokens
in your own styles, share them with a non-React surface, or read values in JS.

## Install

```bash
npm install @vegam-ui/tokens
```

## Usage

CSS custom properties (`:root`, plus the theme blocks):

```js
import '@vegam-ui/tokens/tokens.css';
```

SCSS variables:

```scss
@use '@vegam-ui/tokens/tokens.scss' as tokens;

.thing {
  padding: tokens.$ui-space-4;
}
```

JS constants — named exports, ESM and CJS both supported:

```js
import { blue500, colorActionPrimary, space4 } from '@vegam-ui/tokens';
```

```js
const { blue500 } = require('@vegam-ui/tokens');
```

## Two layers

**Primitives** are raw values with no meaning: `--ui-blue-500`, `--ui-space-4`,
`--ui-radius-md`, `--ui-font-size-3`.

**Semantic tokens** are what components consume: `--ui-color-bg-surface`,
`--ui-color-text-muted`, `--ui-color-action-primary`, `--ui-border-focus`.
Their values are `var()` references to primitives, so the layering survives into
the emitted CSS and stays inspectable in devtools.

Component CSS references semantic tokens only for anything themeable — which is
what makes dark mode a pure token remap with zero component CSS changes.

### Scales

| Group     | Tokens                                                                    |
| --------- | ------------------------------------------------------------------------- |
| Spacing   | `--ui-space-0` … `--ui-space-16`, on a 4px base                           |
| Radii     | `none`, `sm`, `md`, `lg`, `xl`, `full`                                    |
| Type      | `--ui-font-size-1` … `-7`, weights, line heights, families                |
| Elevation | `sm`, `md`, `lg`, `xl`                                                    |
| Motion    | durations `fast`/`normal`/`slow`, one standard easing                     |
| Borders   | `--ui-border-width-1`, `-2`; semantic `subtle`/`default`/`strong`/`focus` |

## Theming

The stylesheet emits three blocks:

- `:root` — primitives plus the light semantic defaults
- `[data-theme="light"]` — the semantic set re-declared, so a light region
  nested inside a dark one re-themes correctly
- `[data-theme="dark"]` — the dark remap

Each theme block also sets `color-scheme`, so native controls (scrollbars,
checkboxes, form widgets) follow the theme.

Override any token in your own CSS:

```css
:root {
  --ui-color-action-primary: #6d28d9;
}
```

## Customizing the source

Edit `src/tokens.json` and run `pnpm build`. The build asserts that every dark
override maps to an existing semantic token, so a typo fails the build instead
of shipping a variable no component reads.

## License

MIT
