---
'@vegam-ui/ui': minor
---

Add the public hooks layer and responsive foundations (BLUEPRINT Phase 0):

- New hooks: `useControlled` (controlled/uncontrolled prop pairs),
  `useMediaQuery` and `useBreakpoint` (SSR-safe via `useSyncExternalStore`;
  server snapshots `false`/`'base'`), `useDismiss` (Escape + outside-pointer
  light dismiss), and `useTransitionState` (enter/exit mount states for CSS
  transitions, honoring `prefers-reduced-motion`).
- New exports: `breakpointWidths`, `breakpointOrder`, and the `Breakpoint`,
  `ResponsiveValue`, `ResponsiveObject`, `UseDismissOptions`,
  `TransitionState`, and `UseTransitionStateResult` types.
- Select and Breadcrumbs now use the shared hooks internally — behavior
  unchanged, with one deliberate nuance: an outside `pointerdown` whose
  `defaultPrevented` is set no longer closes Select's popup (events claimed
  by other UI never dismiss).
- Storybook docs: autodocs prop tables generated from the TypeScript types,
  plus Getting Started and Theming guide pages (docs-only; no runtime
  change).
