#!/usr/bin/env node
/**
 * Generates the icon components from the committed Figma SVG exports.
 *
 * `svg/*.svg` is design-owned (arrives by export, never hand-edited — the
 * tokens.json stance). Everything under `src/icons/`, plus `src/sizes.ts`,
 * `src/index.ts` and `manifest.json`, is GENERATED and COMMITTED.
 *
 *   node scripts/build-icons.mjs           regenerate
 *   node scripts/build-icons.mjs --check   fail on drift (CI lint job)
 *
 * Zero dependencies, on purpose — the graphify precedent. Deterministic:
 * sorted inputs, LF endings, no timestamps, so --check only ever fires on a
 * real change.
 */
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const CHECK = process.argv.includes('--check');
const root = fileURLToPath(new URL('..', import.meta.url));
const svgDir = path.join(root, 'svg');
const iconsDir = path.join(root, 'src', 'icons');
const tokensPath = path.join(root, '..', 'tokens', 'src', 'tokens.json');

const problems = [];
const fail = (file, message) => problems.push(`${file}: ${message}`);

// ---------------------------------------------------------------------------
// Naming — add.svg → IconAdd, chevron-down.svg → IconChevronDown
// ---------------------------------------------------------------------------

const pascal = (kebab) =>
  kebab
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

// ---------------------------------------------------------------------------
// Validation + normalization
// ---------------------------------------------------------------------------

/** Shapes and containers an icon may legitimately use. */
const ALLOWED_TAGS = new Set([
  'circle',
  'ellipse',
  'g',
  'line',
  'path',
  'polygon',
  'polyline',
  'rect',
]);

/** Values of fill/stroke that are meaningful and must survive normalization. */
const KEEP_PAINT = new Set(['none', 'currentColor', 'transparent', 'inherit']);

const PAINT_ATTRS = new Set(['fill', 'stroke', 'stop-color', 'flood-color', 'lighting-color']);

/** kebab-case → camelCase, leaving `data-` and `aria-` alone (React's own rule). */
const camelize = (attr) =>
  /^(data|aria)-/.test(attr) ? attr : attr.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

const TAG_RE = /<\/?([a-zA-Z][\w:-]*)((?:\s+[\w:.-]+\s*=\s*"[^"]*")*)\s*\/?>/g;
const ATTR_RE = /([\w:.-]+)\s*=\s*"([^"]*)"/g;

/**
 * Rewrites raw exported SVG markup into JSX-safe markup: camelCased
 * presentation attributes and `currentColor` in place of the literal grey the
 * icon set is drawn in. Anything it cannot vouch for is reported, not guessed.
 */
function normalize(inner, file) {
  // Ids would have to be document-unique per instance, and making them unique
  // means useId — a hook, which would drag the package out of
  // server-component territory (ICONS_PLAN §2). Fail loudly instead.
  if (/\bid\s*=\s*"/.test(inner) || /url\(#/.test(inner)) {
    fail(
      file,
      'contains an id / url(#…) reference. Icons must be flat: flatten clip paths, masks and gradients in Figma before exporting.',
    );
    return '';
  }
  if (/<\s*(script|style|foreignObject|image|text)\b/i.test(inner)) {
    fail(file, 'contains a script/style/foreignObject/image/text element');
    return '';
  }
  if (/\sstyle\s*=\s*"/.test(inner)) {
    fail(file, 'contains a style="" attribute — inline styles cannot be converted to JSX safely');
    return '';
  }

  return inner.replace(TAG_RE, (tag, name, attrs) => {
    if (!ALLOWED_TAGS.has(name)) {
      fail(file, `unsupported element <${name}>`);
      return tag;
    }
    if (tag.startsWith('</')) return `</${name}>`;

    const rewritten = [];
    let match;
    ATTR_RE.lastIndex = 0;
    while ((match = ATTR_RE.exec(attrs)) !== null) {
      const [, attr, rawValue] = match;
      let value = rawValue;

      if (PAINT_ATTRS.has(attr) && !KEEP_PAINT.has(value)) {
        // The set is drawn in a single literal grey; the whole point of the
        // package is that colour comes from CSS `color`.
        value = 'currentColor';
      }
      if (value.includes('{') || value.includes('}')) {
        fail(file, `attribute ${attr} contains a brace, which JSX would read as an expression`);
      }
      rewritten.push(`${camelize(attr)}="${value}"`);
    }

    return `<${name}${rewritten.length > 0 ? ' ' + rewritten.join(' ') : ''} />`;
  });
}

/** Pulls the viewBox and the inner markup out of a single-root SVG file. */
function parse(source, file) {
  const roots = source.match(/<svg\b/g) ?? [];
  if (roots.length !== 1) {
    fail(file, `expected exactly one <svg> root, found ${roots.length}`);
    return null;
  }
  const viewBox = source.match(/<svg[^>]*\sviewBox="([^"]+)"/)?.[1];
  if (viewBox === undefined) {
    fail(file, 'the <svg> root has no viewBox');
    return null;
  }
  const inner = source
    .replace(/^[\s\S]*?<svg[^>]*>/, '')
    .replace(/<\/svg>[\s\S]*$/, '')
    .trim();
  if (inner === '') {
    fail(file, 'is empty');
    return null;
  }
  return { viewBox, inner };
}

// ---------------------------------------------------------------------------
// Read the set
// ---------------------------------------------------------------------------

const files = readdirSync(svgDir)
  .filter((f) => f.endsWith('.svg'))
  .sort();

if (files.length === 0) {
  console.error('build-icons: no SVGs found in svg/');
  process.exit(1);
}

const icons = [];
for (const file of files) {
  const slug = file.replace(/\.svg$/, '');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    fail(file, 'filename must be kebab-case (a-z, 0-9 and single hyphens)');
    continue;
  }
  const parsed = parse(readFileSync(path.join(svgDir, file), 'utf8'), file);
  if (parsed === null) continue;
  const body = normalize(parsed.inner, file);
  icons.push({ name: `Icon${pascal(slug)}`, file, slug, viewBox: parsed.viewBox, body });
}

if (problems.length > 0) {
  console.error(`build-icons: ${problems.length} invalid source(s)\n  ${problems.join('\n  ')}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Emit
// ---------------------------------------------------------------------------

const BANNER = `/* GENERATED by scripts/build-icons.mjs — do not edit. Run \`pnpm icons\`. */`;

/** One line per shape, so a redrawn icon produces a readable diff. */
const jsxBody = (body) =>
  body
    .replace(/>\s*</g, '>\n<')
    .split('\n')
    .map((line) => `    ${line.trim()}`)
    .join('\n');

const iconModule = (icon) => `${BANNER}
import { createIcon } from '../createIcon';

export const ${icon.name} = createIcon(
  '${icon.name}',
  '${icon.viewBox}',
  <>
${jsxBody(icon.body)}
  </>,
);
`;

// The size ramp's numbers live in tokens.json; baking them in as var()
// fallbacks is what lets an icon size correctly with React alone installed.
const tokens = JSON.parse(readFileSync(tokensPath, 'utf8'));
const ramp = Object.entries(tokens.size)
  .filter(([key]) => key.startsWith('icon-'))
  .map(([key, token]) => ({ step: key.slice('icon-'.length), value: token.value }))
  .sort((a, b) => parseFloat(a.value) - parseFloat(b.value));

const sizesModule = `${BANNER}

/**
 * The \`size.icon-*\` ramp, smallest first. Note the order is **not**
 * alphabetical — \`xxl\` (28px) sits between \`lg\` (24px) and \`xl\` (32px).
 *
 * Each step is a token \`var()\` with the token's own value as the fallback, so
 * icons are sized correctly even in an app that never loads the tokens CSS.
 */
export const ICON_SIZES = {
${ramp.map((s) => `  ${s.step}: 'var(--ui-size-icon-${s.step}, ${s.value})',`).join('\n')}
} as const;

/** Named steps accepted by \`IconProps['size']\`. */
export type IconSize = keyof typeof ICON_SIZES;
`;

const barrel = `${BANNER}
export { createIcon } from './createIcon';
export type { IconComponent, IconProps, IconSize } from './createIcon';
export { ICON_SIZES } from './sizes';

${icons.map((i) => `export { ${i.name} } from './icons/${i.name}';`).join('\n')}
`;

const manifest =
  JSON.stringify(
    {
      count: icons.length,
      icons: icons.map(({ name, file, viewBox }) => ({ name, file, viewBox })),
    },
    null,
    2,
  ) + '\n';

const emitted = new Map([
  [path.join(root, 'src', 'sizes.ts'), sizesModule],
  [path.join(root, 'src', 'index.ts'), barrel],
  [path.join(root, 'manifest.json'), manifest],
  ...icons.map((icon) => [path.join(iconsDir, `${icon.name}.tsx`), iconModule(icon)]),
]);

const expectedIconFiles = new Set(icons.map((i) => `${i.name}.tsx`));
let existingIconFiles = [];
try {
  existingIconFiles = readdirSync(iconsDir);
} catch {
  existingIconFiles = [];
}
const orphans = existingIconFiles.filter((f) => !expectedIconFiles.has(f));

if (CHECK) {
  const drifted = [];
  for (const [file, content] of emitted) {
    let actual = null;
    try {
      actual = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
    } catch {
      /* missing counts as drift */
    }
    if (actual !== content) drifted.push(path.relative(root, file));
  }
  for (const orphan of orphans) {
    drifted.push(`${path.relative(root, path.join(iconsDir, orphan))} (no matching svg/)`);
  }
  if (drifted.length > 0) {
    console.error(
      `icons:check — generated output is stale. Run \`pnpm icons\` and commit:\n  ${drifted.join('\n  ')}`,
    );
    process.exit(1);
  }
  console.log(`icons:check ok — ${icons.length} icons in sync with svg/`);
} else {
  mkdirSync(iconsDir, { recursive: true });
  for (const orphan of orphans) rmSync(path.join(iconsDir, orphan));
  for (const [file, content] of emitted) writeFileSync(file, content, 'utf8');
  console.log(
    `build-icons: wrote ${icons.length} icons` +
      (orphans.length > 0 ? `, removed ${orphans.length} orphan(s)` : ''),
  );
}
