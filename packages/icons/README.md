# @vegam-ui/icons

The vegam-ui icon set: one tree-shakeable React component per glyph, generated
from the Figma library. No stylesheet, no runtime dependencies, and no
`'use client'` — icons render straight from a React Server Component.

Independent of `@vegam-ui/ui`: components never import an icon at runtime, so
you can take the icons without the library, or the library without the icons.

## Install

```bash
npm install @vegam-ui/icons
```

React `>=18` is the only peer dependency. There is nothing to import for
styling.

## Usage

```tsx
import { IconSearch } from '@vegam-ui/icons';

<IconSearch />;
```

Every icon takes the same two props on top of the native `SVGProps<SVGSVGElement>`:

| Prop    | Type                                                         | Default     | Description                                  |
| ------- | ------------------------------------------------------------ | ----------- | -------------------------------------------- |
| `size`  | `'xxs' \| 'sm' \| 'md' \| 'lg' \| 'xxl' \| 'xl'` or `number` | `'1em'`     | Named token step, or a number treated as px. |
| `title` | `string`                                                     | `undefined` | Accessible name; omit to keep it decorative. |

`className`, `style`, `data-*`, event handlers and a `ref` to the `<svg>` all
work as usual.

### Sizing

Omit `size` and the icon is `1em`, so it follows the surrounding font size.
Named steps map to the `size.icon-*` tokens — **note the ramp is not
alphabetical**, `xxl` (28px) sits between `lg` (24px) and `xl` (32px):

| Step | `xxs` | `sm` | `md` | `lg` | `xxl` | `xl` |
| ---- | ----- | ---- | ---- | ---- | ----- | ---- |
| Size | 12px  | 16px | 20px | 24px | 28px  | 32px |

Each step resolves to the token `var()` with the token's own value baked in as
a fallback, so icons size correctly even without `@vegam-ui/tokens` loaded.

```tsx
<IconSearch size="md" /> // 20px via --ui-size-icon-md
<IconSearch size={18} /> // 18px
```

### Colour

There is no `color` prop — glyphs paint with `currentColor`, so set CSS `color`
on the icon or any ancestor. The theme ships `--ui-color-icon-default`,
`--ui-color-icon-subtle` and `--ui-color-icon-disabled`, all of which remap in
dark mode.

### Accessibility

Icons are **decorative by default** (`aria-hidden="true"`), which is correct
whenever a visible label already says the same thing:

```tsx
<Button>
  <IconAdd /> Add item
</Button>
```

For an icon-only control, the name belongs to the control:

```tsx
<IconButton aria-label="Delete">
  <IconDelete />
</IconButton>
```

When the icon is the only carrier of the meaning, name it — that switches it to
`role="img"` with a `<title>`:

```tsx
<IconWarning title="Validation failed" />
```

An `aria-label` or `aria-labelledby` you pass yourself is honoured the same way.

### Server components

No directive, no hooks, no context, no browser globals. Rendering an icon in a
Next.js App Router layout or page keeps it on the server. This is enforced by
release gates, not just documented: the built bundles are asserted to contain
no `'use client'`, and a smoke app renders an icon from its root layout.

### Custom icons

`createIcon` is exported so a project glyph behaves exactly like a shipped one:

```tsx
import { createIcon } from '@vegam-ui/icons';

export const IconSparkle = createIcon(
  'IconSparkle',
  '0 0 16 16',
  <path d="M8 1 L10 6 15 8 10 10 8 15 6 10 1 8 6 6Z" fill="currentColor" />,
);
```

Paint with `currentColor` and keep the artwork free of `id` attributes — ids
would collide as soon as the icon rendered twice on a page.

## Maintaining the set

`svg/` holds the exports from the Figma library and is design-owned: it arrives
by export and is never hand-edited. Everything under `src/icons/`, plus
`src/index.ts`, `src/sizes.ts` and `manifest.json`, is generated from it.

```bash
pnpm icons:import        # report what is still un-exported, print the snippet
pnpm icons:import x.json # write svg/ from a Desktop Bridge export payload
pnpm icons               # regenerate the components from svg/
pnpm icons:check         # CI gate: fail if the generated output has drifted
```

Both the sources and the generated output are committed, so the code can never
silently disagree with the design file. `figma-nodes.json` records which Figma
node each icon came from.

## License

MIT
