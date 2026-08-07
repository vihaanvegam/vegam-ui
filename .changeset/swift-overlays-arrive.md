---
'@vegam-ui/ui': minor
---

Phase 3 overlays & feedback — eight new components:

- `Tooltip` — hover/focus text hint; `role="tooltip"` wired to the trigger
  via `aria-describedby`, hover delay from the tooltip-delay token, focus
  opens immediately, Escape dismisses.
- `Popover` — non-modal anchored `role="dialog"` surface for interactive
  content; focus moves in on open and returns to the trigger on close.
- `Menu` — APG menu-button with roving focus, type-ahead, and `slots.item`
  for router links (no ref forwarding needed — items are located by role).
- `Drawer` — edge-anchored modal panel reusing Modal's scrim, focus trap and
  scroll lock, with `placement` and slide transitions.
- `ToastProvider` + `useToast()` — queue with polite/assertive live regions
  by intent, auto-dismiss that pauses on hover and focus-within, action and
  close slots.
- `Spinner`, `Progress` (determinate + indeterminate), `Skeleton` — feedback
  primitives; all motion honors `prefers-reduced-motion`.

Also public: `computeAnchoredPlacement` side/align/flip/shift positioning
behind the anchored overlays, and the `Side`/`Align` types. New
`componentDefaults` keys: `Drawer` (placement, size), `Progress` (size,
tone), `Skeleton` (variant), `Spinner` (size).
