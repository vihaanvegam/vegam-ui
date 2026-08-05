# Contributing to @vegam-ui

## Getting started

```bash
pnpm install
pnpm build          # required on first run — tokens must exist before ui builds
```

Requirements: Node 20+, pnpm (the repo pins 11.17.0 via `packageManager`).

## Where things are

| You want to…                   | Read                                                     |
| ------------------------------ | -------------------------------------------------------- |
| Add or modify a component      | [docs/COMPONENT_RECIPE.md](docs/COMPONENT_RECIPE.md)     |
| Run commands, start Storybook  | [docs/RUNNING.md](docs/RUNNING.md)                       |
| Understand the architecture    | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) (generated) |
| Explore the module graph       | `pnpm graph:serve` → http://localhost:4173/graphify.html |
| Ship a release                 | [docs/RELEASING.md](docs/RELEASING.md)                   |
| Know why something is this way | [docs/DECISIONS.md](docs/DECISIONS.md)                   |
| See what's left / not built    | [docs/REMAINING.md](docs/REMAINING.md)                   |
| Session context (volatile)     | [docs/PROGRESS.md](docs/PROGRESS.md)                     |

## Workflow

1. **Start Storybook** — `pnpm --filter @vegam-ui/ui storybook` (port 6006)
2. **Edit source** — components live in `packages/ui/src/components/<Name>/`
3. **Run tests** — `pnpm test`
4. **Regenerate graphs** — `pnpm graph` if you added/removed/rewired anything
5. **Before committing** — `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test`

The pre-commit hook runs lint-staged automatically; tests and typecheck are yours to run.

## Adding a component

Follow [COMPONENT_RECIPE.md](docs/COMPONENT_RECIPE.md) exactly — Button is the reference.
Every component needs all seven items in its "Definition of done" checklist.

After adding or changing anything: `pnpm graph` and commit the output. CI fails otherwise.

## Commit messages

Use conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`.

For consumer-visible changes, also run `pnpm changeset` to record a release note.

## Before opening a PR

```bash
pnpm gates   # build + attw + publint + directive + smoke (~10-15 min)
```

All four smoke apps must typecheck and build against the packed tarball.

## Pinned versions — do not bump casually

These are pinned for compatibility reasons documented in [DECISIONS.md](docs/DECISIONS.md):

- ESLint 9 (not 10) — jsx-a11y peer range
- TypeScript 5 (not 7) — typescript-eslint compatibility
- Style Dictionary 4 (not 5) — Node 20 floor
- Remix smoke apps on Vite 6 / React 18 — Remix 2.17 peer caps

Check DECISIONS.md before upgrading any of these.
