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

### Which axis name (settled by the 1.0 API sweep, 2026-08-07)

The four axis names are not interchangeable; each says something different
about what the value does. Picking the wrong one is the kind of inconsistency
that is free to fix now and breaking to fix after 1.0.

| Name      | Means                                                      | Used by                                                                                                           |
| --------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `size`    | Scale — type, padding, control height, together            | Avatar, Button, Checkbox, Chip, Container, Drawer, Input, Modal, Progress, Radio, Select, Spinner, Text, Textarea |
| `variant` | **Structural / visual treatment.** Not a status.           | Button, Card, Link, Skeleton                                                                                      |
| `tone`    | **Colour treatment carrying no behaviour.** Purely visual. | Badge, Chip, Divider, Progress, Text                                                                              |
| `intent`  | **Status that also changes ARIA semantics.**               | Banner, Toast                                                                                                     |

The `tone` / `intent` split is the one that matters: `intent` is reserved for
components where the value changes **behaviour**, not just paint. Banner and
Toast both map `info`/`success` → `role="status"` (polite) and
`warning`/`danger` → `role="alert"` (assertive). If a new component's status
axis only tints, it is `tone`.

Two deliberate exceptions, both logged rather than "fixed":

- **`Button.variant` includes `danger`.** A status value on a structural axis,
  because a destructive button is one visual treatment among four rather than
  a separate colour dimension. Every library does this; splitting it would
  make the common case worse.
- **`Modal.appearance`** (`default | warning | danger`) tints **only the header
  icon slot** — it is neither whole-component colour (`tone`) nor live-region
  behaviour (`intent`). The name mirrors the Figma component's own
  "Appearance" axis, which is worth more than local consistency here. Do not
  copy it to a new component; use `tone`.

Other 1.0 sweep results, all clean: no default exports anywhere in `src`; the
exports map admits only `.`, `./styles.css`, and `./package.json`, so deep
imports are impossible (attw and publint gate it); and every native-attribute
collision is `Omit`-ed with the reason in JSDoc — `Input.size`,
`Checkbox.type`/`size`, `Banner.title`, `Modal.title`, and
`Select.value`/`defaultValue`/`onChange`.

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

## Hooks, responsive & motion (Phase 0 conventions, 2026-08-07)

### The hooks layer

- `src/hooks/` is React glue only: `'use client'` on every file; hooks may
  import `utils/`, never the reverse. Layering (visible in `pnpm graph`):
  `utils ← hooks ← (theme, components) ← barrel`.
- Framework-free behaviour still lives in `utils/` and the hook wraps it —
  `utils/dismiss.ts` under `useDismiss` is the model, `focusTrap` the
  precedent. Write the pure part first, test it framework-free.
- Any controlled+uncontrolled prop pair goes through
  `useControlled(prop, defaultProp)` — never hand-roll `value !== undefined`
  again (Select and Breadcrumbs are the refactored references). Change sites:
  `if (!isControlled) setUncontrolled(next); onChange?.(next);`
- Light dismissal (Escape + outside pointer) is `useDismiss`. Components that
  handle Escape in their own keydown (Select's combobox) pass `escape: false`.
  Dismissal skips `defaultPrevented` events, so nested surfaces claim their
  Escape first.

### Breakpoints (§8.1, DECISIONS 2026-08-07)

- The four bounds exist in exactly two forms: `utils/breakpoints.ts` (the
  single JS home — drift-tested against tokens.json) and annotated rem
  literals in CSS. Custom properties are invalid inside media queries; that
  is the entire deviation.
- CSS media queries always name the token in a comment:
  ```css
  @media (min-width: 48rem) {
    /* --ui-breakpoint-tablet */
  }
  ```
  Never write an unannotated breakpoint literal.
- JS reads `breakpointWidths`, `useBreakpoint()` (returns
  `'base' | 'tablet' | 'laptop' | 'desktop' | 'wide'`), or
  `useMediaQuery(query)`. Server snapshots are `'base'`/`false`
  (mobile-first, hydration-safe) — prefer CSS media queries for purely visual
  differences; hooks are for behaviour branches.

### Responsive props

- A prop that varies by breakpoint is typed `ResponsiveValue<T>`: a scalar,
  or `{ base?, tablet?, laptop?, desktop?, wide? }` — every key optional, a
  value applies from its bound upward, and omitting `base` means the prop
  does not apply below the narrowest key (`{ tablet: 4 }` = "from tablet
  up").
- Resolution is a map lookup, never a style engine:
  `responsiveStyleVars('--ui-<block>-<prop>', value, toCss)`
  (`utils/responsive.ts`, internal) emits per-breakpoint custom properties on
  the root `style`; static CSS consumes them with a fallback chain:
  ```css
  .ui-box {
    padding: var(--ui-box-p-base, 0);
  }
  @media (min-width: 48rem) {
    /* --ui-breakpoint-tablet */
    .ui-box {
      padding: var(--ui-box-p-tablet, var(--ui-box-p-base, 0));
    }
  }
  /* laptop falls back tablet → base, and so on up the ramp */
  ```
  First real adopter is Phase 1 Box/Grid; export the helper from the barrel
  only if consumers turn out to need it.

### Motion

- Durations and easings come from motion tokens — never a literal:
  `transition: opacity var(--ui-motion-duration-fast) var(--ui-motion-easing-standard);`
  Ramp: instant(100) · fast(150) · normal(200) · slow(300); easings:
  `standard` (state changes), `enter` (decelerate in), `exit` (accelerate
  out), `linear` (continuous motion only).
- Every transition stays behind the recipe's
  `prefers-reduced-motion: reduce → transition: none` guard.
- Surfaces that mount/unmount (overlays, toasts) drive enter/exit with
  `useTransitionState(open, durationMs)`: render while `mounted`, put `state`
  on the root as `data-state`, key CSS off
  `[data-state='entering' | 'entered' | 'exiting']`. `durationMs` is the ms
  value of the SAME motion token the CSS uses (the hook cannot read the
  stylesheet). Reduced motion snaps to the end state in JS and CSS both.

### New-component conventions (BLUEPRINT §5, binding from Phase 1)

- **Logical properties in all new CSS**: `padding-inline-start`,
  `margin-block-end`, `inset-inline-end`, `inline-size`, … so RTL becomes a
  `dir` attribute, not a rewrite. Physical prop NAMES (`pl`, `pr`) map to
  logical properties (`pl` = inline-start = left in LTR). Retrofitting the
  pre-blueprint 12 is Tier-Later.
  - **The one exception: glyphs drawn with borders + `transform`.**
    `transform: rotate()`/`translateX()` are direction-AGNOSTIC — they do not
    flip under `dir="rtl"`. Pairing them with logical borders mirrors the
    glyph out from under its own rotation, turning a horizontal arrow
    vertical (this shipped in three components before review caught it, and
    Toast's centring before that). So: draw such glyphs with PHYSICAL borders
    (`border-right`/`border-bottom`) to match the physical transform, and add
    an explicit `[dir='rtl']` rule ONLY where the glyph carries direction —
    a left/right chevron needs one, an up/down caret does not. Same for
    centring: `left: 50%` + `translateX(-50%)`, never `inset-inline-start`.
- **Token-typed props** use the shared scales in `utils/tokenScales.ts`
  (spaceSteps/radiusSteps/surfaceKeys/…, each drift-tested against
  tokens.json). Never re-declare a scale union locally.
- **No module-level mutable state**, ever — dual-package hazard.
- **Never emit state from an effect.** Selection, expansion, and dismissal
  are USER ACTIONS: call the consumer's callback from the event handler that
  caused them. An effect whose guard is "state does not match intent" can
  never settle against a controlled owner that declines the change — and
  since `items`/`onChange` are fresh identities under ordinary inline usage,
  it re-fires on every render (Tabs, 2026-08-07: "Maximum update depth
  exceeded"). Memoising is not a fix; a library cannot require consumers to
  `useCallback` every handler. If an effect genuinely must emit, guard it
  with a ref recording what it last acted on.
- **Derive selection; never store it alone.** Reconcile a stored value
  against the CURRENT items every render — items arrive asynchronously, get
  filtered away, or become disabled. Fall back to the first enabled item;
  that is display-only and must not call `onChange`, so a controlled owner is
  not fought. Without it a widget can end up with no selection, no panel, and
  no tab stop at all.
- **Roving tabindex** is `hooks/useRovingFocus` (Menu, Tabs) — do not write a
  second implementation. Native-input groups (RadioGroup) already get roving
  from the platform and must NOT layer it on top.
- **Dimensions with no token** become component custom properties
  (`--ui-<block>-*`, Modal-sizes precedent); reusable values get REQUESTED in
  TOKENS_PLAN.md instead.
- **Overlay checklist** (Phase 3+): portal to nearest `[data-theme]` ·
  positioning via `utils/positioning` · dismissal via `useDismiss` · focus
  trap + scroll lock only for modal surfaces · z via `var(--ui-z-*)`.
- **Every new component ships with**: entry in `src/test/a11y.test.tsx`
  (axe) · keyboard tests where interactive · DarkScheme story · an MDX doc
  page (Button.mdx is the template) · `ThemeComponentDefaults` registration
  when it has cosmetic axes · a changeset · `pnpm graph`.

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
