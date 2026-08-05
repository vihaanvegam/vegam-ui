# @vegam-ui — React component library monorepo

Production component library. Must work in every React framework with zero
consumer workarounds: `npm install`, one CSS import, import components.

## Session ritual (mandatory)

- Read this file, then docs/PROGRESS.md, then docs/DECISIONS.md before touching code.
- If PROGRESS.md contradicts the code, trust the code and fix the file first.
- Update PROGRESS.md + append DECISIONS.md entries BEFORE reporting a phase complete.
- Anything that costs >10 minutes to figure out gets written down immediately.
- Deviating from this file requires a DECISIONS.md entry in the same turn.
- ANY new component/util/package/token or changed import: run `pnpm graph` and
  commit its output before reporting done. CI fails on `graph:check` otherwise.
  A new top-level folder under `src/` also needs moduleIdFor/LAYER_OF updated in
  scripts/graphify.mjs — see docs/COMPONENT_RECIPE.md "Anything new?".

## Locked decisions

- TypeScript strict. Node 20+. pnpm workspaces.
- Build: Vite library mode → ESM + CJS + dual declarations (.d.ts + .d.cts).
- Styling: plain CSS, colocated per component, CSS custom properties only.
  No CSS-in-JS, no Tailwind, no runtime style engine.
- Packages: `@vegam-ui/ui` (components), `@vegam-ui/tokens` (framework-free).
- Class prefix `ui-` on every class: `ui-block`, `ui-block--modifier`, `ui-block__part`.
- Named exports only, from the single barrel `packages/ui/src/index.ts`.
- React is a peerDependency `>=18`, never a dependency. `@types/react` optional peer.
- Behaviour logic (focus trap, roving tabindex, dismissal, state machines) lives in
  framework-free TS under `utils/` — no React types there — called from hooks.
- No new dependencies without asking. No `any`, no `@ts-ignore`, no bare eslint-disable.

## Compatibility invariants (the part that usually fails)

- `types` is the FIRST key in every exports condition branch.
- Dual declarations: index.d.ts (import) + index.d.cts (require). `rollupTypes: true`.
- Root `main` / `module` / `types` kept as legacy fallbacks for old resolvers.
- Exports map includes `./styles.css` and `./package.json`.
- `"sideEffects": ["**/*.css"]`; the barrel stays side-effect-free.
- Externals: `react`, `react-dom`, `react/jsx-runtime`. `cssCodeSplit: false`.
- `'use client'` on each interactive component file — NEVER the barrel.
  rollup-preserve-directives required; verify dist/index.js line 1 after every build.
- SSR: no window/document at module scope or during render; portals guarded with
  `typeof document !== 'undefined'`; useIsomorphicLayoutEffect; IDs via `useId()` only.
- No public type may reference a devDependency type.

## Quality gates — CI fails without all four

1. `attw --pack` zero errors
2. `publint` zero errors
3. Packed tarball installed into all 4 smoke apps (next-app, next-pages, vite, remix);
   each typechecks and builds
4. dist/index.js line 1 contains `'use client'`
   Smoke apps consume the BUILT package — never source aliases.

## Tokens

`packages/tokens/src/tokens.json` → Style Dictionary → dist (.css / .js / .scss).
Two layers: primitives (`--ui-blue-500`, no meaning) and semantic
(`--ui-color-bg-surface`, what components consume). Component CSS uses semantic
tokens ONLY — never a primitive, never a literal. Dark mode is a
`[data-theme="dark"]` remap of semantic tokens; zero component CSS changes.
4px spacing base, modular type scale, named radius/elevation steps.

## Component rules (full recipe: docs/COMPONENT_RECIPE.md once Button lands)

- forwardRef to the underlying element; merge className via `cx`; spread rest props
  on the root node; extend the native prop interface.
- `variant` / `size` union types with documented defaults — never boolean flags.
- Controlled + uncontrolled where state applies. Defaults from theme defaultProps context.
- No hardcoded content, icons, or colors. Export class constants as override surface.
- Composites expose `slots` / `slotProps` — no alternative patterns.
- A11y: semantic element first; `:focus-visible` ring from the focus token; full
  keyboard per WAI-ARIA APG; `prefers-reduced-motion` on every transition;
  WCAG AA contrast; ≥44px targets on coarse pointers.
- After adding/removing/re-wiring anything: `pnpm graph` (see session ritual).
- Definition of done, all 7: types exported · ref/className/spread · zero hardcoded
  CSS values · a11y path documented · Vitest (render, each variant, interaction,
  disabled, ref) · story per variant + controls playground · JSDoc on every public prop.

## Commands

- `pnpm build` — build all packages (topological; tokens before ui)
- `pnpm gates` — build + all four release gates; run before reporting any phase done
- `pnpm check:package` — attw (excl. ./styles.css entrypoint) + publint on the tarball
- `pnpm check:directive` — dist/index.js line-1 'use client' assert
- `pnpm graph` — regenerate docs/ARCHITECTURE.md + docs/graphify.html (both
  GENERATED, never hand-edit); `graph:check` gates drift; `graph:serve` opens the map
- `pnpm smoke` — pack tarball, npm-install into the 4 apps in a temp dir, build+typecheck
- `pnpm lint` · `pnpm format:check` · `pnpm typecheck` · `pnpm test` — must be green as well
- `pnpm --filter @vegam-ui/ui storybook` — dev on :6006; `build-storybook` to verify prod
- Version pins that matter: ESLint 9 (not 10), TypeScript 5 (not 7), Style
  Dictionary 4 (not 5), Remix apps on Vite 6/React 18 — reasons in
  docs/DECISIONS.md, do not bump casually.

## Release

Changesets. `pnpm changeset` per consumer-visible change; `pnpm changeset version`
to bump + changelog; `pnpm gates` then `pnpm -r publish`. Both packages are 0.1.0
and version independently. Repository links are deliberately NOT configured —
docs/RELEASING.md section 2 has the full how-to when the remote is decided.

## Where things are

- Current state / next action: docs/PROGRESS.md (volatile, rewritten each session)
- Why things are this way: docs/DECISIONS.md (append-only; reversals supersede, never edit)
- How to run anything (commands, ports, dirs, gitignore): docs/RUNNING.md
- How to build a component: docs/COMPONENT_RECIPE.md (Button is the reference)
- How to ship: docs/RELEASING.md
- What's left / known gaps / deliberate omissions: docs/REMAINING.md
- Relationship graphs (GENERATED — never hand-edit): docs/ARCHITECTURE.md,
  docs/graphify.html (interactive); sources scripts/graphify*.mjs
