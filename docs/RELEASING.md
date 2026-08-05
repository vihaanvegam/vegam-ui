# Releasing

How to cut a release of `@vegam-ui/ui` and `@vegam-ui/tokens`.

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

## 2. Version policy

Versions start at **0.1.0**. While the major is `0`, minor bumps may contain
breaking changes — signalling that the API is still settling. Cut `1.0.0` when
you are ready to promise semver stability; from then on, breaking changes
require a major.

The two packages version **independently**. `@vegam-ui/tokens` is a build-time
devDependency of `@vegam-ui/ui` (its CSS is inlined into the published
stylesheet), so a tokens release does not force a ui release — but a token
change that alters rendered output should ship a ui release too, since the
inlined copy only updates when ui is rebuilt.

## 3. Publishing checklist

- [ ] Changeset written for every consumer-visible change
- [ ] `pnpm changeset version`, diff reviewed
- [ ] `pnpm gates` green (all four)
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm format:check` green
- [ ] `pnpm -r publish --dry-run --no-git-checks`, file lists inspected
- [ ] Logged in to npm with publish rights on the `@vegam-ui` scope
- [ ] `pnpm -r publish`
- [ ] Tag and push (`git tag v0.1.0 && git push --tags`), or let
      `changesets/action` do it
