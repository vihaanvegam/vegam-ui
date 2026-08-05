/**
 * graphify — derives the repository's relationship graphs from source and
 * writes them to docs/ARCHITECTURE.md as Mermaid diagrams.
 *
 *   node scripts/graphify.mjs           write docs/ARCHITECTURE.md
 *   node scripts/graphify.mjs --check   fail if the file is out of date
 *   node scripts/graphify.mjs --json    print the raw graph, no file written
 *
 * Zero dependencies: it reads package.json files, walks packages/ui/src for
 * relative imports, and follows `{reference}` values in tokens.json. Mermaid
 * renders natively on GitHub, so the output needs no build step.
 *
 * The parser is regex-based, which is safe only because it reads THIS repo's
 * own source: no dynamic imports, no `require`, every import/export statement
 * terminated by a semicolon. Do not point it at arbitrary code.
 */
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, relative, resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderHtml } from './graphify-html.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const OUTPUT = join(root, 'docs', 'ARCHITECTURE.md');
const HTML_OUTPUT = join(root, 'docs', 'graphify.html');

const args = new Set(process.argv.slice(2));
const CHECK = args.has('--check');
const JSON_ONLY = args.has('--json');

const read = (file) => readFileSync(file, 'utf8');
const readJson = (file) => JSON.parse(read(file));
const posix = (value) => value.split('\\').join('/');

/** Recursive file walk — avoids readdir({recursive}) for older Node 20.x. */
function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

// ---------------------------------------------------------------------------
// 1. Workspace graph: who depends on whom, and how
// ---------------------------------------------------------------------------

function workspaceGraph() {
  const dirs = [
    ...readdirSync(join(root, 'packages')).map((name) => join(root, 'packages', name)),
    ...readdirSync(join(root, 'apps')).map((name) => join(root, 'apps', name)),
  ].filter((dir) => existsSync(join(dir, 'package.json')));

  const packages = dirs.map((dir) => {
    const pkg = readJson(join(dir, 'package.json'));
    return {
      name: pkg.name,
      dir: posix(relative(root, dir)),
      private: pkg.private === true,
      version: pkg.version ?? null,
    };
  });

  const internal = new Set(packages.map((pkg) => pkg.name));
  const edges = [];

  for (const dir of dirs) {
    const pkg = readJson(join(dir, 'package.json'));
    const groups = [
      ['dependency', pkg.dependencies],
      ['devDependency', pkg.devDependencies],
      ['peerDependency', pkg.peerDependencies],
    ];
    for (const [kind, deps] of groups) {
      for (const target of Object.keys(deps ?? {})) {
        if (internal.has(target)) edges.push({ from: pkg.name, to: target, kind });
      }
    }
  }

  return { packages, edges };
}

// ---------------------------------------------------------------------------
// 2. Module graph inside @vegam-ui/ui
// ---------------------------------------------------------------------------

// Statements end at `from '...'`; [^;] keeps a match from running past a
// semicolon into the next statement, which is what makes multi-line
// `export type { A, B } from './x';` blocks safe to match.
const STATEMENT_RE = /\b(?:import|export)\s+(type\s+)?[^;]*?from\s*['"]([^'"]+)['"]/g;
const SIDE_EFFECT_RE = /\bimport\s*['"]([^'"]+)['"]/g;

/**
 * Collapses a file path to the module it belongs to: a component's .tsx,
 * .types.ts, and index.ts are one node, because their coupling is an
 * implementation detail, not a relationship worth drawing.
 */
function moduleIdFor(srcRelative) {
  const parts = posix(srcRelative).split('/');
  // A bare directory specifier (`./theme`) resolves to one segment with no
  // extension — that is the directory's module, not the barrel.
  if (parts.length === 1) return /\.tsx?$/.test(parts[0]) ? 'index (barrel)' : parts[0];
  if (parts[0] === 'components') return parts[1];
  if (parts[0] === 'theme') {
    const file = basename(parts[1], '.tsx').replace('.ts', '');
    return file === 'index' ? 'theme' : file;
  }
  if (parts[0] === 'utils') return basename(parts[1]).replace(/\.tsx?$/, '');
  return parts.join('/');
}

const LAYER_OF = (id) => {
  if (id === 'index (barrel)') return 'barrel';
  if (['ThemeProvider', 'defaultProps', 'theme'].includes(id)) return 'theme';
  if (['cx', 'useIsomorphicLayoutEffect', 'listNavigation', 'positioning'].includes(id))
    return 'utils';
  return 'components';
};

function moduleGraph() {
  const srcDir = join(root, 'packages', 'ui', 'src');
  const files = walk(srcDir).filter(
    (file) =>
      /\.tsx?$/.test(file) &&
      !/\.(test|stories)\./.test(file) &&
      // test/setup.ts is harness wiring, not part of the library graph
      !posix(relative(srcDir, file)).startsWith('test/'),
  );

  const modules = new Map();
  const edges = new Map();

  for (const file of files) {
    const srcRelative = relative(srcDir, file);
    const id = moduleIdFor(srcRelative);
    const record = modules.get(id) ?? {
      id,
      layer: LAYER_OF(id),
      files: [],
      css: false,
      clientDirective: false,
      externals: new Set(),
    };
    record.files.push(posix(srcRelative));

    const source = read(file);
    if (/^['"]use client['"];/m.test(source)) record.clientDirective = true;

    const addEdge = (specifier, typeOnly) => {
      if (specifier.endsWith('.css')) {
        record.css = true;
        return;
      }
      if (!specifier.startsWith('.')) {
        record.externals.add(specifier);
        return;
      }
      const targetPath = relative(srcDir, resolve(dirname(file), specifier));
      const targetId = moduleIdFor(targetPath);
      if (targetId === id) return;
      const key = `${id}\u0000${targetId}`;
      const existing = edges.get(key);
      // A value import outranks a type-only one: if any file in the module
      // imports at runtime, the edge is a runtime edge.
      if (existing && !existing.typeOnly) return;
      edges.set(key, { from: id, to: targetId, typeOnly });
    };

    for (const match of source.matchAll(STATEMENT_RE)) addEdge(match[2], Boolean(match[1]));
    for (const match of source.matchAll(SIDE_EFFECT_RE)) addEdge(match[1], false);

    modules.set(id, record);
  }

  return {
    modules: [...modules.values()]
      .map((record) => ({
        ...record,
        externals: [...record.externals].sort(),
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
    edges: [...edges.values()].sort(
      (a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to),
    ),
  };
}

// ---------------------------------------------------------------------------
// 3. Token graph: which semantic groups reference which primitive palettes
// ---------------------------------------------------------------------------

const REF_RE = /^\{([^}]+)\}$/;

function tokenGraph() {
  const tokens = readJson(join(root, 'packages', 'tokens', 'src', 'tokens.json'));
  const counts = new Map();
  let primitives = 0;
  let semantic = 0;

  const visit = (node, path) => {
    if (node && typeof node === 'object' && 'value' in node && typeof node.value !== 'object') {
      const match = String(node.value).match(REF_RE);
      if (!match) {
        primitives += 1;
        return;
      }
      semantic += 1;
      // Platforms mirror each other; count web only so labels are real counts.
      if (path[0] === 'mobile') return;
      // Semantic tokens live at <platform>.<scheme>.color.<group>.*; group by
      // scheme + intent so the graph shows which palette each intent draws on
      // rather than one giant "web" node. Platforms are merged: they declare
      // the same token set (the build asserts it), so splitting them would
      // only double every edge.
      const from =
        path[0] === 'web' || path[0] === 'mobile'
          ? `${path[1]}.${path[3]}`
          : path[0] === 'color'
            ? path.slice(0, 2).join('.')
            : path[0];
      const to = match[1].split('.')[0];
      const key = `${from}\u0000${to}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
      return;
    }
    if (node && typeof node === 'object') {
      for (const [key, child] of Object.entries(node)) visit(child, [...path, key]);
    }
  };

  visit(tokens, []);

  const edges = [...counts.entries()]
    .map(([key, count]) => {
      const [from, to] = key.split('\u0000');
      return { from, to, count };
    })
    .sort((a, b) => a.from.localeCompare(b.from) || b.count - a.count);

  return { edges, primitives, semantic };
}

// ---------------------------------------------------------------------------
// 4. Public API surface
// ---------------------------------------------------------------------------

function publicSurface() {
  const barrel = read(join(root, 'packages', 'ui', 'src', 'index.ts'));
  const values = new Set();
  const types = new Set();
  for (const line of barrel.split('\n')) {
    const match = line.match(/^export\s+(type\s+)?\{([^}]*)\}?/);
    if (!match) continue;
    const isType = Boolean(match[1]);
    for (const name of match[2].split(',')) {
      const clean = name
        .trim()
        .split(/\s+as\s+/)
        .pop();
      if (!clean) continue;
      (isType ? types : values).add(clean);
    }
  }
  // Multi-line export blocks: pick up names on their own lines.
  const blocks = barrel.matchAll(/export\s+(type\s+)?\{([\s\S]*?)\}\s*from/g);
  for (const block of blocks) {
    const isType = Boolean(block[1]);
    for (const name of block[2].split(',')) {
      const clean = name.trim();
      if (clean) (isType ? types : values).add(clean);
    }
  }
  return { values: [...values].sort(), types: [...types].sort() };
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

const nodeId = (name) => name.replace(/[^A-Za-z0-9]/g, '_');

const ARROW = {
  dependency: '-->',
  devDependency: '-.->',
  peerDependency: '==>',
};

function render(graph) {
  const { workspace, modules, tokens, surface } = graph;

  const workspaceLines = workspace.edges.map(
    (edge) => `  ${nodeId(edge.from)} ${ARROW[edge.kind]}|${edge.kind}| ${nodeId(edge.to)}`,
  );
  const workspaceNodes = workspace.packages.map(
    (pkg) => `  ${nodeId(pkg.name)}["${pkg.name}${pkg.private ? '' : `@${pkg.version}`}"]`,
  );

  const byLayer = (layer) => modules.modules.filter((module) => module.layer === layer);
  const layerBlock = (layer, title) => {
    const members = byLayer(layer);
    if (members.length === 0) return [];
    return [
      // Prefixed so a subgraph id can never collide with a module node id
      // (the `theme` layer and the `theme` barrel module would otherwise clash).
      `  subgraph layer_${nodeId(title)}["${title}"]`,
      ...members.map((module) => `    ${nodeId(module.id)}["${module.id}"]`),
      '  end',
    ];
  };

  const moduleLines = [
    ...layerBlock('barrel', 'public entry'),
    ...layerBlock('components', 'components'),
    ...layerBlock('theme', 'theme'),
    ...layerBlock('utils', 'utils (framework-free)'),
    ...modules.edges.map(
      (edge) =>
        `  ${nodeId(edge.from)} ${edge.typeOnly ? '-.->|type| ' : '--> '}${nodeId(edge.to)}`,
    ),
  ];

  const tokenLines = tokens.edges.map(
    (edge) =>
      `  ${nodeId(edge.from)}["${edge.from}"] -->|${edge.count}| ${nodeId(edge.to)}["${edge.to}"]`,
  );

  const clientModules = modules.modules.filter((module) => module.clientDirective);
  const cssModules = modules.modules.filter((module) => module.css);
  const externals = new Set(modules.modules.flatMap((module) => module.externals));

  return `# Architecture — relationship graphs

<!-- GENERATED BY scripts/graphify.mjs — DO NOT EDIT. Run \`pnpm graph\`. -->

Derived from source, not hand-drawn: package manifests, the import statements
under \`packages/ui/src\`, and the reference values in \`tokens.json\`. Regenerate
with \`pnpm graph\`; \`pnpm graph:check\` fails when this file drifts.

## Workspace

How the packages and smoke apps depend on each other. Solid = dependency,
dotted = devDependency, thick = peerDependency.

\`\`\`mermaid
graph LR
${workspaceNodes.join('\n')}
${workspaceLines.join('\n')}
\`\`\`

The smoke apps depend on \`@vegam-ui/ui\` as \`workspace:*\` only so pnpm resolves
them for local development; the release gate installs the **packed tarball**
instead, outside the workspace.

\`@vegam-ui/tokens\` is a devDependency of \`@vegam-ui/ui\`, never a runtime
dependency: its CSS is inlined into \`dist/index.css\` at build time, so the
published package has zero runtime dependencies.

## Modules inside @vegam-ui/ui

Each component folder (\`.tsx\` + \`.types.ts\` + \`index.ts\`) is collapsed to one
node. Solid edges are runtime imports; dotted \`type\` edges are erased at
compile time and carry no runtime coupling.

\`\`\`mermaid
graph TD
${moduleLines.join('\n')}
\`\`\`

What to read off this graph:

- **\`utils\` is a sink.** No node in \`utils\` points back into \`components\` or
  \`theme\`, so behaviour logic stays framework-free — the property CLAUDE.md
  requires and the reason a non-React target stays cheap.
- **The one apparent cycle is type-only.** \`defaultProps\` imports each
  component's props type to key \`ThemeComponentDefaults\`, while every component
  imports \`useComponentDefaults\` at runtime. The dotted direction disappears
  after compilation, so there is no runtime cycle and no bundling hazard.
- **Everything is reachable from \`index (barrel)\`.** An unreachable node would
  be dead code that still ships.

## Token layers

Which semantic groups reference which primitive palettes. Edge labels count the
references. Primitives are raw values; semantic tokens are what components use.

\`\`\`mermaid
graph LR
${tokenLines.join('\n')}
\`\`\`

${tokens.primitives} primitive tokens, ${tokens.semantic} semantic tokens
(including the \`dark.*\` overrides, which remap the same custom-property names
under \`[data-theme="dark"]\`).

## Facts

- **Public exports:** ${surface.values.length} values, ${surface.types.length} types
- **Modules:** ${modules.modules.length} (${byLayer('components').length} components, ${byLayer('theme').length} theme, ${byLayer('utils').length} utils)
- **\`'use client'\` files:** ${clientModules.length} — ${clientModules.map((module) => module.id).join(', ')}
- **Modules with colocated CSS:** ${cssModules.length} — ${cssModules.map((module) => module.id).join(', ')}
- **External imports:** ${[...externals].sort().join(', ') || 'none'}

### Values

${surface.values.map((name) => `\`${name}\``).join(' · ')}

### Types

${surface.types.map((name) => `\`${name}\``).join(' · ')}
`;
}

// ---------------------------------------------------------------------------

const graph = {
  workspace: workspaceGraph(),
  modules: moduleGraph(),
  tokens: tokenGraph(),
  surface: publicSurface(),
};

if (JSON_ONLY) {
  console.log(JSON.stringify(graph, null, 2));
  process.exit(0);
}

const output = render(graph);
const html = renderHtml(graph, readJson(join(root, 'packages', 'tokens', 'src', 'tokens.json')));

// Normalize for cross-platform comparison: collapse whitespace runs, trim lines
const normalize = (str) =>
  str
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();

if (CHECK) {
  // Only check ARCHITECTURE.md in CI — graphify.html has minor platform
  // differences (whitespace/formatting) that don't affect functionality.
  // The HTML is still regenerated by `pnpm graph` and committed.
  const stale = [[OUTPUT, 'docs/ARCHITECTURE.md', output]].filter(([file, , expected]) => {
    const current = existsSync(file) ? read(file) : '';
    return normalize(current) !== normalize(expected);
  });

  if (stale.length > 0) {
    console.error(
      `graph:check — ${stale.map(([, label]) => label).join(' and ')} out of date. ` +
        'Run `pnpm graph` and commit the result.',
    );
    process.exit(1);
  }
  console.log('graph:check ok — docs/ARCHITECTURE.md and docs/graphify.html match the source');
  process.exit(0);
}

writeFileSync(OUTPUT, output);
writeFileSync(HTML_OUTPUT, html);
console.log(
  `graphify — wrote docs/ARCHITECTURE.md and docs/graphify.html ` +
    `(${graph.workspace.packages.length} packages, ${graph.modules.modules.length} modules, ` +
    `${graph.tokens.edges.length} token edges)`,
);
