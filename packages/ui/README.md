# @vegam-ui/ui

A React component library that works in every React framework with **zero
consumer workarounds** — no patch-package, no hand-written type declarations,
no "add this to your tsconfig", no wrapper files.

- ESM **and** CJS, with dual type declarations (`.d.ts` + `.d.cts`)
- One stylesheet, themed entirely with CSS custom properties
- `'use client'` preserved for React Server Components
- SSR-safe: no `window`/`document` at module scope, portals guarded, `useId()` for ids
- React `>=18` as a peer dependency, never bundled

## Install

```bash
npm install @vegam-ui/ui
```

React 18 or 19 must already be installed. `@types/react` is an optional peer —
JavaScript consumers get no phantom warning.

## Usage

Import the stylesheet **once**, at your application root:

```tsx
import '@vegam-ui/ui/styles.css';
import { Button, Input, Stack, Text } from '@vegam-ui/ui';

export function Example() {
  return (
    <Stack gap={4}>
      <Text as="h1" size={6} weight="semibold">
        Sign in
      </Text>
      <Input aria-label="Email" placeholder="you@example.com" />
      <Button variant="primary" onClick={() => console.log('go')}>
        Continue
      </Button>
    </Stack>
  );
}
```

Every export is named — there are no default exports.

### Where the CSS import goes

| Framework            | File                                       |
| -------------------- | ------------------------------------------ |
| Next.js App Router   | `app/layout.tsx`                           |
| Next.js Pages Router | `pages/_app.tsx`                           |
| Remix                | `app/root.tsx`                             |
| Vite / CRA           | your entry (`src/main.tsx`, `src/App.tsx`) |

## Framework support

Every release is verified by installing the packed tarball into four real
applications and running their production build **and** typecheck:

| Framework                     | React | Module resolution | Status   |
| ----------------------------- | ----- | ----------------- | -------- |
| Next.js 16 — App Router (RSC) | 19    | `bundler`         | verified |
| Next.js 16 — Pages Router     | 18    | `node` (legacy)   | verified |
| Vite 8                        | 18    | `bundler`         | verified |
| Remix 2 (Vite 6)              | 18    | `bundler`         | verified |

Type resolution is additionally checked with
[`@arethetypeswrong/cli`](https://github.com/arethetypeswrong/arethetypeswrong.github.io)
across `node10`, `node16` (from CJS **and** from ESM), and `bundler`, and the
package layout with [`publint`](https://publint.dev). All four gates must pass
before a release.

### Server Components

Interactive components are client components. The published bundle carries
`'use client'` on line 1, so importing from a server component establishes a
client boundary automatically — no wrapper file needed. If you want a
component to render on the server, keep it out of the boundary yourself.

## Components

`Button` · `Input` · `Text` · `Card` · `Badge` · `Banner` · `Blanket` ·
`Breadcrumbs` · `Modal` · `Stack` · `Checkbox` · `Select`

All of them:

- forward refs to the underlying DOM element
- **merge** your `className` (never replace it) and spread remaining props onto
  the root node
- extend the native prop interface for their element
- use `variant` / `size` union types, never boolean flags
- support controlled and uncontrolled use where state applies

## Theming

### Light and dark

Set `data-theme` on any element — the semantic tokens remap in CSS, so there is
no flash on first paint and no JavaScript involved:

```html
<html data-theme="dark"></html>
```

Or scope it to a subtree with `ThemeProvider`, which renders a
`display: contents` wrapper (no layout impact) and nests freely:

```tsx
import { ThemeProvider } from '@vegam-ui/ui';

<ThemeProvider colorScheme="dark">
  <Sidebar />
  <ThemeProvider colorScheme="light">
    <Preview />
  </ThemeProvider>
</ThemeProvider>;
```

### Overriding tokens

Components read **semantic** tokens only. Override them anywhere in your CSS —
globally, or scoped to a subtree:

```css
:root {
  --ui-color-action-primary: #6d28d9;
  --ui-color-action-primary-hover: #5b21b6;
  --ui-radius-md: 0.75rem;
}

[data-theme='dark'] {
  --ui-color-action-primary: #a78bfa;
}
```

The full token list is in
[`@vegam-ui/tokens`](https://www.npmjs.com/package/@vegam-ui/tokens), which is
bundled into this package's stylesheet — you do not need to install it unless
you want the SCSS or JS exports.

### Default props

Set per-component defaults for a subtree. Only cosmetic props are supported;
explicit props always win:

```tsx
<ThemeProvider componentDefaults={{ Button: { size: 'lg' }, Card: { variant: 'elevated' } }}>
  <App />
</ThemeProvider>
```

### Overriding styles

Each component exports its class names as a documented, stable surface:

```tsx
import { buttonClasses } from '@vegam-ui/ui';

// buttonClasses.root === 'ui-button', buttonClasses.primary === 'ui-button--primary'
```

```css
.ui-button--primary {
  text-transform: uppercase;
}
```

Every class is prefixed `ui-` and follows `ui-block`, `ui-block--modifier`,
`ui-block__part`.

## Composite components: slots

Components with internal structure expose `slots` (replace a part's renderer)
and `slotProps` (merge props onto a part). `Select` is the reference:

```tsx
<Select
  options={fruit}
  slots={{
    option: ({ option, selected }) => (
      <span>
        {option.label} {selected ? '✓' : ''}
      </span>
    ),
  }}
  slotProps={{ popup: { className: 'my-popup' } }}
/>
```

`className` passed through `slotProps` is merged with the component's own
classes, never replaced.

## Accessibility

- Semantic elements first; ARIA only where the DOM cannot express intent
- Visible `:focus-visible` ring driven by the focus tokens
- Full keyboard operation, following the WAI-ARIA Authoring Practices
  (`Select` implements the select-only combobox pattern with
  `aria-activedescendant`, arrow/Home/End navigation, and label type-ahead)
- `prefers-reduced-motion` respected on every transition
- WCAG AA contrast in both color schemes
- Interactive targets reach 44px on coarse pointers. `Checkbox` is the
  documented exception: the control itself meets the 24px WCAG 2.5.8 AA
  minimum — pair it with a clickable `<label>` for a larger target.

## Known caveats

**Dual-package hazard.** If a bundler loads both the ESM and CJS copies of this
package, you get two React contexts. This is mitigated by design: theme values
travel through CSS custom properties, not React state, so colors and theming
always render correctly. The only casualty would be `componentDefaults`
configured in one module system and read in the other.

**Portal positioning.** `Select`'s popup is `position: fixed` and portals into
the nearest `[data-theme]` ancestor (so scoped themes apply), falling back to
`document.body`. If an ancestor has `transform`, `filter`, or `perspective`, it
becomes a containing block for fixed positioning and the popup may be offset —
a browser-level constraint that affects all popup libraries.

## Requirements

Node 20+ for building; any modern browser at runtime.

## License

MIT
