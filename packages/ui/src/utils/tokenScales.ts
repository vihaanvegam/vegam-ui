/**
 * Hand-written token-key scales for token-typed props (BLUEPRINT §4: "Box —
 * token-typed style props WITHOUT a style engine"). Each runtime array is the
 * single source of its union type, and a unit test asserts the arrays match
 * the token export — the same drift protection as `breakpoints.ts`.
 *
 * Regenerating these from tokens.json at build time is a TOKENS_PLAN note,
 * not a build step: the scales are stable and a red test is protection
 * enough.
 */

/** Space scale steps (token keys). `11` exists in the export but is null. */
export const spaceSteps = [0, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 14, 16, 20, 24] as const;
export type SpaceStep = (typeof spaceSteps)[number];

/** `--ui-space-*` reference for a step (`0.5` → `--ui-space-0-5`). */
export const spaceVar = (step: SpaceStep): string =>
  `var(--ui-space-${String(step).replace('.', '-')})`;

/** Radius scale keys. */
export const radiusSteps = ['none', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl', 'full'] as const;
export type RadiusStep = (typeof radiusSteps)[number];

/** Semantic surface color keys (`--ui-color-surface-*`). */
export const surfaceKeys = ['page', 'subtle', 'disabled', 'overlay'] as const;
export type SurfaceKey = (typeof surfaceKeys)[number];

/** Semantic border color keys (`--ui-color-border-*`). */
export const borderColorKeys = ['default', 'hover', 'error', 'focus'] as const;
export type BorderColorKey = (typeof borderColorKeys)[number];

/** Composed elevation shadow keys (`--ui-elevation-*`, per-scheme values). */
export const elevationSteps = ['sm', 'md', 'lg', 'xl'] as const;
export type ElevationStep = (typeof elevationSteps)[number];

/**
 * Divider tone keys (`--ui-color-divider-*`). `strong` is deliberately
 * excluded — the export maps it to red.500, a known data error
 * (TOKENS_PLAN §4); `on-dark-surface` is excluded as a special-purpose value
 * pending a real use case.
 */
export const dividerTones = ['subtle', 'default', 'accent'] as const;
export type DividerTone = (typeof dividerTones)[number];
