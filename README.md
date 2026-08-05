# vegam-ui

A production React component library that works in every React framework with
zero consumer workarounds: `npm install`, one CSS import, import components.

| Package                               | What it is                                                         |
| ------------------------------------- | ------------------------------------------------------------------ |
| [`@vegam-ui/ui`](packages/ui)         | The components. ESM + CJS, dual type declarations, one stylesheet. |
| [`@vegam-ui/tokens`](packages/tokens) | Design tokens → CSS custom properties, SCSS, and JS constants.     |

Consumer documentation — install, usage, theming, overrides, the framework
support matrix — lives in [`packages/ui/README.md`](packages/ui/README.md).

## Repository layout

```
packages/ui        @vegam-ui/ui — components, theme, framework-free utils
packages/tokens    @vegam-ui/tokens — tokens.json → Style Dictionary → dist
apps/              four smoke apps that consume the BUILT tarball
docs/              context files (see below)
scripts/           release gates: smoke harness, directive check
```

## Development

```bash
pnpm install
pnpm build                              # tokens, then ui — required on a fresh clone
pnpm test                               # Vitest + Testing Library
pnpm --filter @vegam-ui/ui storybook    # component workshop on :6006
pnpm graph:serve                        # interactive relationship map on :4173
```

Run everything from the repository root. Full command reference, ports, and
when to run what: **[docs/RUNNING.md](docs/RUNNING.md)**.

### Release gates

`pnpm gates` runs all four, against the **packed tarball** rather than source —
a component library that only tested itself ships broken to consumers:

1. `attw --pack` — type resolution across `node10`, `node16` (CJS and ESM), `bundler`
2. `publint` — package layout
3. smoke — tarball npm-installed into Next.js App Router, Next.js Pages Router,
   Vite, and Remix apps; each built and typechecked
4. directive — `'use client'` on line 1 of `dist/index.js`

CI runs the same gates on every pull request.

## Documentation

| File                                                 | Purpose                                                  |
| ---------------------------------------------------- | -------------------------------------------------------- |
| [docs/RUNNING.md](docs/RUNNING.md)                   | **Start here** — every command, port, and when to run it |
| [CLAUDE.md](CLAUDE.md)                               | The constitution: locked decisions, invariants, commands |
| [docs/PROGRESS.md](docs/PROGRESS.md)                 | Current state and next action (rewritten each session)   |
| [docs/DECISIONS.md](docs/DECISIONS.md)               | Append-only log of why things are the way they are       |
| [docs/COMPONENT_RECIPE.md](docs/COMPONENT_RECIPE.md) | How to build a component, with `Button` as the reference |
| [docs/RELEASING.md](docs/RELEASING.md)               | Release flow, and how to add repository links later      |
| [docs/REMAINING.md](docs/REMAINING.md)               | What is left: blockers, gaps, deliberate omissions       |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)         | Generated relationship graphs (`pnpm graph`)             |
| [docs/graphify.html](docs/graphify.html)             | Interactive relationship map (`pnpm graph:serve`)        |

## License

MIT
