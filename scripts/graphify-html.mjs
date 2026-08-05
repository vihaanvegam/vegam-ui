/**
 * Renders the graphify dataset as a single self-contained interactive page.
 *
 * No dependencies and no CDN: the force layout, drag handling, and filtering
 * are ~200 lines of vanilla JS inline in the document, and the palette is
 * resolved from tokens.json at generation time so the map is themed by the
 * design system it describes. Output is deterministic — same source, same
 * bytes — because `pnpm graph:check` diffs it.
 */

/** Follows `{a.b.c}` references in tokens.json to a concrete value. */
function resolveToken(tokens, path) {
  let node = tokens;
  for (const key of path.split('.')) {
    if (!node || typeof node !== 'object') return null;
    node = node[key];
  }
  if (!node || typeof node !== 'object' || !('value' in node)) return null;
  const match = String(node.value).match(/^\{([^}]+)\}$/);
  return match ? resolveToken(tokens, match[1]) : String(node.value);
}

const LIGHT = {
  canvas: 'web.light.color.surface.page',
  surface: 'web.light.color.surface.page',
  subtle: 'web.light.color.surface.subtle',
  muted: 'web.light.color.surface.disabled',
  text: 'web.light.color.text.primary',
  textMuted: 'web.light.color.text.secondary',
  border: 'web.light.color.border.default',
  borderSubtle: 'web.light.color.divider.default',
  focus: 'web.light.color.border.focus',
  accent: 'web.light.color.action.primary.bg',
};

const DARK = {
  canvas: 'web.dark.color.surface.page',
  surface: 'web.dark.color.surface.page',
  subtle: 'web.dark.color.surface.subtle',
  muted: 'web.dark.color.surface.disabled',
  text: 'web.dark.color.text.primary',
  textMuted: 'web.dark.color.text.secondary',
  border: 'web.dark.color.border.default',
  borderSubtle: 'web.dark.color.divider.default',
  focus: 'web.dark.color.border.focus',
  accent: 'web.dark.color.action.primary.bg',
};

/** Node colours per category, taken from the primitive palette. */
const CATEGORY_TOKENS = {
  barrel: 'blue.700',
  components: 'blue.500',
  theme: 'amber.500',
  utils: 'green.500',
  package: 'blue.600',
  app: 'grey.500',
  semantic: 'blue.500',
  primitive: 'grey.400',
};

const cssVars = (tokens, map, prefix) =>
  Object.entries(map)
    .map(([name, path]) => `    --g-${prefix}${name}: ${resolveToken(tokens, path) ?? '#000'};`)
    .join('\n');

/** Builds the three view datasets the page switches between. */
function buildViews(graph) {
  const workspace = {
    id: 'workspace',
    label: 'Workspace',
    hint: 'Packages and smoke apps. Solid = dependency, dashed = devDependency, thick = peer.',
    nodes: graph.workspace.packages.map((pkg) => ({
      id: pkg.name,
      label: pkg.name.replace('@vegam-ui/', ''),
      category: pkg.private ? 'app' : 'package',
      detail: [
        ['directory', pkg.dir],
        ['published', pkg.private ? 'no (private)' : `yes — v${pkg.version}`],
      ],
    })),
    links: graph.workspace.edges.map((edge) => ({
      source: edge.from,
      target: edge.to,
      kind: edge.kind,
      label: edge.kind,
    })),
  };

  const modules = {
    id: 'modules',
    label: 'Modules',
    hint: 'Imports inside @vegam-ui/ui. Dashed = type-only (erased at compile time).',
    nodes: graph.modules.modules.map((module) => ({
      id: module.id,
      label: module.id === 'index (barrel)' ? 'barrel' : module.id,
      category: module.layer,
      detail: [
        ['layer', module.layer],
        ['files', module.files.join(', ')],
        ["'use client'", module.clientDirective ? 'yes' : 'no'],
        ['colocated CSS', module.css ? 'yes' : 'no'],
        ['external imports', module.externals.join(', ') || '—'],
      ],
    })),
    links: graph.modules.edges.map((edge) => ({
      source: edge.from,
      target: edge.to,
      kind: edge.typeOnly ? 'type' : 'value',
      label: edge.typeOnly ? 'type' : '',
    })),
  };

  const tokenNodes = new Map();
  for (const edge of graph.tokens.edges) {
    if (!tokenNodes.has(edge.from))
      tokenNodes.set(edge.from, { id: edge.from, label: edge.from, category: 'semantic' });
    if (!tokenNodes.has(edge.to))
      tokenNodes.set(edge.to, { id: edge.to, label: edge.to, category: 'primitive' });
  }
  const tokens = {
    id: 'tokens',
    label: 'Tokens',
    hint: 'Semantic groups referencing primitive palettes. Edge width tracks reference count.',
    nodes: [...tokenNodes.values()].map((node) => ({
      ...node,
      detail: [
        ['layer', node.category],
        [
          'references',
          graph.tokens.edges
            .filter((edge) => edge.from === node.id || edge.to === node.id)
            .map((edge) => `${edge.from} → ${edge.to} (${edge.count})`)
            .join('; '),
        ],
      ],
    })),
    links: graph.tokens.edges.map((edge) => ({
      source: edge.from,
      target: edge.to,
      kind: 'value',
      weight: edge.count,
      label: String(edge.count),
    })),
  };

  return [workspace, modules, tokens];
}

export function renderHtml(graph, tokensJson) {
  const views = buildViews(graph);
  const palette = Object.fromEntries(
    Object.entries(CATEGORY_TOKENS).map(([key, path]) => [
      key,
      resolveToken(tokensJson, path) ?? '#888',
    ]),
  );
  const data = JSON.stringify({ views, palette }).replace(/</g, '\\u003c');

  return `<!doctype html>
<html lang="en" data-theme="light">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>vegam-ui — relationship map</title>
    <!-- GENERATED BY scripts/graphify.mjs — DO NOT EDIT. Run \`pnpm graph\`. -->
    <style>
      :root {
${cssVars(tokensJson, LIGHT, '')}
        --g-radius: 0.5rem;
        --g-font: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
        --g-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      }
      [data-theme='dark'] {
        color-scheme: dark;
${cssVars(tokensJson, DARK, '')}
      }
      * {
        box-sizing: border-box;
      }
      /* min-height, not height: a wrapped header on a narrow viewport must
         push the page into scrolling rather than collapsing the graph to 0. */
      body {
        margin: 0;
        font-family: var(--g-font);
        background: var(--g-canvas);
        color: var(--g-text);
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }
      header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--g-borderSubtle);
        background: var(--g-surface);
      }
      h1 {
        font-size: 0.9375rem;
        font-weight: 600;
        margin: 0 0.5rem 0 0;
      }
      .tabs {
        display: flex;
        gap: 0.25rem;
      }
      button {
        font: inherit;
        font-size: 0.8125rem;
        padding: 0.375rem 0.75rem;
        border-radius: var(--g-radius);
        border: 1px solid var(--g-border);
        background: var(--g-surface);
        color: var(--g-text);
        cursor: pointer;
      }
      button:hover {
        background: var(--g-muted);
      }
      button[aria-pressed='true'] {
        background: var(--g-accent);
        border-color: var(--g-accent);
        color: #fff;
      }
      button:focus-visible,
      input:focus-visible {
        outline: 2px solid var(--g-focus);
        outline-offset: 2px;
      }
      input[type='search'] {
        font: inherit;
        font-size: 0.8125rem;
        padding: 0.375rem 0.625rem;
        border-radius: var(--g-radius);
        border: 1px solid var(--g-border);
        background: var(--g-surface);
        color: var(--g-text);
        min-width: 10rem;
      }
      label.toggle {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        font-size: 0.8125rem;
        color: var(--g-textMuted);
        cursor: pointer;
      }
      .spacer {
        flex: 1;
      }
      main {
        flex: 1;
        display: flex;
        min-height: 0;
      }
      #stage {
        flex: 1;
        min-width: 0;
        position: relative;
        /* Guarantees a usable canvas even when the header eats the viewport. */
        min-height: max(20rem, 55vh);
      }
      /* Absolutely positioned rather than height:100% — a percentage height
         inside a flex child is not reliably definite and collapsed to 0. */
      svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: block;
        cursor: grab;
      }
      svg.panning {
        cursor: grabbing;
      }
      .hint {
        position: absolute;
        left: 1rem;
        bottom: 0.875rem;
        font-size: 0.75rem;
        color: var(--g-textMuted);
        max-width: 32rem;
        pointer-events: none;
      }
      aside {
        width: 20rem;
        flex-shrink: 0;
        border-left: 1px solid var(--g-borderSubtle);
        background: var(--g-surface);
        padding: 1rem;
        overflow-y: auto;
        font-size: 0.8125rem;
      }
      aside h2 {
        font-size: 0.9375rem;
        margin: 0 0 0.25rem;
        font-family: var(--g-mono);
        word-break: break-all;
      }
      aside .cat {
        display: inline-block;
        font-size: 0.6875rem;
        padding: 0.125rem 0.5rem;
        border-radius: 999px;
        background: var(--g-muted);
        color: var(--g-textMuted);
        margin-bottom: 0.75rem;
      }
      aside dl {
        margin: 0;
      }
      aside dt {
        font-size: 0.6875rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--g-textMuted);
        margin-top: 0.75rem;
      }
      aside dd {
        margin: 0.125rem 0 0;
        font-family: var(--g-mono);
        font-size: 0.75rem;
        word-break: break-word;
      }
      aside ul {
        margin: 0.25rem 0 0;
        padding-left: 1.1rem;
        font-family: var(--g-mono);
        font-size: 0.75rem;
      }
      aside .empty {
        color: var(--g-textMuted);
      }
      .legend {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
        font-size: 0.75rem;
        color: var(--g-textMuted);
      }
      .legend span {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
      }
      .swatch {
        width: 0.625rem;
        height: 0.625rem;
        border-radius: 999px;
      }
      .node text {
        font-family: var(--g-mono);
        font-size: 11px;
        fill: var(--g-text);
        pointer-events: none;
        user-select: none;
      }
      .node circle {
        cursor: pointer;
        stroke: var(--g-surface);
        stroke-width: 2;
      }
      .node.selected circle {
        stroke: var(--g-focus);
        stroke-width: 3;
      }
      .link {
        stroke: var(--g-border);
        fill: none;
      }
      .link.type {
        stroke-dasharray: 4 3;
      }
      .link.devDependency {
        stroke-dasharray: 4 3;
      }
      .link.peerDependency {
        stroke-width: 3;
      }
      .dim {
        opacity: 0.12;
      }
      .link-label {
        font-family: var(--g-mono);
        font-size: 9px;
        fill: var(--g-textMuted);
        pointer-events: none;
      }
      @media (max-width: 960px) {
        .legend {
          display: none;
        }
      }
      @media (max-width: 720px) {
        aside {
          display: none;
        }
        header {
          padding: 0.5rem 0.625rem;
          gap: 0.5rem;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        * {
          transition: none !important;
        }
      }
    </style>
  </head>
  <body>
    <header>
      <h1>vegam-ui relationship map</h1>
      <div class="tabs" id="tabs" role="group" aria-label="Graph view"></div>
      <input type="search" id="search" placeholder="Filter nodes…" aria-label="Filter nodes" />
      <label class="toggle"
        ><input type="checkbox" id="showTypes" checked /> type-only edges</label
      >
      <button id="relayout">Re-layout</button>
      <div class="spacer"></div>
      <div class="legend" id="legend"></div>
      <button id="theme" aria-label="Toggle colour scheme">Dark</button>
    </header>
    <main>
      <div id="stage">
        <svg id="svg" role="img" aria-label="Interactive relationship graph"></svg>
        <p class="hint" id="hint"></p>
      </div>
      <aside id="panel" aria-live="polite">
        <p class="empty">Click a node to inspect it. Drag to move, scroll to zoom.</p>
      </aside>
    </main>
    <script>
      const DATA = ${data};
      const NS = 'http://www.w3.org/2000/svg';
      const svg = document.getElementById('svg');
      const panel = document.getElementById('panel');
      const hint = document.getElementById('hint');
      const search = document.getElementById('search');
      const showTypes = document.getElementById('showTypes');

      let view = DATA.views[0];
      let nodes = [];
      let links = [];
      let selected = null;
      let transform = { x: 0, y: 0, k: 1 };
      let root;

      const el = (name, attrs = {}) => {
        const node = document.createElementNS(NS, name);
        for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
        return node;
      };

      /**
       * Force-directed layout: pairwise repulsion, spring attraction along
       * links, and gravity toward the centre. O(n²) is fine at this scale
       * (tens of nodes), so there is no quadtree.
       */
      function simulate(steps = 320) {
        const width = svg.clientWidth || 900;
        const height = svg.clientHeight || 600;
        const cx = width / 2;
        const cy = height / 2;
        const degree = new Map(nodes.map((node) => [node.id, 0]));
        for (const link of links) {
          degree.set(link.source, (degree.get(link.source) ?? 0) + 1);
          degree.set(link.target, (degree.get(link.target) ?? 0) + 1);
        }
        for (const node of nodes) node.r = 7 + Math.min(6, (degree.get(node.id) ?? 0));

        for (let step = 0; step < steps; step += 1) {
          const cooling = 1 - step / steps;
          for (const a of nodes) {
            for (const b of nodes) {
              if (a === b) continue;
              let dx = a.x - b.x;
              let dy = a.y - b.y;
              let dist = Math.hypot(dx, dy) || 0.01;
              if (dist > 320) continue;
              const force = 9000 / (dist * dist);
              a.vx += (dx / dist) * force;
              a.vy += (dy / dist) * force;
            }
          }
          for (const link of links) {
            const a = nodes.find((node) => node.id === link.source);
            const b = nodes.find((node) => node.id === link.target);
            if (!a || !b) continue;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.hypot(dx, dy) || 0.01;
            const force = (dist - 130) * 0.02;
            a.vx += (dx / dist) * force;
            a.vy += (dy / dist) * force;
            b.vx -= (dx / dist) * force;
            b.vy -= (dy / dist) * force;
          }
          for (const node of nodes) {
            node.vx += (cx - node.x) * 0.004;
            node.vy += (cy - node.y) * 0.004;
            if (node.pinned) {
              node.vx = 0;
              node.vy = 0;
              continue;
            }
            node.x += Math.max(-30, Math.min(30, node.vx)) * cooling;
            node.y += Math.max(-30, Math.min(30, node.vy)) * cooling;
            node.vx *= 0.82;
            node.vy *= 0.82;
          }
        }
      }

      function neighbours(id) {
        const set = new Set([id]);
        for (const link of links) {
          if (link.source === id) set.add(link.target);
          if (link.target === id) set.add(link.source);
        }
        return set;
      }

      function draw() {
        svg.textContent = '';
        root = el('g');
        svg.append(root);
        applyTransform();

        const linkLayer = el('g');
        const labelLayer = el('g');
        const nodeLayer = el('g');
        root.append(linkLayer, labelLayer, nodeLayer);

        for (const link of links) {
          const a = nodes.find((node) => node.id === link.source);
          const b = nodes.find((node) => node.id === link.target);
          if (!a || !b) continue;
          const line = el('line', {
            x1: a.x,
            y1: a.y,
            x2: b.x,
            y2: b.y,
            'stroke-width': link.weight ? Math.min(5, 1 + link.weight / 3) : 1.5,
            'marker-end': 'url(#arrow)',
          });
          line.setAttribute('class', 'link ' + link.kind);
          link.el = line;
          linkLayer.append(line);
          if (link.label) {
            const text = el('text', {
              x: (a.x + b.x) / 2,
              y: (a.y + b.y) / 2 - 3,
              'text-anchor': 'middle',
            });
            text.setAttribute('class', 'link-label');
            text.textContent = link.label;
            link.labelEl = text;
            labelLayer.append(text);
          }
        }

        const defs = el('defs');
        const marker = el('marker', {
          id: 'arrow',
          viewBox: '0 0 10 10',
          refX: 18,
          refY: 5,
          markerWidth: 5,
          markerHeight: 5,
          orient: 'auto-start-reverse',
        });
        const arrowPath = el('path', { d: 'M 0 0 L 10 5 L 0 10 z' });
        arrowPath.setAttribute('fill', 'currentColor');
        marker.append(arrowPath);
        defs.append(marker);
        root.append(defs);

        for (const node of nodes) {
          const group = el('g');
          group.setAttribute('class', 'node');
          group.setAttribute('tabindex', '0');
          group.setAttribute('role', 'button');
          group.setAttribute('aria-label', node.id);
          const circle = el('circle', { cx: node.x, cy: node.y, r: node.r });
          circle.setAttribute('fill', DATA.palette[node.category] || '#888');
          const text = el('text', {
            x: node.x,
            y: node.y - node.r - 5,
            'text-anchor': 'middle',
          });
          text.textContent = node.label;
          group.append(circle, text);
          node.el = group;
          node.circleEl = circle;
          node.textEl = text;
          nodeLayer.append(group);

          group.addEventListener('pointerenter', () => highlight(node.id));
          group.addEventListener('pointerleave', () => highlight(selected));
          group.addEventListener('focus', () => {
            highlight(node.id);
            select(node);
          });
          group.addEventListener('click', (event) => {
            event.stopPropagation();
            select(node);
          });
          group.addEventListener('pointerdown', (event) => startDrag(event, node));
        }
        applyFilter();
      }

      function positions() {
        for (const node of nodes) {
          node.circleEl.setAttribute('cx', node.x);
          node.circleEl.setAttribute('cy', node.y);
          node.textEl.setAttribute('x', node.x);
          node.textEl.setAttribute('y', node.y - node.r - 5);
        }
        for (const link of links) {
          const a = nodes.find((node) => node.id === link.source);
          const b = nodes.find((node) => node.id === link.target);
          if (!a || !b || !link.el) continue;
          link.el.setAttribute('x1', a.x);
          link.el.setAttribute('y1', a.y);
          link.el.setAttribute('x2', b.x);
          link.el.setAttribute('y2', b.y);
          if (link.labelEl) {
            link.labelEl.setAttribute('x', (a.x + b.x) / 2);
            link.labelEl.setAttribute('y', (a.y + b.y) / 2 - 3);
          }
        }
      }

      function startDrag(event, node) {
        event.preventDefault();
        node.pinned = true;
        const move = (moveEvent) => {
          const point = toLocal(moveEvent);
          node.x = point.x;
          node.y = point.y;
          positions();
        };
        const up = () => {
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', up);
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
      }

      function toLocal(event) {
        const rect = svg.getBoundingClientRect();
        return {
          x: (event.clientX - rect.left - transform.x) / transform.k,
          y: (event.clientY - rect.top - transform.y) / transform.k,
        };
      }

      function applyTransform() {
        if (root)
          root.setAttribute(
            'transform',
            \`translate(\${transform.x},\${transform.y}) scale(\${transform.k})\`,
          );
      }

      /** Frames the whole graph, whatever the viewport — including tiny panes. */
      function fitToView() {
        if (nodes.length === 0) return;
        const box = svg.getBoundingClientRect();
        const width = box.width || 900;
        const height = box.height || 600;
        const pad = 48;
        const xs = nodes.map((node) => node.x);
        const ys = nodes.map((node) => node.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        const scale = Math.min(
          3,
          Math.max(0.3, Math.min((width - pad * 2) / (maxX - minX || 1), (height - pad * 2) / (maxY - minY || 1))),
        );
        transform.k = scale;
        transform.x = width / 2 - ((minX + maxX) / 2) * scale;
        transform.y = height / 2 - ((minY + maxY) / 2) * scale;
        applyTransform();
      }

      function highlight(id) {
        const query = search.value.trim().toLowerCase();
        // A search query wins over the neighbourhood highlight: otherwise a
        // selected node would hide every match outside its own neighbours.
        const near = !query && id ? neighbours(id) : null;
        const visible = new Set();
        for (const node of nodes) {
          const shown = query
            ? node.id.toLowerCase().includes(query)
            : !near || near.has(node.id);
          node.el.classList.toggle('dim', !shown);
          if (shown) visible.add(node.id);
        }
        for (const link of links) {
          if (!link.el) continue;
          const typeShown = showTypes.checked || link.kind !== 'type';
          const shown = typeShown && visible.has(link.source) && visible.has(link.target);
          link.el.style.display = typeShown ? '' : 'none';
          link.el.classList.toggle('dim', !shown);
          if (link.labelEl) {
            link.labelEl.style.display = typeShown ? '' : 'none';
            link.labelEl.classList.toggle('dim', !shown);
          }
        }
      }

      function applyFilter() {
        highlight(selected);
      }

      function select(node) {
        selected = node ? node.id : null;
        for (const other of nodes) other.el.classList.toggle('selected', other === node);
        if (!node) {
          panel.innerHTML =
            '<p class="empty">Click a node to inspect it. Drag to move, scroll to zoom.</p>';
          return;
        }
        const incoming = links.filter((link) => link.target === node.id).map((l) => l.source);
        const outgoing = links.filter((link) => link.source === node.id).map((l) => l.target);
        const list = (items) =>
          items.length
            ? '<ul>' + items.map((item) => \`<li>\${item}</li>\`).join('') + '</ul>'
            : '<p class="empty">none</p>';
        panel.innerHTML =
          \`<h2>\${node.id}</h2><span class="cat">\${node.category}</span><dl>\` +
          node.detail
            .map(([term, value]) => \`<dt>\${term}</dt><dd>\${value || '—'}</dd>\`)
            .join('') +
          \`<dt>depends on (\${outgoing.length})</dt><dd>\${list(outgoing)}</dd>\` +
          \`<dt>depended on by (\${incoming.length})</dt><dd>\${list(incoming)}</dd></dl>\`;
        highlight(node.id);
      }

      function load(next) {
        view = next;
        selected = null;
        const width = svg.clientWidth || 900;
        const height = svg.clientHeight || 600;
        nodes = view.nodes.map((node, index) => {
          const angle = (index / view.nodes.length) * Math.PI * 2;
          return {
            ...node,
            x: width / 2 + Math.cos(angle) * 180,
            y: height / 2 + Math.sin(angle) * 180,
            vx: 0,
            vy: 0,
            r: 8,
          };
        });
        links = view.links.map((link) => ({ ...link }));
        transform = { x: 0, y: 0, k: 1 };
        hint.textContent = view.hint;
        simulate();
        draw();
        fitToView();
        select(null);
        for (const button of document.querySelectorAll('#tabs button'))
          button.setAttribute('aria-pressed', String(button.dataset.id === view.id));
      }

      // --- chrome ---------------------------------------------------------
      const tabs = document.getElementById('tabs');
      for (const candidate of DATA.views) {
        const button = document.createElement('button');
        button.textContent = candidate.label;
        button.dataset.id = candidate.id;
        button.setAttribute('aria-pressed', 'false');
        button.addEventListener('click', () => load(candidate));
        tabs.append(button);
      }

      const legend = document.getElementById('legend');
      for (const [name, colour] of Object.entries(DATA.palette)) {
        const span = document.createElement('span');
        span.innerHTML =
          \`<i class="swatch" style="background:\${colour}"></i>\` + name;
        legend.append(span);
      }

      search.addEventListener('input', applyFilter);
      showTypes.addEventListener('change', applyFilter);
      document.getElementById('relayout').addEventListener('click', () => {
        for (const node of nodes) node.pinned = false;
        simulate();
        positions();
        fitToView();
      });
      document.getElementById('theme').addEventListener('click', (event) => {
        const dark = document.documentElement.dataset.theme === 'dark';
        document.documentElement.dataset.theme = dark ? 'light' : 'dark';
        event.target.textContent = dark ? 'Dark' : 'Light';
      });
      svg.addEventListener('click', () => select(null));
      svg.addEventListener(
        'wheel',
        (event) => {
          event.preventDefault();
          const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12;
          transform.k = Math.max(0.3, Math.min(3, transform.k * factor));
          applyTransform();
        },
        { passive: false },
      );
      svg.addEventListener('pointerdown', (event) => {
        if (event.target !== svg) return;
        svg.classList.add('panning');
        const startX = event.clientX - transform.x;
        const startY = event.clientY - transform.y;
        const move = (moveEvent) => {
          transform.x = moveEvent.clientX - startX;
          transform.y = moveEvent.clientY - startY;
          applyTransform();
        };
        const up = () => {
          svg.classList.remove('panning');
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', up);
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
      });
      window.addEventListener('resize', () => {
        positions();
        fitToView();
      });

      load(DATA.views[0]);
    </script>
  </body>
</html>
`;
}
