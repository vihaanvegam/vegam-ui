/**
 * Breakpoint lower bounds — the §8.1 exception (DECISIONS.md 2026-08-07).
 *
 * CSS media queries cannot read custom properties, so these rem literals
 * duplicate the `breakpoint.*` tokens. The values exist in exactly two forms:
 * this module (the single JS home, consumed by `useBreakpoint`) and annotated
 * literals in component CSS — always `@media (min-width: 48rem)` followed by
 * a comment naming the token (`--ui-breakpoint-tablet`). A unit test asserts
 * this module matches `tokens.json`, so drift fails CI.
 *
 * `base` is everything below the tablet bound. `--ui-breakpoint-mobile`
 * (22.5rem) is the design's baseline artboard width, not a query bound, and
 * deliberately has no entry here.
 */
export const breakpointWidths = {
  /** `--ui-breakpoint-tablet` — 48rem / 768px */
  tablet: '48rem',
  /** `--ui-breakpoint-laptop` — 64rem / 1024px */
  laptop: '64rem',
  /** `--ui-breakpoint-desktop` — 80rem / 1280px */
  desktop: '80rem',
  /** `--ui-breakpoint-wide` — 100rem / 1600px */
  wide: '100rem',
} as const;

/** A named responsive range: `base` (below tablet) or a breakpoint lower bound. */
export type Breakpoint = 'base' | keyof typeof breakpointWidths;

/** Breakpoints from narrowest to widest — the resolution order for responsive values. */
export const breakpointOrder = [
  'base',
  'tablet',
  'laptop',
  'desktop',
  'wide',
] as const satisfies readonly Breakpoint[];
