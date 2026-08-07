---
'@vegam-ui/ui': minor
---

Phase 4 navigation & data — seven new components, completing the committed
catalog:

- `Tabs` — APG tabs with roving tabindex, wrapping arrows, and
  `automatic`/`manual` activation; items carry their own panel content.
- `Link` — real anchors with `slots.anchor` for router integration;
  `external` pairs a safe `target`/`rel` with a required, announced
  `newTabLabel`.
- `Pagination` — `<nav>` landmark composed from Button/IconButton, with
  `aria-current="page"`, inert ellipses, and an exported `paginationRange`.
- `Accordion` — disclosure sections at a configurable heading level, single
  or `multiple`; collapsed panels unmount.
- `Avatar` — image with initials fallback (grapheme-safe via
  `Intl.Segmenter`) and automatic fallback on image error.
- `Chip` — this library's Tag: static, activatable (`aria-pressed`), and/or
  removable; an activatable+removable chip renders sibling buttons rather
  than invalid nested ones.
- `Table` — semantic data table with `slots.headerCell`/`slots.cell`,
  `aria-sort` reporting, sticky header, and empty state. **ui never sorts
  data** — it reports intent via `onSortChange`.

Also: roving tabindex is now the shared `useRovingFocus` hook, which Menu
adopts too, and `nextEnabledIndex` gained an opt-in `loop`. New
`componentDefaults` keys: `Tabs` (orientation, activation), `Link` (variant),
`Avatar` (size, shape), `Chip` (tone, size).
