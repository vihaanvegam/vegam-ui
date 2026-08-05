# Running things

Every command, where to run it, which port it uses, and when you actually need
it. If you only remember one thing: **run everything from the repository root.**

---

## First run, on a fresh clone

```bash
pnpm install
pnpm build
```

`pnpm build` is not optional the first time. Build output is gitignored, so a
fresh clone has no `packages/tokens/dist/` — and both the `ui` build and
Storybook import `@vegam-ui/tokens/tokens.css`, which resolves into that
folder. Skip it and you get a module-resolution error that looks unrelated to
tokens.

Requirements: **Node 20+** and **pnpm** (the repo pins pnpm 11.17.0 via
`packageManager`; Corepack will honour it).

---

## The golden rule: run from the root

The root is `C:\Users\vihaanvegam\uig` — the folder containing
`pnpm-workspace.yaml`.

```bash
cd C:\Users\vihaanvegam\uig
```

Every script below is defined on the **root** `package.json` and uses pnpm
workspace filters internally to reach the right package. You never need to `cd`
into `packages/ui` or `packages/tokens`.

You _can_ `cd packages/ui && pnpm storybook` if you prefer — that package
defines its own `storybook`, `build`, `test`, and `typecheck` scripts. But
`packages/ui` has **no** `graph`, `gates`, `smoke`, or `lint` script, so those
fail there with "command not found". Root works for everything; use it.

---

## Command reference

### Servers (these keep running until you stop them)

| Command                                | Port     | Opens                               |
| -------------------------------------- | -------- | ----------------------------------- |
| `pnpm --filter @vegam-ui/ui storybook` | **6006** | http://localhost:6006               |
| `pnpm graph:serve`                     | **4173** | http://localhost:4173/graphify.html |

Stop either with `Ctrl+C`.

### Everything else (runs and exits)

| Command                | What it does                                                  |
| ---------------------- | ------------------------------------------------------------- |
| `pnpm build`           | Builds tokens, then ui (topological order matters)            |
| `pnpm test`            | Vitest, 149 tests                                             |
| `pnpm lint`            | ESLint over the whole repo                                    |
| `pnpm format`          | Prettier, writes fixes                                        |
| `pnpm format:check`    | Prettier, read-only (what CI runs)                            |
| `pnpm typecheck`       | `tsc --noEmit` on the packages                                |
| `pnpm graph`           | Regenerates both relationship graphs                          |
| `pnpm graph:check`     | Fails if the graphs are stale (what CI runs)                  |
| `pnpm gates`           | build → attw → publint → directive → smoke. The release gate. |
| `pnpm changeset`       | Records a release note for your change                        |
| `pnpm release:dry-run` | Publish rehearsal, publishes nothing                          |

---

## Storybook

```bash
pnpm --filter @vegam-ui/ui storybook
```

Serves the component workshop on **http://localhost:6006**. It reads component
**source** directly (not `dist/`), so edits hot-reload — you do **not** need to
re-run `pnpm build` while working on a component.

The one exception is tokens: Storybook loads
`packages/tokens/dist/tokens.css`. If you edit `tokens.json`, run
`pnpm --filter @vegam-ui/tokens build` and refresh, or colours will not change.

To verify the production build of the docs site:

```bash
pnpm --filter @vegam-ui/ui build-storybook   # → packages/ui/storybook-static/ (gitignored)
```

---

## graphify: `pnpm graph` vs `pnpm graph:serve`

These are two different things and the names are easy to confuse.

### `pnpm graph` — regenerate

Reads the source and **rewrites two files**:

- `docs/ARCHITECTURE.md` — Mermaid diagrams, readable in a diff and on GitHub
- `docs/graphify.html` — the interactive map

It does not start anything. It exits immediately.

**Run it whenever you change the shape of the repo:**

- added, removed, or renamed a component or util
- changed imports between modules (a new `import` = a new edge)
- added or removed a package, or changed a workspace dependency
- edited `packages/tokens/src/tokens.json`

If you forget, **CI fails** — `pnpm graph:check` runs in the lint job and
compares the committed files against freshly generated ones. `pnpm graph` then
`git add docs/` fixes it.

You do **not** need to run it for a CSS tweak, a copy change, a new test, or a
new story — none of those change the graph.

### `pnpm graph:serve` — view

Starts a ~40-line static file server (`scripts/serve-docs.mjs`) on **port
4173** that serves the `docs/` folder, so you can open the interactive map in a
browser:

```
http://localhost:4173/graphify.html
```

It **only serves files — it never regenerates them.** If the map looks stale,
you want `pnpm graph`, not a refresh.

You don't strictly need the server at all: `docs/graphify.html` is entirely
self-contained (no CDN, no external requests), so double-clicking the file
works too. The server exists because some browsers restrict `file://` pages,
and because it makes the map available to the preview pane.

Port 4173 busy? `PORT=4300 pnpm graph:serve`.

---

## Everyday workflows

**Working on a component**

```bash
pnpm --filter @vegam-ui/ui storybook   # leave running
pnpm test                              # in another terminal, as you go
```

No `pnpm build` needed — Storybook and Vitest both read source.

**Changed `tokens.json`**

```bash
pnpm --filter @vegam-ui/tokens build   # regenerate CSS/SCSS/JS
pnpm graph                             # token edges changed
```

**Added or removed a component, or changed imports**

```bash
pnpm graph
```

**Before committing**

```bash
pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm graph:check
```

The Husky pre-commit hook runs lint-staged (ESLint + Prettier on staged files)
automatically, but it does **not** run tests, typecheck, or the graph check —
those are yours to run, and CI enforces them.

**Before a release**

```bash
pnpm gates
```

Takes roughly 10–15 minutes: it packs the tarball and npm-installs it into all
four smoke apps. See [RELEASING.md](RELEASING.md) for the full flow.

---

## Which directory for what

| You want to…                | Run from      | Command                                |
| --------------------------- | ------------- | -------------------------------------- |
| Anything in the table above | root          | as written                             |
| Storybook                   | root          | `pnpm --filter @vegam-ui/ui storybook` |
| Storybook (alternative)     | `packages/ui` | `pnpm storybook`                       |
| The interactive map         | root          | `pnpm graph:serve`                     |
| Regenerate graphs           | root          | `pnpm graph` — **root only**           |
| Rebuild tokens alone        | root          | `pnpm --filter @vegam-ui/tokens build` |

Never run commands inside `apps/smoke-*`. Those exist for the automated smoke
gate, which copies them to a temp directory and installs the packed tarball;
running them in place tests workspace linking, which is exactly the thing the
gate is designed to bypass.

---

## Generated files: committed or ignored?

| Path                            | Generated by        | In git?       | Why                                             |
| ------------------------------- | ------------------- | ------------- | ----------------------------------------------- |
| `packages/*/dist/`              | `pnpm build`        | ignored       | Rebuildable; committing invites stale artifacts |
| `packages/ui/storybook-static/` | `build-storybook`   | ignored       | Build output                                    |
| `*.tgz`                         | `pnpm pack`         | ignored       | Release scratch                                 |
| `docs/ARCHITECTURE.md`          | `pnpm graph`        | **committed** | Reviewable in diffs; CI diffs it                |
| `docs/graphify.html`            | `pnpm graph`        | **committed** | Viewable without a build step; CI diffs it      |
| `packages/*/CHANGELOG.md`       | `changeset version` | **committed** | It is the release history                       |
| `.claude/launch.json`           | hand-written        | **committed** | Shared preview configs                          |
| `.claude/settings.local.json`   | your machine        | ignored       | Per-user                                        |

### Why the generated graphs are committed, but Storybook output is not

A fair question, since all three are "generated". The rule is whether anything
**verifies** the file.

- **`storybook-static/` → ignored.** Nothing checks it. It is hundreds of files
  rebuilt in seconds by `build-storybook`, and it would bloat every clone.
- **`docs/ARCHITECTURE.md` and `docs/graphify.html` → committed.**
  `pnpm graph:check` compares the committed copies against freshly generated
  ones. Gitignore them and there is nothing to compare: on a clean CI checkout
  the files are simply absent, `graph:check` reports them out of date, and the
  job fails on every run. The gate only works because they are in git. They are
  also the point — a reviewer sees the graph change in the pull request, and
  anyone can open the map straight from a clone.

Never hand-edit either: your edit is erased on the next `pnpm graph`, and CI
fails in between.

The cost of committing generated files is diff noise, and
[`.gitattributes`](../.gitattributes) handles that instead of gitignore. Both
files are marked `linguist-generated=true`, so GitHub collapses them in
pull-request diffs and leaves them out of language statistics. That file also
sets `* text=auto eol=lf`: the repo is authored on Windows and CI runs Linux,
so without it a contributor with `core.autocrlf=true` gets CRLF working files
and `pnpm format:check` fails on everything.

`docs/graphify.html` is additionally in `.prettierignore`, so formatting cannot
fight the drift check.

### Markdown, in short

**Every `.md` file in this repo is committed** — hand-written docs, the
generated `ARCHITECTURE.md`, and the Changesets-generated `CHANGELOG.md` files
alike. None of them belongs in `.gitignore`. Documentation that is not in the
repository is documentation nobody reads.

---

## .gitignore

Current contents cover:

- `node_modules/`
- build output — `dist/`, `build/`, `.next/`, `storybook-static/`, `*.tgz`
- caches and reports — `coverage/`, `*.tsbuildinfo`, `.eslintcache`
- local settings — `.claude/settings.local.json`, `.vscode/`, `.idea/`
- environment — `.env`, `.env.*`
- OS noise — `.DS_Store`, `Thumbs.db`, `*.log`

Three of those were added after the fact and are worth knowing about:

- **`.claude/settings.local.json`** — per-machine agent settings that were
  previously unignored and would have been committed. `launch.json` in the same
  folder is deliberately _not_ ignored: shared preview configs belong in the repo.
- **`*.tsbuildinfo`** — the smoke apps use `"incremental": true`, so a stray
  `tsconfig.tsbuildinfo` appears if you typecheck inside one.
- **`.eslintcache`** — only appears if someone runs `eslint --cache`, but it is
  pure noise when it does.

`.vscode/` is ignored here. If you later want to share editor settings with the
team, remove that line and commit a curated `.vscode/extensions.json` —
that is a deliberate choice, not an accident.

Nothing else needs adding. The smoke harness writes to the OS temp directory,
never into the repo.

---

## Troubleshooting

**"Cannot find module `@vegam-ui/tokens/tokens.css`"** — you have not built.
`pnpm build`.

**CI fails on `graph:check`, and it passes locally** — you regenerated but did
not stage the result. `git add docs/ARCHITECTURE.md docs/graphify.html`.

**Port already in use** — Storybook: `pnpm --filter @vegam-ui/ui exec storybook dev -p 6007`.
Map: `PORT=4300 pnpm graph:serve`.

**`ERR_PNPM_IGNORED_BUILDS`** — a new dependency wants to run install scripts.
They are denied by default; add an explicit entry under `allowBuilds` in
`pnpm-workspace.yaml` only if that dependency genuinely needs it.

**Colours did not change after editing `tokens.json`** — rebuild tokens:
`pnpm --filter @vegam-ui/tokens build`, then refresh Storybook.

**`pnpm graph` says "command not found"** — you are inside `packages/ui`. Go to
the root.
