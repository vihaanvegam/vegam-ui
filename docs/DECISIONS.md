# Decision log — append-only

Never edit or delete past entries. If a decision is reversed, append a new entry
that supersedes the old one; the reversal is the most valuable information here.

## 2026-07-29 — Plain CSS + custom properties over CSS-in-JS

Context: styling engine for a library consumed across frameworks, including RSC/SSR.
Decision: colocated plain CSS per component, themed entirely via CSS custom properties.
Rejected: CSS-in-JS (runtime cost, RSC incompatibility — MUI is nine majors deep and
still on Emotion because their zero-runtime replacement stalled); Tailwind (forces
consumer build config, breaking the zero-workaround rule).
Consequence: all component CSS concatenates into one dist/index.css; consumers add
exactly one CSS import. Dark mode must be a `[data-theme="dark"]` semantic-token
remap, never component CSS changes.

## 2026-07-29 — Vite library mode over tsup

Context: need ESM + CJS + dual declarations + CSS extraction in one pipeline.
Decision: Vite library mode with vite-plugin-dts (`rollupTypes: true`).
Rejected: tsup (weaker CSS handling); raw Rollup (more config surface, same output).
Consequence: must add rollup-preserve-directives (Rollup strips `'use client'` by
default) and set `cssCodeSplit: false`; the .d.cts twin needs a post-build step.

## 2026-07-29 — Named exports only, single barrel

Context: API surface control and tree-shaking survival.
Decision: every export named, re-exported from packages/ui/src/index.ts only.
Rejected: default exports (rename drift, worse refactoring tools); per-component
deep entry points (more exports-map surface, more attw failure modes) — these can
be added later without breaking anyone.
Consequence: the barrel must stay side-effect-free or tree-shaking dies.

## 2026-07-29 — Dual .d.ts / .d.cts declarations

Context: consumers resolve types under `bundler`, `node16`/`nodenext`, and legacy
`node` modes; one .d.ts serving both ESM and CJS is the most common cause of
"types work in Vite, break in Next.js".
Decision: emit index.d.ts and index.d.cts; `types` first in every exports
condition; root `main`/`module`/`types` kept as legacy fallbacks.
Rejected: single .d.ts (fails attw masquerading checks); dropping CJS (breaks
legacy consumers).
Consequence: attw and publint run against the packed tarball as hard CI gates.

## 2026-07-29 — npm scope: @vegam-ui

Context: brief requires asking the user for the scope before scaffolding.
Decision: `@vegam-ui`, chosen by the user — a dedicated scope for the design
system. Packages: `@vegam-ui/ui`, `@vegam-ui/tokens`.
Rejected: `@vegam` (would mix design-system packages with unrelated company packages).
Consequence: scope must exist on the registry before the first publish (phase 6).

## 2026-07-29 — Toolchain pins: ESLint 9, TypeScript 5

Context: at install time the registry serves ESLint 10.8 and TypeScript 7.0.2, but
eslint-plugin-jsx-a11y's peer range stops at ESLint ^9 and typescript-eslint 8.65
requires TypeScript <6.1 (TS 7 is the native-compiler line; the lint/declaration
ecosystem has not caught up).
Decision: pin `eslint@^9` and `typescript@^5` at the workspace root.
Rejected: ESLint 10 (unmet peer for jsx-a11y); TS 7 (breaks typescript-eslint,
unknown behavior under vite-plugin-dts/api-extractor).
Consequence: `pnpm peers check` is clean. Revisit both pins when jsx-a11y ships
ESLint-10 support and typescript-eslint/api-extractor declare TS 6/7 support.
Companion packages @eslint/js, globals, eslint-config-prettier added — standard
flat-config wiring for the sanctioned ESLint setup, not new capability.

## 2026-07-29 — Style Dictionary 4, not 5

Context: style-dictionary@5.5.0 requires Node >=22; our locked floor is Node 20+
and CI runs Node 20. v4 (4.4.0) supports Node 20 and is the API build.js targets.
Decision: pin `style-dictionary@^4` in @vegam-ui/tokens.
Rejected: v5 (silently raises the Node floor for contributors and breaks CI on
Node 20); hand-rolled generator (re-implements transforms/reference resolution).
Consequence: upgrade to v5 only together with a deliberate Node-floor bump.

## 2026-07-29 — pnpm dependency build scripts: denied

Context: pnpm 11 blocks dependency lifecycle scripts until approved
(`allowBuilds` in pnpm-workspace.yaml); style-dictionary and
@bundled-es-modules/glob requested script execution, and the scaffolded
placeholder text fails every install until resolved.
Decision: set both to `false` — least privilege; the tokens build was verified
to work without their install scripts.
Consequence: future deps that genuinely need postinstall (e.g. esbuild in
phase 2) must be explicitly allowed in `allowBuilds`, or installs fail with
ERR_PNPM_IGNORED_BUILDS.

## 2026-07-29 — Tokens JS output: flat named exports, dual ESM/CJS

Context: the brief requires dist .css/.js/.scss; built-in Style Dictionary JS
formats emit a default-exported object, which conflicts with the named-only
export policy, and provide no .d.cts.
Decision: custom formats emit flat named constants (`export const blue500`),
a CJS twin (`tokens.cjs`), and hand-shaped tokens.d.ts / tokens.d.cts, with
types-first exports map — the same packaging standard @vegam-ui/ui must meet.
Rejected: built-in `javascript/es6` + declaration formats (default-export shape,
no CJS/dual-types story).
Consequence: build.js owns the JS surface; adding token types other than string
means updating the declaration formats too.

## 2026-07-29 — vite-plugin-dts 5: `rollupTypes` is now `bundleTypes`

Context: v5 rewrapped the plugin around unplugin-dts. The locked config said
`rollupTypes: true`, but v5 SILENTLY ignores unknown options — the build
"succeeded" while emitting unbundled declarations referencing ./utils/* paths.
Also, @microsoft/api-extractor moved from bundled dependency to peer, so it must
be an explicit devDependency of packages/ui.
Decision: use `bundleTypes: true` (supersedes the option name recorded in the
2026-07-29 "Vite library mode over tsup" entry; the intent is unchanged).
Consequence: after ANY dts-plugin upgrade, verify dist/index.d.ts is a single
rolled-up file with no relative re-exports — the failure mode is silent.

## 2026-07-29 — attw excludes the ./styles.css entrypoint

Context: attw resolves every exports subpath as a JS/type entrypoint; a CSS
subpath can never resolve to declarations, so it reports 💀 NoResolution and
fails the gate even though the packaging is correct.
Decision: run `attw --pack . --exclude-entrypoints ./styles.css`. publint still
verifies the CSS file exists and is shipped.
Rejected: --ignore-rules no-resolution (global blanket — would also mask real
resolution failures on JS entrypoints).
Consequence: any new non-JS exports subpath must be added to the exclude list.

## 2026-07-29 — Smoke harness: copy out of workspace, install tarball with npm

Context: gate 3 must prove what consumers get. Inside the workspace, pnpm
linking and workspace resolution mask packaging bugs (files whitelist, exports
map, peer handling) — the exact class of bug this phase exists to catch.
Decision: scripts/smoke.mjs copies each app to a temp dir, rewrites
`workspace:*` → `file:ui.tgz` (packed via pnpm pack), installs with plain npm,
then builds and typechecks. Apps keep self-contained tsconfigs (no extends of
repo configs) so they survive the copy.
Rejected: `pnpm add <tarball>` inside the workspace (mutates app package.json +
lockfile in-repo); testing against linked workspace deps only (hides bugs).
Consequence: smoke runs cost four npm installs (~minutes); apps must never
grow references to repo-root files.

## 2026-07-29 — Phase-2 library ships two utils, and the bundle is client-marked

Context: the directive gate requires dist/index.js line 1 to carry 'use client',
which an empty barrel cannot satisfy; the repo layout already specifies
utils/cx.ts and utils/useIsomorphicLayoutEffect.ts.
Decision: ship exactly those two utils (no components — none were asked for).
cx stays framework-free with no directive; the hook file carries 'use client'.
Note: because the library bundles to a single chunk, rollup-preserve-directives
hoists the directive chunk-wide — the whole bundle is client-marked for RSC
consumers. That is what the line-1 gate demands. The source-level rule
(directive per interactive file, never the barrel) still holds so a future
preserveModules build could restore per-module granularity without a rewrite.
Consequence: server components must import the library only as a client
boundary (smoke-next-app's page is a client component for exactly this reason).

## 2026-07-29 — @vegam-ui/tokens is a devDependency of ui; CSS inlined

Context: consumers get exactly one CSS import. tokens.css is therefore bundled
into dist/index.css at build time, and components read theme via CSS variables,
not token JS values.
Decision: tokens is a devDependency (build-time input only); @vegam-ui/ui has
zero runtime dependencies.
Consequence: if any runtime code ever imports token JS values, tokens must be
promoted to a real dependency in the same change (CLAUDE.md rule).

## 2026-07-29 — Smoke matrix pins: React 18/19, legacy resolution, Vite 6

Context: the matrix should span real consumer variance, not four copies of the
happy path. Remix 2.17 peers cap at React ^18 and Vite ^5||^6.
Decision: smoke-next-app = Next 16 + React 19 + bundler resolution (modern RSC);
smoke-next-pages = Next 16 + React 18 + moduleResolution "node" (legacy row of
the contract table — ignores exports, reads root types); smoke-vite = Vite 8 +
React 18; smoke-remix = Remix 2.17 + React 18 + Vite 6 (isbot dep required by
Remix's default server entry). esbuild/sharp install scripts stay denied in
allowBuilds — both work from prebuilt optional-dependency binaries.
Consequence: the React >=18 peer range and both type-resolution extremes are
exercised on every CI run.

## 2026-07-29 — Smoke temp dirs must use long-form Windows paths

Context: first full smoke run failed only on smoke-remix, only on Windows. The
client build passed; the SSR build died with "[remix-virtual-modules] No
manifest entry found for app/root.tsx" and manifest keys full of ../../.. path
climbing. Root cause: Node's tmpdir() returned an 8.3 short path
(C:\Users\VIHAAN~1\...) while Remix's vite plugin keys its manifest by
long-form resolved paths (C:\Users\vihaanvegam\...), so its relative-path
computation escaped the project root.
Decision: scripts/smoke.mjs creates its work dir under
realpathSync.native(tmpdir()) so every consumer toolchain sees one canonical
path form.
Consequence: none on Linux/CI (no short paths there); any future script that
hands a temp path to a bundler should do the same.

## 2026-07-29 — Storybook 10, deviating from the brief's "Storybook 8"

Context: the brief's tooling list says Storybook 8, but SB 8 predates Vite 8
and cannot build against it; @storybook/react-vite 10.5 peers vite ^5–^8 and
react ^16.8–^19.
Decision: Storybook 10 (latest), with @storybook/addon-a11y. The brief's line
is read as "current Storybook major at the time it was written".
Rejected: pinning SB 8 (would force a parallel old-Vite toolchain solely for
docs); skipping Storybook (phase deliverable requires it).
Consequence: SB config lives in packages/ui/.storybook with a dedicated empty
vite config (framework option builder.viteConfigPath) — SB must NOT load the
package's library vite.config.ts (lib mode + dts + directive plugins).

## 2026-07-29 — Theme mechanism: wrapper element, [data-theme=light] re-declared

Context: theming must be SSR-flash-free, nestable, and JS-minimal (dual-package
hazard). A provider that mutates document.documentElement needs effects, can't
nest, and violates the no-document rule.
Decision: ThemeProvider renders a `display: contents` div carrying
`data-theme`, plus a context that carries ONLY per-component prop defaults
(useComponentDefaults). Theme values travel exclusively via CSS custom
properties. tokens.css now emits three blocks: :root (primitives + light
semantic), [data-theme="light"] (semantic re-declared + color-scheme: light —
required for a light region nested inside dark, since custom properties
inherit through the DOM), and [data-theme="dark"] (overrides + color-scheme:
dark). The build asserts every dark override remaps an existing semantic token.
Rejected: html-attribute mutation (above); context-carried theme values (state
diverges across dual-package React copies; CSS never does).
Consequence: two React copies at worst lose configured prop defaults — colors
and theming still render correctly. colorScheme omitted = inherit.

## 2026-07-29 — Vitest without globals; explicit Testing Library cleanup

Context: with `globals: false` (our choice — explicit imports), Testing
Library's auto-cleanup silently never registers because it looks for a global
afterEach; every render leaked into the next test and duplicate-element
queries failed.
Decision: src/test/setup.ts registers `afterEach(cleanup)` explicitly; vitest
uses its own vitest.config.ts so the library build config never runs in tests.
Consequence: keep the setup file wired in any future vitest config change.

## 2026-07-29 — Token gallery reads the shipped CSS at runtime

Context: the Storybook token page must render every token and never drift from
reality. Importing tokens.json across package boundaries either leaks src/
paths or requires a new published artifact.
Decision: the gallery parses the `:root` rule of the loaded stylesheet for
--ui-* declarations and renders swatches with `var()`; semantic colors render
inside light AND dark ThemeProviders so the browser itself proves the remap.
Verified live: --ui-color-bg-canvas resolves #ffffff / #030712 in the two
wrappers on one page.
Rejected: exporting tokens.json from @vegam-ui/tokens (new public API surface
for a docs-only need); hand-maintained token lists (drift).
Consequence: browser-only (fine — it is a Storybook page); if token emission
ever moves out of :root, the gallery's selector must follow.

## 2026-07-29 — "Semantic tokens only" scoped to colors; dimensional tokens used directly

Context: the brief's own primitive examples include --ui-space-4 and
--ui-font-size-3, yet components obviously need spacing and type. Read
literally, "component CSS uses semantic tokens only" would forbid both.
Decision: the rule's intent is THEMING — every color in component CSS must be
a semantic color token (--ui-color-_, --ui-border-_, --ui-focus-*) so dark
mode stays a pure remap; dimensional/typographic/motion scales (space, radius,
font, motion, border-width) are theme-invariant and are consumed directly.
Zero literals either way: border-width.{1,2} and space.11 (2.75rem — the 44px
WCAG coarse-pointer floor) were added as tokens rather than hardcoding px.
Consequence: a reviewer checking "zero hardcoded values" should look for
literal colors/dimensions, not for primitive-scale var() usage.

## 2026-07-29 — Every component is 'use client' and reads theme defaults via context

Context: CLAUDE.md says defaults come from the theme's defaultProps context —
that is a hook (useContext), which makes ANY component using it client code,
including presentational Text. An earlier session note suggested keeping Text
directive-free for server-component purity.
Decision: uniformity wins — Button, Input, and Text all carry 'use client'
and call useComponentDefaults. The single-chunk bundle is client-marked
anyway (see the phase-2 entry), so per-file purity buys nothing today.
Rejected: a context-free Text (would silently ignore componentDefaults.Text —
an inconsistency consumers would hit as a bug).
Consequence: if the build ever moves to preserveModules for real per-module
RSC granularity, revisit whether presentational components should read
defaults some other way. ThemeComponentDefaults now has concrete keys
(Button/Input/Text) — the phase-3 index signature is gone, and
useComponentDefaults is fully typed at call sites.

## 2026-07-29 — Input: aria-invalid drives invalid styling; native size dropped

Context: an invalid state needs styling, but boolean style flags are banned,
and assistive tech needs aria-invalid regardless.
Decision: no `invalid` prop — the CSS keys off `[aria-invalid='true']`
directly, so the visual state and the accessibility state are the same fact
and cannot desynchronize. Separately, InputProps omits the native `size`
(character-width) attribute so the design-system size union can use the name;
documented in the type's JSDoc.
Rejected: an `invalid` boolean prop that sets aria-invalid (two sources of
truth; also a banned boolean style flag).
Consequence: consumers set aria-invalid from their form library's state.

## 2026-07-29 — Button defaults type="button"; Text decouples scale from semantics

Context: two deliberate departures from raw-DOM behavior. (1) Native buttons
default type="submit", which submits enclosing forms by accident. (2) Heading
levels and visual sizes are usually welded together, which corrupts document
outlines when designers want a small h1.
Decision: Button defaults `type="button"` (JSDoc documents the departure;
submit is one prop away). Text takes `as` for the element (default `p`,
excluded from theme defaults — semantics must not be themeable) and
independent size (scale steps 1–7) / weight / tone that INHERIT when omitted,
so Text composes inside styled contexts instead of fighting them.
Consequence: form submit buttons must say type="submit" explicitly; heading
markup is chosen for meaning, sizes for design.

## 2026-07-30 — Select architecture: select-only combobox, options as data, parts as slots

Context: Select must prove slots, portals, and the SSR rules (phase 5 brief).
Two composition models compete: children-based (Select.Option elements) vs an
options array with replaceable parts.
Decision: options are DATA (`options: SelectOption[]` — value/label/disabled);
rendering is customized via `slots.option` (render-prop component receiving
option/selected/active) and `slotProps.{popup,listbox,option}` (className via
cx, style merged, rest spread). Behaviour is framework-free under utils/:
listNavigation.ts (first/last/next enabled + type-ahead, pure functions) and
positioning.ts (below-with-flip-above placement math), each unit-tested.
Keyboard follows the APG select-only combobox pattern: focus stays on the
native button trigger (role=combobox, aria-expanded/-controls/
-activedescendant); arrows/Home/End move the active option, printable
characters type-ahead (space commits, so labels-with-spaces lose type-ahead on
space — documented trade), Enter/Space commit, Escape/Tab close. A hidden
input carries the value when `name` is set. The caret is drawn from borders
(currentColor) — no icon content.
Rejected: children-based option elements (state machine must parse children;
slots rule already mandates the parts model); focus-moving listbox (more focus
juggling, worse for touch + screen readers than activedescendant).
Consequence: option labels must be strings (they drive type-ahead); rich
option UI goes through slots.option.

## 2026-07-30 — Select popup portals into the nearest [data-theme] wrapper

Context: a popup portaled to document.body escapes the ThemeProvider subtree,
so a scoped dark theme would render a light popup — the classic portal
theming bug. Theme state lives only in CSS/DOM (by design), so there is no
context value to re-apply.
Decision: on open, the portal container is
`trigger.closest('[data-theme]')` — falling back to document.body when there
is none or when the match is <html>/<body>. The popup then sits inside the
themed DOM scope and inherits the remapped custom properties naturally.
Position stays `fixed` (viewport-relative regardless of DOM parent; the
display:contents theme wrapper cannot become a containing block).
Verified live: dark-scheme story popup renders gray-900 surface inside the
data-theme="dark" wrapper.
Rejected: colorScheme in React context (reintroduces dual-package state
divergence); always body + copying the attribute onto the popup (breaks for
nested/scoped themes with different schemes).
Consequence: consumers whose transformed/filtered ancestors create fixed-pos
containing blocks may see offset popups — standard caveat, document in README.

## 2026-07-30 — Checkbox: native rendering + accent-color; 24px coarse target

Context: custom-drawn checkboxes (appearance:none + CSS glyph) buy visual
control at the cost of platform a11y states, forced-colors behavior, and an
icon-like glyph the no-icons rule frowns on.
Decision: keep the user agent's checkbox and tint it with `accent-color:
var(--ui-color-action-primary)`; dark scheme adapts via the color-scheme
property already emitted in the theme blocks. `indeterminate` is a prop wired
to the DOM property via ref + useIsomorphicLayoutEffect (exposed as "mixed").
Deviation from CLAUDE.md's blanket "≥44px targets on coarse pointers": the
control grows to 24px (space-6) on coarse pointers — the WCAG 2.5.8 AA
minimum — because a 44px checkbox glyph is visually broken; the paired
clickable label (documented in JSDoc and stories) provides the larger target.
Rejected: fully custom-drawn control; 44px checkbox.
Consequence: check-glyph styling beyond color is not offered; if a design
demands it, that is a new decision.

## 2026-07-30 — Release config: no repository links yet, 0.1.0, independent versions

Context: Changesets can link changelog entries to commits/PRs, and package.json
can declare `repository`/`homepage`/`bugs` — but the git remote is not decided,
and the GitHub changelog generator hard-fails `changeset version` without a
GITHUB_TOKEN in the environment.
Decision (user's call): ship with the plain `@changesets/cli/changelog`
generator and no repository fields. docs/RELEASING.md section 2 documents the
complete reversal — exact JSON to add to both package.json files (including
`directory` for monorepo subfolder links), the generator swap, the token
requirement, and a ready release.yml workflow.
Rejected: guessing a GitHub URL (a wrong URL in published metadata is worse
than none — it ships to the registry and misdirects users).
Consequence: changelog entries have no commit/PR links until section 2 is
applied; nothing else is blocked. Delete that section once applied.

Version policy: start at 0.1.0 — pre-1.0 signals the API may still move, so
minor bumps may break. The two packages version INDEPENDENTLY: tokens is a
build-time devDependency of ui (CSS inlined at build), so a tokens release
does not force a ui release — but a token change that alters rendering needs a
ui release too, since the inlined copy only refreshes when ui rebuilds.
`access: public` is set in .changeset/config.json because scoped packages are
private by default and would otherwise be rejected at publish.

## 2026-07-30 — publint passes without a repository field

Context: PROGRESS.md warned that publint might flag missing repository/README
in the tarballs.
Decision/finding: it does not — publint checks packaging correctness (exports,
types, file presence), not metadata completeness. READMEs and LICENSEs were
added for consumers, not to satisfy a gate. npm includes README/LICENSE in
tarballs automatically, without listing them in `files`.
Consequence: no gate depends on the repository field, which is what makes the
"omit for now" choice cost-free.

## 2026-07-30 — graphify: relationship graphs generated from source, gated on drift

Context: the repo's relationships (workspace deps, module coupling, token
layering, export surface) were described in prose across several docs. Prose
diagrams rot silently — the moment they disagree with the code they actively
mislead, which is the exact failure mode CLAUDE.md warns about for stale
context files.
Decision: scripts/graphify.mjs derives the graphs from source — package
manifests, relative imports under packages/ui/src, and `{reference}` values in
tokens.json — and writes docs/ARCHITECTURE.md as Mermaid. `pnpm graph`
regenerates; `pnpm graph:check` fails when the committed file no longer matches
the source, and runs in CI's lint job. Zero new dependencies: Node built-ins
plus a regex parser, which is only safe because it reads this repo's own
controlled source (documented in the file header). Mermaid renders natively on
GitHub, so there is no build step and no viewer to install.
Rejected: dependency-cruiser / madge (new dependencies for a job a ~250-line
script does, and both would still need custom grouping to be readable);
hand-drawn diagrams (rot); generating at build time into dist (this is
contributor documentation, not a shipped artifact).
Consequence: docs/ARCHITECTURE.md is GENERATED — never hand-edit it. Adding a
new top-level directory under src/ needs a LAYER_OF/moduleIdFor update, or the
node lands in the wrong subgraph.

Three parser bugs were found and fixed while building it, each worth knowing if
the script is ever extended: (1) directory specifiers (`./theme`) resolve to a
single path segment and were mistaken for the barrel, silently dropping that
edge; (2) src/test/setup.ts was rendered as a component; (3) type-only imports
were drawn as runtime edges, making theme↔components look like a dependency
cycle. It is not one — defaultProps imports component prop TYPES to key
ThemeComponentDefaults, and those edges vanish at compile time. They are now
drawn dotted, and the doc explains the distinction. Subgraph ids are prefixed
`layer_` because the `theme` layer would otherwise collide with the `theme`
module node and break the diagram.

## 2026-07-30 — Interactive map: hand-rolled SVG force layout, no graph library

Context: the Mermaid output in ARCHITECTURE.md is static — good for review in a
diff, useless for exploring ("what does Select actually pull in?"). An
interactive map needs layout, hit-testing, and filtering.
Decision: scripts/graphify-html.mjs emits docs/graphify.html — one
self-contained page (~33 kB, zero external requests) with a ~200-line vanilla
force-directed layout in SVG: three switchable views, drag, zoom/pan,
neighbour highlighting, text filter, a type-only-edge toggle, a detail panel,
and a light/dark switch. The palette is resolved from tokens.json at
generation time, so the map is themed by the design system it describes.
`pnpm graph:serve` (scripts/serve-docs.mjs, a ~40-line static server) opens it
without a build step.
Rejected: D3/cytoscape/vis (new dependencies for a graph of tens of nodes, and
the CDN route would break offline and under strict CSP); Mermaid-only (not
explorable); a Storybook page (couples contributor docs to the component
workshop). O(n²) repulsion is deliberate — at 16 nodes a quadtree is
complexity with no payoff.
Consequence: graphify.html is GENERATED and in .prettierignore (formatting it
would fight the drift check). `pnpm graph:check` now diffs BOTH outputs.

Three bugs found by driving the page in a real browser, all worth remembering:
(1) `svg { height: 100% }` inside a flex child collapsed to 0 — a percentage
height needs a definite parent height; the SVG is now absolutely positioned.
(2) At a 280x299 viewport the wrapped header was TALLER than the viewport, so
`main` got zero height and the graph vanished; body is now min-height (page
scrolls) and #stage has a `max(20rem, 55vh)` floor. (3) Search and selection
fought each other — with a node selected, the neighbour dimming hid every
search match outside its neighbourhood; a query now wins over the highlight.
A fitToView() pass after each layout keeps every node on screen at any size.

## 2026-07-30 — Generated files: commit the verified ones, ignore build output

Context: three kinds of generated artifact now exist, and "is it generated?"
turns out to be the wrong question to ask about gitignore.
Decision: the test is whether something VERIFIES the file.

- storybook-static/, packages/*/dist/, *.tgz → gitignored. Nothing checks them,
  they rebuild in seconds, and they bloat clones.
- docs/ARCHITECTURE.md + docs/graphify.html → COMMITTED. `pnpm graph:check`
  diffs the committed copies against freshly generated output; gitignoring them
  means a clean CI checkout has no files to compare, so the job fails on every
  run. Verified empirically by removing graphify.html and watching graph:check
  fail. They are also the deliverable: the graph diff is reviewable in a PR and
  the map opens straight from a clone.
- All .md stays committed, including generated CHANGELOG.md.
  Diff noise — the real cost of committing generated files — is handled by a new
  .gitattributes marking both `linguist-generated=true` (GitHub collapses them in
  PRs and drops them from language stats), NOT by gitignoring them.
  Consequence: .gitattributes also sets `* text=auto eol=lf`. The repo is authored
  on Windows and CI is Linux; without it a contributor with core.autocrlf=true
  gets CRLF working files and `pnpm format:check` fails on every file. Also fixed
  in the same pass: .claude/settings.local.json (per-machine, was unignored and
  would have been committed), *.tsbuildinfo (smoke apps use incremental:true),
  and .eslintcache. .claude/launch.json stays committed deliberately — shared
  preview configs belong in the repo.

## 2026-07-30 — Adopted the Jul-2026 design-system palette (newtoken.json)

Context: a new token export (newtoken.json) replaced the hand-written token
set. It is a different system, not an addition: `grey` not `gray`, semantic
colours under `<platform>.<scheme>.color.*` (web/mobile x light/dark), a
richer action vocabulary (6 intents x bg / bg-hover / bg-pressed / bg-soft /
fg-on-solid / fg-on-soft / border), named font sizes (xxs…display) replacing
1–7, and border widths named hairline/thick/selected/icon/focus. 32 of the 68
tokens the components used had no equivalent.
Decisions (user's calls): full migration rather than re-pointing values; keep
web AND mobile emitted separately even though they are byte-identical today;
switch Text's `size` prop to the named scale.
Emission: primitives + web-light at `:root`, then `[data-theme="light"]`,
`[data-theme="dark"]`, `[data-platform="mobile"]`, and
`[data-platform="mobile"][data-theme="dark"]`. Semantic names drop the
platform/scheme prefix so component CSS is written once. The build asserts
every platform/scheme declares the same token set.

**src/tokens.json is treated as READ-ONLY** — the design system's export,
reproduced verbatim. It ships 40 tokens with `"value": null` ("No Figma
counterpart - kept as placeholder"), including ones the library depends on:
space.11, z.overlay, motion.easing.standard, focus.ring-width/offset,
elevation._, and all 32 color.feedback._ entries. Rather than edit the source,
the build SKIPS null tokens (`--ui-x: null` is invalid CSS and would drop the
whole declaration) and components use `var(--token, fallback)` where the value
is needed. Each fallback is a real token where one exists — focus ring width
falls back to border-width.focus, its offset to space.0-5, coarse-pointer
height to space.12 — so the fallbacks go inert automatically the day the
placeholders are filled. Badge/Text intent colours use the action.*.bg-soft /
fg-on-soft pairs instead of the null feedback group.
Rejected: filling the placeholders in the source (the user asked for the file
as supplied, and edits would be overwritten by the next design export).

Two apparent data errors in the supplied file, worked around rather than
edited, and worth raising with the design team: `cards.background` is
`{grey.900}` in LIGHT and `{grey.100}` in dark — inverted, so cards would
render dark-on-white; and `divider.strong` is `{red.500}` where the rest of
that group is greys. Component surfaces therefore use `surface.page`, and
"strong" borders use `border.hover`.
Also fixed: `cssName` now replaces dots, because `space.0.5` emitted
`--ui-space-0.5`, and a dot is not valid in a CSS identifier — browsers drop
that declaration silently.

## 2026-08-04 — Banner from Figma: intent triple, consumer content, drawn close glyph

Context: first component implemented from a live Figma handoff (file "vk uig",
page "Component · Banner🟢", component set 12:12249, four Intent variants) via
the figma-console MCP. The Figma bindings were read from boundVariables and
mapped to repo tokens by hex, not eyeballed.
Decisions:

- Figma's "Error" intent is `danger` in code — the token vocabulary
  (action.danger.*) and Badge's tone union already use danger; a second name
  for the same color set would be drift. Union: info | success | warning |
  danger, default info, themeable (Banner.intent in ThemeComponentDefaults).
- Intent colors are each group's soft triple, exactly as bound in Figma:
  bg-soft (surface), border, fg-on-soft (title + currentColor icon).
  Info maps to action.primary (Figma binds the same blue variables).
  Description is text.secondary in every intent (also per Figma). Dark mode
  needed zero component CSS — verified in Storybook.
- Figma's TEXT/BOOLEAN part props (Title, Description + Enable flags, Icon
  Enable, Primary/Secondary Action Enable) become ReactNode props: title
  (required), children (description; omit = no block), icon, actions.
  The library ships no icon assets and no button copy, so icon content and
  action buttons are consumer-provided — the banner only lays them out.
  Figma's styled Primary/Secondary Action sub-components are NOT rebuilt;
  consumers compose the existing Button.
- Close: rendered only when onClose is set; the x is two rotated currentColor
  bars (space-3 x border-width-icon — Select's border-drawn caret precedent).
  closeLabel is deliberately NOT defaulted ("Dismiss" would be hardcoded,
  unlocalized copy); it is documented as required with onClose.
- Live-region role by default: status for info/success, alert for
  warning/danger, overridable via the native role prop.
- slotProps only (icon/content/title/description/actions/close), no slots:
  every part is already ReactNode-driven, so a render-prop surface would
  duplicate the props. Select stays the slots reference.
  Rejected: native `title` attribute kept alongside (collision — Omit'd like
  Input's size); per-intent default icons (hardcoded content rule).
  Consequence: `title` as a tooltip is unavailable on the root; consumers who
  need it use slotProps or a wrapper.

## 2026-08-04 — Breadcrumbs + Modal + Blanket from Figma; focus trap and scroll lock as utils

Context: second Figma handoff batch (pages "Component · Breadcrumbs🟢" and
"Component · Modal"; Popover/Tooltip explicitly out of scope). Figma's
Breadcrumbs is three component sets (Breadcrumbs / Breadcrumb Item /
Breadcrumb Overflow); in code they are ONE public component with internal
parts — Item and Overflow exist only as classes on the override surface.
Modal's composition revealed its dependent component: Blanket (Figma
component 12:18687), shipped as a standalone public component that Modal
composes. Variables were resolved to token NAMES via the plugin API, not by
hex — the component pages render in dark mode, so hex-matching would have
picked dark-scheme primitives.

Breadcrumbs decisions:

- Items are data (`items: BreadcrumbsItem[]`, root first; last = current
  page, rendered as `span[aria-current="page"]`, never a link). Router links
  go through `slots.link` (render prop receiving pre-merged className and
  children) — the zero-workaround answer for Next/Remix `<Link>`.
- States per Figma bindings: default text.secondary; hover text.primary +
  underline; press action.primary.bg + underline; focus ring uses
  color.focus.ring (the design binds focus/ring here, not border.focus —
  ring width/offset keep the library-standard placeholders+fallbacks, a
  deliberate 3px-vs-Figma-2px consistency choice). Separator chevron and
  overflow dots are border/box-shadow drawings in currentColor (no icon
  content); separator colors text.tertiary.
- Figma's truncationWidth boolean variant became `truncateWidth?: string`
  (any CSS length; unset = no truncation) — a dimension prop instead of a
  banned boolean style flag; it feeds the `--ui-breadcrumbs-truncate-width`
  custom property (Figma's own value is 120px).
- collapsed=true renders first crumb · overflow trigger · current page
  (>2 items only); the trigger expands the trail. Controlled
  (`collapsed`/`onCollapsedChange`) + uncontrolled (`defaultCollapsed`).
  `overflowLabel` is required-with-collapse and not defaulted (no hardcoded
  copy). Overflow chip pads 2px/6px where Figma says 3px/6px — 3px has no
  space token; nearest step used.
- No entry in ThemeComponentDefaults: Breadcrumbs has no cosmetic
  variant/size axis, so it does not call useComponentDefaults.

Modal decisions:

- API: controlled only (`open` + `onClose`); title required (aria-labelledby),
  description → aria-describedby, children = scrollable body, footer =
  consumer Buttons (Figma's footer instances ARE the design-system Button),
  `icon` consumer-provided. `closeLabel` + `onClose` together gate the close
  button (Has Close Button ≈ closeLabel presence; localizable, no default).
- Size axis (sm 400 / md 600 / lg 800 / xl 968 / fullscreen) maps to
  max-widths declared as component custom properties `--ui-modal-size-*` on
  the panel: tokens.json is a READ-ONLY design export with no modal-width
  scale, so these rem literals live in component CSS as the documented
  override surface (extends the Select POPUP_OFFSET_PX precedent). Figma's
  default Size is Small → default size='sm'. fullscreen fills the padded
  viewport both ways.
- Appearance (default/warning/danger) tints ONLY the icon slot, exactly as
  bound in Figma (action.warning/danger.fg-on-soft); title/panel are
  unchanged. Default renders no intrinsic icon — no shipped assets.
- Behavior lives framework-free under utils/: focusTrap.ts (getTabbables +
  nextTrapTarget; visibility is NOT probed — offsetParent is unreliable in
  test DOMs) and scrollLock.ts (body overflow + scrollbar-width padding
  compensation, restore-exact). Escape + Tab handling attach to document
  while open, so focus that escapes the panel is recaptured. Focus goes to
  the first tabbable (panel fallback via tabIndex=-1) and returns to the
  opener on close. Sibling content is NOT aria-hidden/inert — aria-modal is
  the line; revisit if SR testing demands more.
- Portal targets the nearest [data-theme] via a hidden anchor span rendered
  in place (Modal has no trigger element to walk up from — Select's
  mechanism, new anchor trick). Verified live: dark-scoped story panel
  renders the dark surface inside the wrapper.
- Blanket: surface.overlay carries its alpha (rgba scrim per scheme) so the
  fill is used directly; backdrop blur is blur(var(--ui-blur-standard,
  var(--ui-space-2))) — the blur token exists in Figma but not in the token
  export, and space-2 equals the design's 8px exactly (inert-when-filled
  fallback). Blanket is aria-hidden; inside .ui-modal its z-index is
  neutralized so DOM order stacks panel above scrim.
  Rejected: building Modal on native <dialog>/showModal (its top-layer and
  focus behavior vary across the support matrix and bypass the [data-theme]
  portal mechanism; revisit when the floor rises).

## 2026-08-05 — Repository links and GitHub changelog generator applied

Context: the repo was pushed to github.com/vihaanvegam/vegam-ui, unblocking
the deferred repository-link configuration from RELEASING.md section 2.
Decision: apply the full reversal now — `repository`/`homepage`/`bugs` in both
package.json files (with `directory` for monorepo subfolder links),
`@changesets/changelog-github` as the changelog generator, and a
`.github/workflows/release.yml` that opens version PRs and publishes on merge.
Consequence: `changeset version` now requires `GITHUB_TOKEN` in the environment
(locally: `export GITHUB_TOKEN=$(gh auth token)`; CI gets it from
`secrets.GITHUB_TOKEN`). CI publish requires `NPM_TOKEN` secret. RELEASING.md
section 2 deleted since it is now applied.
