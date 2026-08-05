# Component recipe

The reference implementation is **Button** — `packages/ui/src/components/Button/`.
When in doubt, diff your component against it. Every rule below is visible there.

## Files — exactly these, colocated

```
components/<Name>/
  <Name>.types.ts     # prop interface + unions, JSDoc on every public member
  <Name>.css          # ui-* classes, tokens only
  <Name>.tsx          # 'use client' + implementation
  <Name>.test.tsx     # Vitest + Testing Library
  <Name>.stories.tsx  # story per variant + Playground
  index.ts            # re-exports (component, classes const, types)
```

Then register it in the ONLY public entry point, `src/index.ts` — named exports,
values and types separately. Nothing is public unless the barrel exports it.

## Types (`<Name>.types.ts`)

- `interface <Name>Props extends <Native>HTMLAttributes<HTML...Element>`.
  If a native attribute name collides (Input's `size`), `Omit` it and document
  the omission in JSDoc.
- Style axes are **union types** (`variant`, `size`, `tone`…), never booleans.
  State that is real (disabled, aria-invalid, indeterminate) rides on native
  attributes/props, not invented flags.
- JSDoc every prop, including `@default` and whether it is themeable.

## CSS (`<Name>.css`)

- Class naming: `ui-<block>`, `ui-<block>--<modifier>`, `ui-<block>__<part>`.
- Colors come ONLY from semantic tokens (`--ui-color-*`, `--ui-border-*`,
  `--ui-focus-*`) — this is what makes dark mode a pure remap. Dimensions,
  radii, type, motion, and border widths come from their token scales
  (`--ui-space-*`, `--ui-radius-*`, `--ui-font-*`, `--ui-motion-*`,
  `--ui-border-width-*`). No literal colors or dimensions anywhere; if a value
  has no token, add the token first (that is how space-11 = 44px was born).
- Interactive components need all of:
  - `:focus-visible` ring: `outline: var(--ui-focus-ring-width) solid
var(--ui-border-focus); outline-offset: var(--ui-focus-ring-offset);`
  - `@media (pointer: coarse)` → `min-height: var(--ui-space-11)` (44px).
  - `@media (prefers-reduced-motion: reduce)` → `transition: none;`
  - Hover/active guarded with `:not(:disabled)`.

## Implementation (`<Name>.tsx`)

Top to bottom, in order:

1. `'use client';` — every component file (they all call the defaults hook).
2. `export const <name>Classes = { root: 'ui-<block>', ... } as const;` —
   the documented class override surface, one key per class.
3. `forwardRef<HTML...Element, <Name>Props>(function <Name>(props, ref) {…})`
   — the named function gives the component its displayName.
4. Defaults resolve in this exact precedence:
   `explicit prop` → `useComponentDefaults('<Name>')` → built-in literal:
   `const { variant = defaults.variant ?? 'primary', ... } = props;`
   Register the component's cosmetic keys in `ThemeComponentDefaults`
   (theme/defaultProps.tsx) — cosmetic props only, never handlers, content,
   or semantics (`as` stays out).
5. Root element: `ref`, `className={cx(classes.root, classes[variant], …,
className)}` (consumer className LAST), then `{...rest}` spread.
6. JSDoc block on the component with an **Accessibility** paragraph: which
   native element and why, keyboard behavior, how state is exposed to
   assistive tech, contrast notes.

SSR rules inside components: no `window`/`document` at module scope or during
render; portals guarded with `typeof document !== 'undefined'`;
`useIsomorphicLayoutEffect`, never bare `useLayoutEffect`; ids via `useId()`.
Behaviour logic (focus trap, list navigation, dismissal, positioning) lives in
framework-free TS under `utils/` — no React types there — called from hooks.

## Tests (`<Name>.test.tsx`)

Minimum matrix (see Button.test.tsx):

- renders (correct role/element)
- built-in defaults applied
- every variant/size/tone class via `it.each`
- interaction via user-event (click AND keyboard where applicable)
- disabled: attribute present, interaction inert (N/A for presentational —
  say so in a comment)
- className merged, rest props spread
- ref forwarded to the real element (`toBeInstanceOf`)
- theme defaults honored + explicit props beating them

## Stories (`<Name>.stories.tsx`)

- `title: 'Components/<Name>'`, `component`, argTypes for every union prop.
- One story per variant, a composite story where it aids comparison (Sizes,
  Disabled), a DarkScheme story wrapped in `<ThemeProvider colorScheme="dark">`,
  and a `Playground` story driven purely by controls.

## Definition of done — all seven, no exceptions

1. Types exported from the barrel alongside the component
2. Ref forwarded, className merged, props spread
3. Zero hardcoded values in its CSS (colors: semantic tokens; dimensions: scales)
4. Keyboard and screen-reader path reasoned through and documented in JSDoc
5. Tests: render, each variant, interaction, disabled, ref — all green
6. Story per variant + controls playground
7. JSDoc on the component and every public prop

Before reporting the component done: `pnpm graph` run and its output staged,
`pnpm gates` green, `pnpm test`, `pnpm lint`, `pnpm typecheck`,
`pnpm format:check` green, and PROGRESS.md/DECISIONS.md updated.

---

## Anything new? Regenerate the graph

**Whenever you add, rename, remove, or re-wire ANYTHING in the repo, finish
with `pnpm graph` and commit what it writes.** It takes 0.13s, it derives
everything from your source, and there is nothing to update by hand. Forget it
and CI fails on `graph:check`.

"Anything" is deliberately broad — all of these change the graph:

| You added / changed                                     | What to do                            |
| ------------------------------------------------------- | ------------------------------------- |
| A component in `src/components/<Name>/`                 | `pnpm graph` — detected automatically |
| A util in `src/utils/`                                  | `pnpm graph` — detected automatically |
| An import between existing modules (a new edge)         | `pnpm graph`                          |
| An export added to or removed from the barrel           | `pnpm graph`                          |
| A package under `packages/` or `apps/`                  | `pnpm graph`                          |
| A workspace dependency between packages                 | `pnpm graph`                          |
| Tokens in `packages/tokens/src/tokens.json`             | rebuild tokens, then `pnpm graph`     |
| **A new top-level folder under `src/`** (e.g. `hooks/`) | `pnpm graph` **+ a code change** ⚠️   |

That last row is the only case needing more than the command: a new top-level
directory is unknown to `moduleIdFor` / `LAYER_OF` in
[`scripts/graphify.mjs`](../scripts/graphify.mjs), so its files land in the
wrong subgraph. Add the folder to both helpers in the same commit.

You can skip `pnpm graph` for changes that do not alter structure — a CSS
tweak, new copy, a new test, a new story. Running it anyway is harmless: if
nothing changed, nothing is rewritten.

Both outputs — `docs/ARCHITECTURE.md` and `docs/graphify.html` — are
**generated**. Never hand-edit them; your edit is erased on the next run.
See [RUNNING.md](RUNNING.md) for the full command reference.
