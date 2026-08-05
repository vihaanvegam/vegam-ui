# Releasing

How to cut a release of `@vegam-ui/ui` and `@vegam-ui/tokens`, and how to wire
up the repository links that are deliberately **not** configured yet.

---

## 1. The normal release flow

### a. Describe the change

After any change that consumers would notice, add a changeset:

```bash
pnpm changeset
```

It asks which packages changed and whether each bump is `patch`, `minor`, or
`major`, then writes a markdown file into `.changeset/`. **Commit that file with
your code** — it is the release note, written while the context is fresh.

Which bump:

| Bump    | When                                                                            |
| ------- | ------------------------------------------------------------------------------- |
| `patch` | Bug fix, CSS tweak, docs — no API change                                        |
| `minor` | New component, new prop, new token — backwards compatible                       |
| `major` | Removed/renamed export or prop, changed default, changed markup consumers style |

Renaming a `ui-*` class or removing a token is a **major**: class names and
tokens are a documented override surface, so consumers' CSS depends on them.

### b. Version

When you are ready to release, consume the pending changesets:

```bash
pnpm changeset version
```

This bumps `version` in each affected package.json, writes/updates
`CHANGELOG.md` per package, and deletes the consumed changeset files. Review the
diff — this is the last cheap moment to fix a wrong bump.

### c. Verify before publishing

```bash
pnpm gates
```

All four must pass, and they run against the packed tarball, not source:

1. `attw --pack` — type resolution across `node10`, `node16` (CJS and ESM), `bundler`
2. `publint` — package layout
3. smoke — the tarball npm-installed into four real apps, each built and typechecked
4. directive — `'use client'` on line 1 of `dist/index.js`

Also green: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm format:check`.

### d. Dry run, then publish

```bash
pnpm -r publish --dry-run --no-git-checks
```

Read the file list it prints for each package. It must be exactly `dist/`,
`package.json`, `README.md`, and `LICENSE` — nothing else, and nothing missing.

Then, for real:

```bash
pnpm -r publish
```

Requirements before the first publish:

- You are logged in: `npm whoami`, otherwise `npm login`
- The **`@vegam-ui` scope exists** on the registry and your account can publish
  to it. Create it at npmjs.com → _Add organization_, or publish under a scope
  you already own by renaming both packages.
- Scoped packages are private by default; `.changeset/config.json` already sets
  `"access": "public"`, and each publish passes `--access public` accordingly.
  Without this, npm rejects the publish unless you have a paid plan.

---

## 2. Adding repository links (not configured yet)

Right now Changesets uses its plain changelog generator: entries are written
without links back to commits or pull requests, and neither package declares a
`repository` field. That is a deliberate, easily reversible choice — nothing
depends on a repo URL existing. Here is everything to change once the remote is
decided.

### a. Add `repository` to each package.json

`packages/ui/package.json` and `packages/tokens/package.json` — add alongside
`license`, replacing `ORG/REPO`:

```json
  "repository": {
    "type": "git",
    "url": "git+https://github.com/ORG/REPO.git",
    "directory": "packages/ui"
  },
  "homepage": "https://github.com/ORG/REPO#readme",
  "bugs": "https://github.com/ORG/REPO/issues",
```

`directory` must point at that package's folder — it is what makes npm's
"Repository" link land on the subfolder in a monorepo. Use `packages/tokens`
for the tokens package.

This also feeds npm's provenance and the sidebar links on npmjs.com. `publint`
does not require it, but it is the difference between a package that looks
maintained and one that does not.

### b. Switch Changesets to the GitHub changelog generator

```bash
pnpm add -w -D @changesets/changelog-github
```

Then in `.changeset/config.json`, replace the `changelog` line:

```json
  "changelog": ["@changesets/changelog-github", { "repo": "ORG/REPO" }],
```

Entries then read `- abc1234: Fix focus ring (#42)` with everything linked.

**This generator requires a `GITHUB_TOKEN` in the environment whenever
`changeset version` runs** — it calls the GitHub API to resolve commits to PRs
and authors. Locally: `export GITHUB_TOKEN=$(gh auth token)`. In CI, pass
`secrets.GITHUB_TOKEN`. Without the token, `changeset version` fails outright,
which is why this is not enabled by default.

### c. Wire the release workflow (optional but recommended)

Add `.github/workflows/release.yml`. It opens a "Version Packages" PR that
accumulates pending changesets, and publishes when that PR is merged:

```yaml
name: Release

on:
  push:
    branches: [main]

concurrency: release

permissions:
  contents: write
  pull-requests: write
  id-token: write # npm provenance

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # changesets needs history
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
          registry-url: https://registry.npmjs.org
      - run: pnpm install --frozen-lockfile
      - run: pnpm gates
      - uses: changesets/action@v1
        with:
          version: pnpm changeset version
          publish: pnpm -r publish --access public
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Prerequisites:

- Repo secret `NPM_TOKEN` — an npm **automation** token (Access Tokens →
  Generate New Token → Automation), so it bypasses 2FA in CI
- Settings → Actions → General → _Allow GitHub Actions to create and approve
  pull requests_, otherwise the version PR cannot be opened
- `fetch-depth: 0` is required; a shallow clone makes Changesets miss tags

### d. Checklist

- [ ] `repository` (with `directory`), `homepage`, `bugs` in **both** package.json files
- [ ] `@changesets/changelog-github` installed and set in `.changeset/config.json`
- [ ] `GITHUB_TOKEN` available wherever `changeset version` runs
- [ ] `NPM_TOKEN` secret added, if publishing from CI
- [ ] Re-run `pnpm gates` — package.json changes affect the packed tarball
- [ ] Update this file: delete section 2 and note the change in `docs/DECISIONS.md`

---

## 3. Version policy

Versions start at **0.1.0**. While the major is `0`, minor bumps may contain
breaking changes — signalling that the API is still settling. Cut `1.0.0` when
you are ready to promise semver stability; from then on, breaking changes
require a major.

The two packages version **independently**. `@vegam-ui/tokens` is a build-time
devDependency of `@vegam-ui/ui` (its CSS is inlined into the published
stylesheet), so a tokens release does not force a ui release — but a token
change that alters rendered output should ship a ui release too, since the
inlined copy only updates when ui is rebuilt.

## 4. Publishing checklist

- [ ] Changeset written for every consumer-visible change
- [ ] `pnpm changeset version`, diff reviewed
- [ ] `pnpm gates` green (all four)
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm format:check` green
- [ ] `pnpm -r publish --dry-run --no-git-checks`, file lists inspected
- [ ] Logged in to npm with publish rights on the `@vegam-ui` scope
- [ ] `pnpm -r publish`
- [ ] Tag and push (`git tag v0.1.0 && git push --tags`), or let
      `changesets/action` do it
