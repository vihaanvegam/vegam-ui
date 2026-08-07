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

## 2026-08-06 — Full-library blueprint: one core package, 38-component catalog, Storybook-as-docs, icons planned

Context: the owner asked for the path to a full-featured library (MUI-class
capability), with infrastructure fixed before mass component building and the
plan living in the repo for future sessions. Four scope questions were put to
the owner; their calls:

- **One core package.** `@vegam-ui/ui` keeps components + hooks + theme +
  utils; no MUI-style core/theme/hooks/utils package split ("no need to
  mandatorily follow MUI"). Rejected: the split — every published package
  re-pays the expensive part of this repo (exports maps, dual declarations,
  attw/publint/smoke coverage, independent versioning) for no consumer benefit
  at this scale. `hooks/` becomes a new top-level folder inside ui; the
  graphify `moduleIdFor`/`LAYER_OF` update is due in the same commit that
  creates it.
- **Core catalog first.** 26 new components committed across four waves
  (layout → forms → overlays/feedback → nav/data), 38 total. Heavy widgets
  (DatePicker, DataGrid, Autocomplete…) are explicitly Tier-Later; promotion
  is a user decision. Existing names are canonical — Banner=Alert,
  Modal=Dialog, Chip=Tag — never build duplicates under MUI's names.
- **Storybook is the docs site.** Invest in the deployed Storybook (MDX page
  per component, Getting Started/Theming guides). Rejected for now: a
  dedicated docs site (new dependencies, a second deploy surface).
- **`@vegam-ui/icons` planned (Phase 5).** Tree-shakeable per-icon modules,
  NO `'use client'` (stateless SVG functions are server-component-safe), and
  ui never depends on icons — that would break ui's zero-runtime-deps
  invariant. Codegen tooling (hand-rolled vs SVGR) stays an open decision and
  a dependency ask.

Artifacts: docs/BLUEPRINT.md (catalog, phases 0–6, component specs,
conventions, open decisions, 1.0 criteria; status ticks are the only routine
hand-edits) and packages/tokens/TOKENS_PLAN.md (inventory, the 40 null fills
prioritized with current fallbacks, new-token requests per phase, the two
export data errors; `files: ["dist"]` keeps it out of the npm tarball).
CLAUDE.md ritual + Where-things-are now point at both; its stale Release
paragraph (predating the 2026-08-05 repository-links entry) was corrected in
the same pass. REMAINING.md §4 is superseded for roadmap purposes.
Consequence: sessions pick work from BLUEPRINT phase order; catalog/scope
edits require the owner, who also wants a question asked before significant
work starts — that preference is recorded in BLUEPRINT's usage rules.

## 2026-08-06 — Token schema migration: theme/platform/viewport/component tiers

Context: the owner replaced tokens.json wholesale (1942 → 718 lines). Every
null placeholder except space.11 is filled, and the semantic tree moved from
`<platform>.<scheme>.color.*` to four tiers — `theme.<scheme>` (scheme
semantics + composed elevation shadows per scheme), `platform.<web|mobile>`
(sizes, typography, text-contrast selection), `viewport.*` (columns, margins,
gutters, content-max per breakpoint), `component.*` (design-parity aliases) —
plus new primitives (full z scale, elevation geometry, enter/exit/linear
easings, blur, radius xxl/xxxl, space 2.5/14/20/24, breakpoint.mobile) and
REDRAWN grey/blue/yellow ramps. Owner's calls: migrate now as-is; keep the
cards/divider workarounds (both data errors are still present); line-height
comes from the platform typography where it fits.

Build decisions (build.js rewritten):

- Emission order: `:root` (primitives incl. viewport/component + theme.light +
  platform.web) → `[data-theme="light"|"dark"]` → `[data-platform="web"|
"mobile"]`. Platform blocks come LAST so an element carrying both attributes
  gets the platform's selection substituted with the active scheme's values.
- Variant-named references (`{theme.light.x}`, `{platform.web.y}`) emit with
  the tier/variant prefix stripped — the export's own "swap the theme segment"
  comments realized as scheme/platform-relative `var()` targets.
- **CSS discovery worth remembering: a `var()` inside a custom property is
  substituted at the element where that custom property is DECLARED, and
  descendants inherit the RESOLVED value.** An alias declared only in `:root`
  therefore freezes its light/web value inside a scoped `[data-theme="dark"]`
  wrapper — ThemeProvider's exact mechanism. No gate catches this; it was
  found with an in-browser probe. Fix: transitive axis analysis over the
  reference graph — every token whose chain reaches a theme/platform token is
  re-declared (identical text) in every block of that axis; declaration
  position, not text, selects the variant. Verified live: dark island resolves
  grey.100, mobile+dark composes to white (mobile high selection, dark
  values). Documented limit: a theme island nested inside a scoped mobile
  region falls back to the web text selection — acceptable while nothing in
  the React API sets data-platform.
- Set asserts are now bidirectional and per tier: theme.light ↔ theme.dark and
  platform.web ↔ platform.mobile (replaces the old one-way web.light check).

Component decisions:

- Text colors consume the platform tier (`--ui-text-primary/-secondary/
-tertiary`) so mobile's high-contrast selection applies automatically;
  disabled/placeholder/on-accent stay on `--ui-color-text-*`.
- Line-height (owner's call): fixed body-size text (Banner description,
  Breadcrumbs links, Select options, Modal description/body) uses
  `--ui-typography-body-line-height`; multi-size elements (Input/Select
  triggers, Text's ladder) and single-line/heading ratios keep unitless
  literals (1 / 1.25 / 1.5) — theme-invariant typography, extending the
  2026-07-29 "semantic tokens scoped to colors" reasoning. The removed
  font.line-height ratio scale is deliberately NOT requested back.
- z remap: Blanket → z.overlay (400), Modal → z.modal (500), Select popup →
  z.popover (600), NOT z.dropdown (200): the popup portals outside the modal
  DOM, and popover is the layer the design marks "can open from inside a
  modal". Dropdown-below-modal is flagged to design in TOKENS_PLAN §4.
- Now-real tokens dropped their fallbacks (focus ring, easing, elevation,
  blur); space.11 keeps its fallback chain (still null). The dead
  `--ui-border-width-focus` fallbacks were removed (token renamed away).
- Stories: nine files still referenced the pre-Jul-2026 `--ui-color-bg-canvas`
  (silently no-op since that migration) — fixed to surface.page. The token
  gallery's matchers and preview vars were updated for the new tiers (grey
  not gray; composed elevation split from geometry; z/viewport/opacity/
  component sections added).
- `packages/tokens/src/tokens.json` added to .prettierignore: the export is
  reproduced verbatim, and prettier reformatting it would fight every future
  export (graphify.html precedent).

Deferred: moving Banner/Badge/Text intent colors from the action.\* soft pairs
onto the now-filled feedback.\* names — byte-identical values today, so the
rename ships with a future batch.
Consequence: tokens is a breaking release (renames, removals, value changes —
minor while 0.x per RELEASING policy), ui ships alongside since its inlined
CSS only refreshes on rebuild. Chromatic baselines shift wholesale — the
palette itself changed.

## 2026-08-06 — @vegam-ui/icons planned in detail: hand-rolled codegen, Phase-5 order kept, dev-only docs edge

Context: the owner picked "Plan @vegam-ui/icons" as the next work item.
docs/ICONS_PLAN.md now holds the full build plan (consumer contract, API,
codegen, packaging, gate changes, Storybook integration, build order). The
Figma Desktop Bridge was offline during planning, so the icon inventory is
documented as the first build-time step rather than enumerated in the plan.
Three calls were put to the owner:

- **Codegen (§8.2 RESOLVED): hand-rolled zero-dependency script.**
  packages/icons/scripts/build-icons.mjs validates and normalizes the exported
  SVGs (currentColor, camelized attributes) and emits committed TSX + barrel +
  manifest, gated by an `icons:check` drift check in CI (graphify precedent).
  Rejected: SVGR — new devDependencies and config surface for a job a
  ~150-line script does, and it would still need a custom template for the
  forwardRef/size/title API.
- **Sequencing: Phase 5 keeps its place.** The plan is authored now; the
  build waits behind Phases 0–4. Rejected: building next, or scaffolding a
  pilot now — nothing downstream needs icons early, and Phase 0 foundations
  stay first per BLUEPRINT's own ordering rule.
- **Docs coupling: @vegam-ui/icons may be a devDependency of packages/ui for
  stories/MDX only** — the tokens-as-devDependency precedent. Story files
  never enter dist, so ui's zero-runtime-deps invariant and "ui never depends
  on icons" (a runtime rule) both stand; the graph will show a dev-only edge.
  Rejected: full icon-freedom (the gallery would need generated inline-SVG
  stories that drift from the published package).

Two design points fixed in the plan, worth surfacing here: **no `useId`
anywhere in icons** — it is a hook and would break the package's headline
server-component compatibility; the accessible-name path is a direct `<title>`
child + `role="img"`, which needs no ids. And the icon size ramp's true order
is xxs(12) < sm(16) < md(20) < lg(24) < **xxl(28) < xl(32)** — the Aug-2026
export added xxl as the 28px rung between 24 and 32, so the `size` prop union
preserves token names and the docs must show the ramp, not alphabetical
intuition.

Consequence: BLUEPRINT §8.2 is marked resolved and Phase 5 points at the plan;
CLAUDE.md's Where-things-are lists it. When Phase 5 opens: Figma inventory
first (owner approves the initial cut), then scaffold + pilot + full set per
ICONS_PLAN §7.

## 2026-08-07 — §8.1 resolved: breakpoints are annotated literals with one drift-tested JS home

Context: CSS media queries cannot read custom properties, and the JS
breakpoint hooks need the same four values — some duplication of
`breakpoint.*` is unavoidable; the question is where it lives and how it is
policed. Decision (owner's call): rem literals at the four bounds only.
Every CSS media query carries the token name as a comment
(`@media (min-width: 48rem)` + `/* --ui-breakpoint-tablet */`), and
`packages/ui/src/utils/breakpoints.ts` is the single JS home
(`breakpointWidths` / `breakpointOrder` / `Breakpoint`), consumed by
`useBreakpoint` and exported from the barrel. A unit test reads tokens.json
and fails on divergence, so the duplication cannot drift silently — the same
shape of documented deviation as "semantic tokens scoped to colors"
(2026-07-29).
Rejected: a PostCSS `@custom-media` step (new dependency wired into both the
library build and the Storybook build, and no answer for the JS side).
Consequence: a breakpoint change in a future token export turns the drift
test red — the desired failure mode; update breakpoints.ts and the annotated
CSS literals together. `breakpoint.mobile` (22.5rem) is a baseline artboard
width, not a query bound, and deliberately has no entry.

## 2026-08-07 — §8.6 resolved: all five hooks are public API

Decision (owner's call): `useControlled`, `useMediaQuery`, `useBreakpoint`,
`useDismiss`, and `useTransitionState` export from the barrel alongside
`useIsomorphicLayoutEffect`, together with the `Breakpoint`,
`ResponsiveValue`, `ResponsiveObject`, `UseDismissOptions`,
`TransitionState`, and `UseTransitionStateResult` types and the
`breakpointWidths` / `breakpointOrder` constants. Consumer-useful, fully
JSDoc'd, and shipping now means Phases 1–4 exercise the exact API consumers
get. `resolveResponsive` / `responsiveStyleVars` stay internal until Box
(Phase 1) proves the shape.
Rejected: internal-only (no feedback loop) and a state-hooks-only subset
(overlay hooks would then ship untested by consumers in Phase 3, their
riskiest phase).
Consequence: minor changeset (`gentle-hooks-arrive`); hook signatures are now
under the pre-1.0 semver stance — changing one is a version event.

## 2026-08-07 — Storybook docs: @storybook/addon-docs + autodocs via react-docgen-typescript

Context: Phase 0.4 (Storybook-as-docs, §6) needs MDX pages and generated
prop tables; the installed Storybook had no docs addon. Decision (owner
approved the new devDependency): `@storybook/addon-docs` in packages/ui,
with `tags: ['autodocs']` in preview.ts — every CSF file gets a generated
Docs page, and an attached MDX page replaces it where one exists. Prop
tables use `reactDocgen: 'react-docgen-typescript'` with a `propFilter`
dropping node_modules-inherited props, so tables show OUR unions/JSDoc/
defaults instead of hundreds of native DOM attributes.
Landmine: addon-docs resolved to 10.5.6, which peers `storybook ^10.5.6`
against the installed 10.5.5 — the Storybook family was updated to 10.5.6
within its existing `^` ranges (patch-level; the guarded pins are majors).
`pnpm peers check` still exits 1 from PRE-EXISTING `@napi-rs/wasm-runtime`
alpha-range peers (`@emnapi/*`) deep in the toolchain — verified untouched by
this install (no emnapi lines in the lockfile diff); noise, not a gate.
Artifacts: Button.mdx is the §6 per-component template (what/when-not ·
import · usage · props · a11y · theming); Guides/Getting Started and
Guides/Theming under `src/docs/` (.mdx only — invisible to graphify's .ts
walk); storySort pins Guides first.

## 2026-08-07 — hooks/ built by extraction; graphify layering now path-based (two silent regressions found)

The Phase 0.1 layer, extracted rather than invented: `useControlled` (the
`value !== undefined` pattern Select and Breadcrumbs hand-rolled — both now
use the hook, hand-rolls deleted); `useMediaQuery` + `useBreakpoint`
(`useSyncExternalStore`; server snapshots `false`/`'base'` so hydration never
mismatches); `useDismiss` over new framework-free `utils/dismiss.ts`
(Select's outside-pointerdown handling extracted; its Escape stays in the
combobox keydown via `escape: false`); `useTransitionState` (`exited →
entering → entered` / `exiting → exited` driving `data-state` CSS;
`durationMs` must equal the CSS motion token's value; reduced motion snaps to
end states). `useIsomorphicLayoutEffect` MOVED from utils/ to hooks/ — it is
a hook, and utils/ bans React types; the barrel export is unchanged so
consumers see nothing. `utils/responsive.ts` (`ResponsiveValue`,
`responsiveStyleVars`) lands ready for Phase 1 Box.

Deliberate behavior nuance: `observeDismiss` skips `defaultPrevented` events
so nested surfaces can claim their Escape/pointer first. Consequence: an
outside pointerdown some other component preventDefault'ed no longer closes
Select's popup (noted in the changeset).

Two silent regressions surfaced while wiring the graph:

1. **LAYER_OF was a hardcoded name list and had rotted** — focusTrap and
   scrollLock (added 2026-08-04) were drawn inside the `components` subgraph.
   Layers now derive from the path prefix and warn on unknown folders; the
   failure mode is loud instead of wrong.
2. **graphify.html's chrome palette was all-black since the token
   migration** — its LIGHT/DARK maps still resolved pre-Aug-2026
   `web.<scheme>.color.*` paths, and resolveToken's `?? '#000'` fallback
   swallowed the misses. Paths now target `theme.<scheme>.color.*` (text via
   the `-standard` contrast pair). Worth remembering: `graph:check` verifies
   determinism, not correctness — resolveToken fallbacks are a blind spot no
   gate covers.

Also for the file: vitest's transform makes `import.meta.url` a non-file URL
on Windows, so the breakpoints drift test locates tokens.json from
`process.cwd()` candidates instead of `new URL(…, import.meta.url)`.

## 2026-08-07 — Phase 1 layout primitives: build-time calls

Box, Flex, Grid, Container, Divider shipped per BLUEPRINT §4; the decisions
the spec delegated to build time:

- **Sparse ResponsiveObject (deviation from the §0.2 sketch).** The blueprint
  wrote `{ base: T; tablet?: T; … }` with base required; shipped as ALL keys
  optional — `{ tablet: 4 }` means "from tablet up", which the CSS fallback
  chains support naturally and base-required cannot express. Since token-key
  unions are never objects, "is an object" IS the scalar/object
  discriminator. Caught by the first Box tests: the base-required detection
  (`'base' in value`) silently treated sparse objects as scalars and emitted
  `var(--ui-space-[object Object])`.
- **Box implementation**: physical prop NAMES (`pl`/`pr`, per §4) map to
  LOGICAL properties (`inline-start`/`inline-end`, per §5) — `pl` is "left in
  LTR". Side > axis > all precedence is resolved per breakpoint in JS
  (upward-inheritance aware, deduped against the previous bound), emitting
  one var family per side; static CSS carries 5-deep fallback chains per
  media block. `borderColor` presence adds a `ui-box--bordered` class drawing
  a hairline solid border — §4 named no width, `border-width.hairline` is the
  system's default-border width. `as` is a curated non-interactive union
  (Text precedent), not ElementType. No ThemeComponentDefaults entry — Box
  values are per-instance layout, not app-wide cosmetics.
- **Grid columns model (§4 said implementer picks one): explicit responsive
  `columns`** — matches the catalog's own note; `minChildWidth`
  auto-fill/minmax rejected (both models in one API double the surface;
  auto-fill is expressible via className when needed). `rowGap`/`columnGap`
  override `gap` per axis by declaration order.
- **Container**: `size` picks the `viewport.<size>.content-max` cap;
  inline padding always tracks the CURRENT breakpoint's `viewport.*.margin`
  (base = mobile margin) — a capped page still gets correct page margins on
  every screen. Default size `desktop` (the design target). `Container.size`
  registered in ThemeComponentDefaults; `gutter` tokens stay unused until
  Grid inside Container proves a need.
- **Flex**: container props responsive; `grow`/`shrink`/`basis` static
  (styling the Flex as a flex ITEM — unitless factors are ratios, not
  dimension literals, so no token needed; `basis` takes a space step or
  `auto`). No padding/margin surface — compose with Box; Stack untouched as
  the simple sibling. `Flex.gap`/`Grid.gap` registered in
  ThemeComponentDefaults (Stack.gap precedent).
- **Divider**: horizontal = native `<hr>`; vertical = `div role="separator"
aria-orientation="vertical"` (hr is semantically horizontal-only). Tones
  `subtle`/`default`/`accent` only — `strong` is the red.500 data error
  (TOKENS_PLAN §4) and `on-dark-surface` has no use case yet; the tokenScales
  drift test asserts this exclusion EXPLICITLY so a corrected export turns it
  red and forces the re-decision. `Divider.tone` registered in defaults.
- **utils/tokenScales.ts** is the one home of token-key unions
  (space/radius/surface/border/elevation/divider), runtime arrays deriving
  the types, drift-tested against tokens.json, and exported from the barrel
  for consumers. §5's remaining conventions (logical properties,
  new-component checklist) folded into COMPONENT_RECIPE in the same pass.

Consequence: the responsive machinery (`ResponsiveValue`,
`responsiveStyleVars`, annotated media-query chains) now has five real
consumers; changeset `proud-layouts-arrive` (minor). Library: 17 components.

## 2026-08-07 — Phase 2 forms: FieldContext, and what four rounds of verification caught

Field, IconButton, Textarea, Radio+RadioGroup, Switch, Slider shipped with
`utils/drag.ts`. Design calls:

- **Field owns the wiring, controls consume it.** `FieldContext` carries
  `controlId`/`labelId`/`describedBy`/`invalid`/`required`/`disabled`;
  controls read it with **explicit props always winning** (the destructuring
  default `id = field?.controlId` pattern). `useField()` is PUBLIC so
  consumer-built controls join the same contract. Error PRESENCE is the
  single source of invalid — there is no `invalid` prop to desynchronize
  from the message (Input's 2026-07-29 aria-invalid entry, generalized).
  The required marker is a slot, never a shipped `*`.
- **Two label mechanisms, deliberately.** Labelable controls (Input,
  Textarea, Checkbox, Switch, Select's button) take `htmlFor`→`id`; group and
  composite widgets (RadioGroup, Slider) take `aria-labelledby`→`labelId`
  instead, because a group has no single labelable control. Field emits
  `htmlFor` unconditionally, which is inert for the latter two — verified
  harmless, not a bug.
- **Radio keeps the native input** (arrow-key roving and single-selection are
  the platform's, not re-implemented) and draws only its appearance: the
  checked ring is `border-width.selected`, the token cut for exactly this.
  `forced-colors` restores the UA rendering, since a gradient dot vanishes
  when backgrounds are stripped. Same pattern for Switch, which is a native
  checkbox with `role="switch"` and its track/thumb painted on the input
  itself — no wrapper, so ref/className/rest all land on the real control.
- **IconButton composes Button's classes** rather than duplicating them, so
  the two cannot drift; its accessible name is REQUIRED **at the type level**
  via a union (`{'aria-label': string} | {'aria-labelledby': string}`) —
  omitting both is a compile error, not a runtime hope. Default variant
  `ghost`, not Button's `primary`.
- **Textarea autosize is opt-in** via `minRows`/`maxRows` (fixed `rows`
  otherwise), and disables the resize handle so manual dragging cannot fight
  the measurement.

**Four real defects, none caught by the unit suite:**

1. **Slider drag went stale mid-gesture** (found by driving a real browser).
   The move handler is created once at pointerdown, so `commit`'s
   `next === current` guard compared against a frozen baseline for the whole
   gesture — dragging back to where the gesture started was silently dropped.
   jsdom passed because the assertions never returned to the start value. Fix:
   the guard reads `valueRef.current`, which `commit` updates synchronously
   (a gesture fires many moves before React re-renders). **Lesson: a stale
   closure in a drag handler is invisible to tests that only move forward.**
2. **Slider misrouted widget ARIA** (multi-agent review, confirmed by two
   independent lenses). `{...rest}` spreads on the roleless root while
   `role="slider"` is on the thumb, so `aria-valuetext` — APG-required
   whenever the number is not the user-perceivable value — type-checked,
   rendered, and was dropped from the accessibility tree. Fix:
   `aria-valuetext` and `aria-errormessage` route to the thumb;
   `aria-orientation` is Omit'd from the props (horizontal-only, so it must
   not claim otherwise). Slider was the only component where `...rest` did
   not land on the role-bearing element — Select/Checkbox/Switch all do.
3. **Slider's ref-merging callback broke React 19 ref cleanup.** The
   hand-rolled `(node) => {…}` wrapper discarded a consumer cleanup function
   and then called their ref with `null`, which React 19 forbids for
   cleanup-returning refs — leaking one observer per render. Fix:
   `useImperativeHandle`, as every other component already uses.
4. **Textarea froze at its last autosized height** when a consumer dropped
   `minRows`/`maxRows` on a mounted element: the effect returned early
   without clearing the inline `block-size`, which outranks both the class
   rules and `rows`. Fix: clear it in the `!autosize` branch.

`aria-required` is deliberately NOT forwarded to Slider from a Field: it is
unsupported on the `slider` role (a slider always has a value). The lint rule
`jsx-a11y/role-supports-aria-props` caught that one; `label-has-associated-control`
was configured with `controlComponents` (naming our wrappers) rather than
disabled, so the rule keeps checking real cases.

Consequence: changeset `bright-forms-arrive` (minor). Library: 24 components,
403 tests. Bundle budgets re-based (next entry).

## 2026-08-07 — Bundle budgets re-based for the committed catalog

Context: `check:size` failed after Phase 2 (css 70,183B over a 70,000B
budget; cjs likewise). The budgets were written when the library had 12
components; it now has 24 and the committed catalog is 38.
Finding worth keeping: the stylesheet is **~30KB inlined design tokens — a
fixed floor independent of component count — plus ~40KB of component CSS**
(~1.7KB/component, of which Box/Flex/Grid are ~11KB because responsive props
expand into per-breakpoint fallback chains). So the growth is real
component surface, not bloat, and compressing the responsive chains would
reclaim far less than the token floor costs.
Decision: re-base to js 60,000 / cjs 48,000 / css 100,000 — clearing the
projected ~93KB for the full 38-component catalog while still failing on a
doubling. The composition breakdown is written into the script so the next
re-base is an informed decision rather than a bumped number.
Note: `check:size` is NOT wired into ci.yml (only lint/graph/test/gates are),
so this never blocked CI — it is a local signal. Wiring it in is an open
question for the owner.

## 2026-08-07 — Phase 3 overlays: anchored positioning, and the visibility/focus trap

Tooltip, Popover, Menu, Drawer, Toast, Spinner, Progress, Skeleton shipped.
`utils/positioning.ts` gained `computeAnchoredPlacement` (side × align, flip
to the opposite side only when it is genuinely roomier, then shift along the
cross axis) — **floating-ui was not added**, as BLUEPRINT Phase 3 required.
Three new internal hooks carry the shared machinery: `useThemedPortal`
(portal container = nearest `[data-theme]`, extracted from Select/Modal),
`useAnchoredPosition`, and `useTriggerRef`.

Design calls worth keeping:

- **Tooltip vs Popover is a hard split.** Tooltip is `pointer-events: none`,
  `role="tooltip"`, wired by `aria-describedby` — it DESCRIBES, never names,
  and may not contain interactive content. Popover is a click-opened
  `role="dialog"` that may. Both documented with a comparison table.
- **Menu uses roving focus** (§8.4's decision) while Select keeps
  activedescendant. Items are located by `role` rather than per-item refs, so
  `slots.item` output joins the roving order without forwarding a ref.
- **Toast is a provider + hook**, never an importable singleton (§8.3):
  module state would give a dual-package consumer two queues.
- Tooltip renders as an elevated `surface.page` card, not the classic
  inverted-dark chip: component CSS may only use semantic colours and the
  export has no `surface.inverse`. Requested in TOKENS_PLAN §3.

**The bug that mattered most, and why the tests missed it.** A floating
surface is rendered hidden for the one frame before measurement lands. It was
hidden with `visibility: hidden` — which **removes the element from the
accessibility tree AND makes `focus()` a silent no-op**. Every focus call
that ran on the commit where the surface first mounts therefore did nothing:
Menu's roving focus and Popover's initial focus both landed nowhere. The fix
is `opacity: 0` + `pointer-events: none`, which hides without disabling
focus. jsdom cannot catch this class of bug at all (it has no layout and does
not enforce focusability rules), and the browser check I ran first missed it
because I dispatched keydown ON the menu element instead of following the
real user path.

That masked a worse one: **a pointer-opened Menu was completely
keyboard-dead.** Opening by click left `activeIndex = -1`, so focus never
entered the surface; the keydown handler lives on the portalled menu, which
is a React SIBLING of the trigger, so trigger keystrokes never reached it;
and `useDismiss` is deliberately configured `escape: false` (Escape belongs
to the surface so it can restore focus), which meant there was no Escape
handler anywhere. Arrows, Enter, type-ahead, and Escape all did nothing, and
Tab left an orphaned open menu — contradicting the contract Menu.mdx already
documented. The same dead state was reachable by keyboard when every item was
disabled. Fix: focus the surface itself whenever the menu is open with no
active item, which is what its `tabIndex={-1}` was there for.

Twelve more confirmed defects from the same review, all fixed:

- Toast's exit transition was unreachable — the provider deleted the record
  synchronously, so `useTransitionState` never saw a close. Dismissal now
  MARKS the toast `closing` and the item removes itself when the exit ends.
- Both Toast live regions were positioned at the same corner with the same
  z-index, drawing two stacks on top of each other. They are now unpositioned
  children of one fixed container.
- Both regions are `aria-atomic="false"`; without it, adding one toast
  re-announces every toast already in that region ("Saved", "Saved Saved", …).
- `regionProps` was spread AFTER `role`/`aria-live`, letting a consumer
  silently break announcements; it is now spread first.
- Toast centre placements paired logical `inset-inline-start: 50%` with
  physical `translateX(-50%)`, which throws the stack a full width off-centre
  in RTL (measured in headless Chromium). Centering is direction-agnostic, so
  it now uses physical `left` deliberately, with the reason in the CSS.
- Popover restored focus to its trigger on every close, yanking it away from
  wherever the user had moved; it now restores only when focus is still
  inside the closing surface.
- Menu's type-ahead buffer was cleared only by its 500ms timer, so a query
  leaked into the next session; `close()` now resets it.
- The trigger ref was an inline arrow rebuilt every render, so React detached
  and re-attached the consumer's ref constantly (19 invocations in one hover
  cycle) and discarded React 19 ref cleanups. Extracted to `useTriggerRef`.
- `DrawerSlotProps.close` was typed `HTMLAttributes` where Modal/Banner/
  Select use `ButtonHTMLAttributes`, so `slotProps={{ close: { disabled } }}`
  failed to compile on Drawer alone.

Verification note for future sessions: the Browser pane reports
`visibilityState: "hidden"`, so **`requestAnimationFrame` never fires there**
and `useTransitionState` stays at `exited`. Layout, focus, and ARIA are
verifiable in that pane; enter/exit ANIMATIONS are not. Do not read an
opacity of 0 there as a defect.

Consequence: changeset `swift-overlays-arrive` (minor). Library: 31
components, 524 tests.

## 2026-08-07 — Bundle budgets re-based once for the whole catalog

Context: the budgets set earlier the same day (for 24 components) were at
100% of the JS limit again after Phase 3. Rather than bump per phase, they
are now sized for the full committed catalog with the measured curves written
into the script:

- **JS grows ~2.4KB/component and ACCELERATED in Phase 3** — overlays carry
  real logic (positioning, focus management, timers), unlike layout
  primitives. 12 comps ≈ 25KB → 24 ≈ 40KB → 31 ≈ 58KB; 38 projects to ~75-80KB.
- **CSS is ~30KB of inlined tokens (a fixed floor) plus ~1.7KB/component**,
  landing near 95KB at 38.

Budgets: js 92,000 / cjs 74,000 / css 112,000 — roughly 15% over the
projections, still failing on a genuine regression. This should be the last
re-base before 1.0.

## 2026-08-07 — Phase 4 navigation & data: the catalog closes, and a Tabs effect that could not settle

Tabs, Link, Pagination, Accordion, Avatar, Chip, Table shipped — **the §3
catalog is complete at 38 components.** Roving tabindex was extracted to
`hooks/useRovingFocus` and Menu refactored onto it, so there is one
implementation of that pattern rather than two. `nextEnabledIndex` gained an
opt-in `loop`: Tabs wraps at the ends (the APG tabs behaviour) while
Menu/Select deliberately stop, and that difference is now a parameter
instead of two code paths.

**RadioGroup did NOT adopt the hook**, despite the blueprint's note. Its
radios are native inputs, and the platform already gives a same-`name` group
arrow-key roving _and_ selection; layering a JS implementation on top would
have been a regression, not a consolidation. The blueprint line was written
before Phase 2 chose native radios.

Design calls worth keeping:

- **Table performs no data operations** (§8.5): sortable columns emit
  `onSortChange` and reflect `aria-sort`; the consumer owns the data and does
  the sorting. This is what keeps Table honest for server-side and async
  data, where it could not sort anyway. It is also the only component that is
  a GENERIC function — `forwardRef` erases type parameters, so it is
  `forwardRef(TableImpl) as <Row>(props …) => ReactElement`, which keeps
  `Row` inferable in `cell` callbacks while still forwarding a ref.
- **Chip renders sibling buttons** when it is both activatable and
  removable: a button inside a button is invalid HTML and the inner one is
  unreachable.
- **Accordion has no arrow-key navigation.** The APG marks it optional, and
  headers are already reachable via Tab and the screen-reader heading list;
  adding arrows would diverge from native disclosure behaviour for no gain.
- Pagination's ellipsis is inert text, never a disabled button, and gaps only
  appear when they hide more than they cost (`total <= 2*siblings + 5` lists
  every page instead) — found by my own test expecting all five pages.

**Fifteen defects confirmed by adversarial review, all fixed.** The one worth
remembering:

**An effect that emits state can never settle against a controlled owner
that declines it.** Tabs' automatic activation called `onChange` from a
`useEffect` guarded only by `item.value === selected`. When a controlled
parent defers or refuses the change (an unsaved-changes guard, a validation,
an async persist), that guard never closes — and because the deps include
`items` and `onChange`, which are fresh identities under ordinary inline
usage, EVERY subsequent render re-fired `onChange`. A verifier reproduced
"Maximum update depth exceeded" with a handler that set state. Fixed with a
ref that records the last activated index, so selection fires exactly once
per move — selection is a user action, not a derived value. **Memoising
would not have saved it: a library cannot require consumers to `useCallback`
every handler.**

Three more Tabs bugs, all variants of "the selection is stale state rather
than derived":

- The uncontrolled default is captured on the first render, so items arriving
  ASYNCHRONOUSLY left nothing selected, no panel, and every tab
  `tabIndex="-1"` — with the tablist also `-1`, the whole widget fell out of
  the tab order. Found by a review agent's scratch test appearing in my own
  suite run.
- The same happened when the selected tab was REMOVED.
- And when the selection resolved to a DISABLED tab, the only `tabIndex=0`
  was on a button the browser refuses to focus. Fixed by resolving
  `selectedIndex` to the first ENABLED item whenever the stored value matches
  nothing or matches something disabled — display-only, so a controlled owner
  is never fought.
- `useRovingFocus` never reconciled a stale index when `items` shrank,
  leaving nothing focused and nothing tabbable. Now clamped.

**RTL: logical borders paired with a physical `transform: rotate()` is a
trap** — the same class of bug as Toast's centring last phase, and it hit
three components at once (Pagination chevrons, Accordion chevron, Table sort
caret). `border-inline-end` flips under `dir="rtl"` while the rotation does
not, so the drawn glyph mirrors out from under its own transform and a
horizontal arrow becomes a vertical one. Fixed by drawing these glyphs with
PHYSICAL borders (matching the physical transform) and adding explicit
`[dir='rtl']` rules only where the glyph carries direction — verified in a
real browser: Pagination's prev/next rotations swap, Accordion's collapsed
chevron points left, and Table's up/down caret needs no mirroring at all.
**The "always use logical properties" rule has this exception, and it is now
in COMPONENT_RECIPE.**

Also fixed: button-part `slotProps` on Tabs/Accordion/Chip were typed
`HTMLAttributes` instead of `ButtonHTMLAttributes` (the same bug as Drawer
last phase — worth a lint rule if it recurs), and `Link`'s external
new-tab text concatenated without a space ("Docsopens in a new tab") because
the accessible-name algorithm trims each element's text; the separator has to
be its own text node.

Consequence: changeset `clever-navigation-arrives` (minor). Library: 38
components, 653 tests.

## 2026-08-07 — @chromatic-com/storybook addon added (owner-requested)

The owner asked for `npx storybook add @chromatic-com/storybook`. Added as a
devDependency of packages/ui (`^5.3.0`) and appended to `.storybook/main.ts`
addons; nothing else changed.

Worth being clear about what this does and does not change, because
Chromatic was ALREADY here in a different form:

- **Already present, unchanged:** the `chromatic` CLI devDependency and
  `.github/workflows/chromatic.yml`, which publishes the built Storybook on
  every push/PR using `CHROMATIC_PROJECT_TOKEN` and `exitOnceUploaded: true`.
  That is what actually gates visual regressions in CI, and it keeps working
  exactly as before.
- **What the addon adds:** a Visual Tests panel INSIDE the Storybook UI, so
  snapshots can be run and diffs reviewed locally instead of only through the
  CI run. It needs the project linked (a sign-in prompt in the panel, which
  writes a `chromatic.config.json`) before it does anything — installing it
  is not the same as enabling it, and no token was configured here.

Used the `--yes` flag per the 2026-08-07 vitest-addon landmine: `storybook
add`'s postinstall is interactive and aborts silently without a TTY, leaving
a half-edited main.ts that looks complete.

No changeset: devDependency and Storybook tooling only, nothing
consumer-visible (ICONS_PLAN and addon-vitest precedent).

## 2026-08-07 — Storybook Vitest addon; story tests stay out of CI for now

Owner pasted Storybook's "Install Vitest addon" prompt — that is the
dependency approval. `npx storybook add @storybook/addon-vitest` landed
`@storybook/addon-vitest` (10.5.6 family) plus `@vitest/browser-playwright`
and `playwright`; Chromium binaries installed to the local ms-playwright
cache. The wizard restructured vitest.config.ts into `test.projects`, added
the a11y `test: 'todo'` parameter to preview.ts, and created
vitest.shims.d.ts (browser-matcher types).

- **`pnpm test` now runs `vitest run --project=unit`** — the former jsdom
  suite, config preserved verbatim as the named `unit` project. The
  alternative (letting bare `vitest run` execute both projects) would have
  broken CI: the gates job runs root `pnpm test` on ubuntu runners that have
  no Playwright browsers. Scoping the script keeps `pnpm test` meaning
  exactly what it meant; nothing existing changed behaviour.
- **`pnpm test:storybook`** runs the new `storybook` project: every story
  executed as a test in headless Chromium via the addon's `storybookTest`
  plugin (SB 10 auto-loads preview annotations — no vitest.setup.ts file;
  the wizard not creating one is correct, not an omission). 111 tests / 19
  story files, 34s locally. Same tests run from the Storybook UI's testing
  panel — verified live ("Ran 111 tests", all sidebar status chips Success).
- **Open (owner's call): story tests in CI.** Requires a
  `playwright install chromium` step + binary cache in ci.yml before they
  can run there. Queued in PROGRESS next-actions; not done unasked.
- Coverage stays root-level in vitest.config.ts — `pnpm test -- --coverage`
  measures the unit project exactly as before.
- No changeset: devDependencies and tooling only, nothing consumer-visible
  (ICONS_PLAN precedent).

Landmine (cost >10 min): `storybook add`'s postinstall is interactive and
ABORTS SILENTLY at its "install Playwright?" prompt when stdin is not a TTY —
it had already edited main.ts and package.json, leaving half-done setup
(no projects in vitest.config.ts) that LOOKED complete. `CI=true` does not
help; the fix is the `--yes` flag: `npx storybook add @storybook/addon-vitest
--yes`. On re-runs it also asks "install again?" — `--yes` covers that too.

## 2026-08-07 — Story tests DO run in CI (supersedes the open question above)

Owner's call, closing the "story tests in CI?" item left open by the Vitest
addon entry above. ci.yml gains a third job, `stories`, running
`pnpm test:storybook` on ubuntu-latest.

- **A separate job, not a step inside `gates`.** `gates` is the release path
  (attw, publint, directive, smoke) and is already the slowest job; story
  tests share none of its setup — they need Chromium and no packed tarball,
  it needs the tarball and no browser. As its own job they run in parallel and
  a story failure reads as a story failure, not a package-gate failure.
- **Only `@vegam-ui/tokens` is built, not the workspace.** Stories import
  their components from relative source paths, which Vite compiles directly;
  the one dist dependency is `.storybook/preview.ts`'s
  `@vegam-ui/tokens/tokens.css`, and dist is gitignored. Building ui too would
  add the dts rollup for nothing.
- **`playwright install chromium` (not `chromium-headless-shell`).** The
  config runs `headless: true`, which launches chrome-headless-shell — but
  `install chromium` fetches BOTH that and full Chromium, verified with
  `--dry-run`. Naming the shell alone would leave the non-headless path broken
  if `headless` is ever flipped.
- **Cache keyed on the resolved Playwright version**, not the lockfile hash:
  the browser revision is pinned by that version (1.62.1 → chromium-1234), so
  a Playwright bump invalidates the cache and any other dependency change does
  not. On a cache HIT the binaries come back but the apt libraries they link
  against do not — those live outside `~/.cache` — so the hit path still runs
  `playwright install-deps chromium`. Skipping that is the classic way this
  setup fails only on the second run.
- **`pnpm test` is untouched** — still `--project=unit`. The split from the
  entry above stands; CI now just runs the other project too, elsewhere.
- New root script `test:storybook` (filters to the ui package), matching how
  `check:package` already wraps a filtered command. CLAUDE.md Commands updated;
  vitest.config.ts's "CI does NOT run the storybook project" comment corrected.
- **a11y stays `test: 'todo'`** in preview.ts — violations are reported, not
  failed on. Promoting it to `'error'` is a separate call and would gate CI on
  a suite nobody has triaged yet. Not done unasked.
- No changeset: CI and tooling only, nothing consumer-visible (the vitest-addon
  and chromatic-addon entries above are the precedent).

Verified locally on Windows: `pnpm test:storybook` green through the new root
script (40 story files, 243 tests, ~54s), ci.yml parses and the two `if:`
guards attach to the right steps, the cache-key expression yields `1.62.1`,
tokens builds standalone, format + graph:check clean. **The Linux-runner
specifics — apt deps, the cache hit/miss branches — cannot be exercised from
here and are unverified until this runs on GitHub.**

## 2026-08-07 — Phase 5: @vegam-ui/icons built, and the build-time calls the plan left open

ICONS_PLAN.md was written 2026-08-06 with the Figma bridge offline. Building it
resolved the open items and turned up things the plan had wrong.

**Corrections to the plan itself:**

- **The theme's icon tokens are `--ui-color-icon-*`, not `--ui-icon-*`.** The
  plan named them wrong in two places (§2, §6). They live at
  `theme.*.color.icon.*` and so emit with the `color` segment. Fixed in the
  plan, and the docs/stories use the real names. Worth noting because the
  wrong names would have silently resolved to nothing — `var()` with no
  fallback just inherits.
- The `size.icon-*` ramp check held exactly as the plan warned:
  `xxs 0.75 < sm 1 < md 1.25 < lg 1.5 < xxl 1.75 < xl 2` rem. `xxl` (28px) sits
  **between** `lg` and `xl`. Codegen sorts the ramp **by value**, never
  alphabetically, and a test asserts `lg < xxl < xl` so the trap cannot come
  back.

**Calls made while building:**

- **`createIcon` is EXPORTED**, where the plan called it "shared internal". A
  consumer's own glyph should behave exactly like a shipped one — same sizing,
  same accessibility switch, same class — and there is no other way to offer
  that. It is a small, stable surface, and "how do I add my own icon?" is the
  first question anyone asks of an icon package.
- **A consumer `aria-label`/`aria-labelledby` counts as naming the icon**, not
  just `title`. The plan made `title` the sole switch, which means an icon
  given an `aria-label` would keep `aria-hidden="true"` and stay invisible to
  screen readers — the exact opposite of what was asked for. Silent a11y
  failures are the worst kind; the switch now honours all three.
- **Codegen REJECTS `id=` and `url(#…)` in a source SVG.** Ids would have to be
  document-unique per instance, and making them unique means `useId` — a hook,
  which would drag the package out of server-component territory (the one
  thing the package promises). Failing the build with a message pointing at
  "flatten it in Figma" converts a silent runtime collision into a build error.
- **`manifest.json` stays, but the gallery does not use it.** The story
  enumerates the barrel (`Object.entries(IconSet)` filtered to `Icon*`), so a
  newly generated glyph appears with no edit to the story. The manifest earns
  its place as the drift gate's third leg (svg/ ↔ manifest ↔ src/icons/).
- **`packages/icons/src/icons` and `svg/` are in `.prettierignore`** —
  graphify.html's precedent. Generated glyph files carry long path data that
  Prettier would reflow, which would make `format:check` and `icons:check`
  fight each other forever. `sizes.ts`, `index.ts` and `manifest.json` are
  Prettier-clean as emitted and stay checked.
- **Naming round-trips rather than reading nicely**: `RFID` → `rfid.svg` →
  `IconRfid`. Consistency between the file name and the export is what the
  drift gate needs; `IconRFID` would need a special-case list that rots.
- Version starts at **0.0.0** with a `minor` changeset, so `changeset version`
  produces 0.1.0 — the same path `@vegam-ui/tokens` took.

**Gate changes, all live:** `check:package` runs attw + publint for icons too
(no `--exclude-entrypoints`, there is no CSS subpath); `check-directive.mjs`
now asserts BOTH halves — ui line 1 carries `'use client'`, icons contains it
nowhere; `smoke.mjs` packs both tarballs and **fails if an app does not depend
on every package**; `check:size` is keyed by package with icons budgeted for
the full 85-icon set; `icons:check` is new in CI's lint job. attw is 🟢 across
node10, node16 CJS/ESM and bundler.

**The RSC proof is a real gate, not a claim.** `smoke-next-app/app/layout.tsx`
is a server component with no `'use client'` above it, and it renders an icon.
If a directive, hook or browser global ever leaks into the package,
`next build` fails there.

**The Figma bridge could not finish the job.** It drops its WebSocket when an
`exportAsync` loop runs much past 5s, and the plugin then needs a manual
restart in Figma; it crashed four times across the session. 17 of 85 icons are
exported. Rather than keep fighting it, the remaining work is now mechanical:
`packages/icons/figma-nodes.json` records all 85 node ids (also useful as
design→code traceability), and `pnpm icons:import` reports what is missing and
**prints the exact snippet for the next batch of 8**. A batch that lands is
never lost when the next one fails.

## 2026-08-07 — Phase 6 (1.0) prepared, deliberately not bumped

Owner's call: "prep it, I'll test later." Everything in §9 except the manual
screen-reader pass is done; the version bump is not.

- **Not bumping is the point.** 1.0 means semver is a promise. Making it before
  anyone has listened to the library with a screen reader would be asserting
  something unverified. The remaining gate is written up in
  **docs/SCREEN_READER_CHECKLIST.md** — NVDA and VoiceOver setup, per-component
  keys and expected announcements, cross-cutting checks, and a results table —
  so it is a task to execute rather than a task to design.
- **Eleven components had no MDX page**: the pre-blueprint twelve, minus
  Button. §6 docs are now complete at 38/38 and Storybook builds clean. This
  was a real gap that the per-phase work never covered, because Phases 1–4 each
  documented only their own new components.
- **The API sweep found one genuine inconsistency and two false ones.** The
  rule that was already being followed implicitly is now explicit in
  COMPONENT_RECIPE: `size` = scale, `variant` = structural treatment,
  `tone` = colour only, **`intent` = status that also changes ARIA semantics**
  (Banner and Toast both map info/success → `role="status"` and
  warning/danger → `role="alert"`). Two apparent outliers were kept and
  logged instead of "fixed": `Button.variant`'s `danger` (a destructive button
  is one of four visual treatments, not a separate colour axis — splitting it
  would make the common case worse) and `Modal.appearance`, which tints only
  the header icon slot and is named after the Figma component's own axis.
- **`Modal.appearance` was NOT renamed.** It is the one axis whose name comes
  from Figma rather than the library's rule, so it is a live candidate for the
  1.0 breaking batch — but renaming a shipped public prop is the owner's call,
  not a housekeeping change to make unasked. Flagged, not done.
- **Token nulls reconciled**: exactly one remains (`space.11`), consciously
  shipped on its `var(--ui-space-11, var(--ui-space-12))` fallback — it
  resolves correctly today and resolves to the intended 44px the moment design
  fills it. Logged in TOKENS_PLAN "1.0 reconciliation". Everything else in that
  queue is an enhancement or a rename, not a gap.

## 2026-08-07 (later) — lint-staged moved out of package.json

The pre-commit hook died on the phase 0–6 commit with `eslint --fix: The
command line is too long.` — Windows caps a command line at ~8k characters,
and lint-staged appends every staged filename to each command. 230 staged
files blows past that, so a large commit could never pass its own hook.

`lint-staged.config.js` replaces the `lint-staged` key in package.json,
because the fix needs functions and JSON can't hold them: above ~6k chars of
arguments, each command falls back to `.` (whole repo) instead of the file
list. Same result, one short command, and it matches the forms CI already
runs (`pnpm lint`, `pnpm format:check`). Small commits still get the fast
per-file path.

`--no-verify` was not used. The hook exists so that what gets committed is
formatted; skipping it once trains the habit of skipping it always, and the
underlying limit would have resurfaced on the next big commit anyway.
