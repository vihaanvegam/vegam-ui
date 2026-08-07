import type { HTMLAttributes } from 'react';
import type { ResponsiveValue } from '../../utils/responsive';
import type { SpaceStep } from '../../utils/tokenScales';

/**
 * Props for {@link Grid}. The column model is explicit responsive `columns`
 * (equal-width tracks); the `minChildWidth` auto-fill model was considered
 * and rejected at build time — DECISIONS 2026-08-07.
 */
export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  /** Number of equal-width columns (≥1). @default 1 */
  columns?: ResponsiveValue<number>;
  /** Gap between tracks, both axes — space scale step. Themeable. @default 0 */
  gap?: ResponsiveValue<SpaceStep>;
  /** Row gap override — beats `gap` on the block axis. */
  rowGap?: ResponsiveValue<SpaceStep>;
  /** Column gap override — beats `gap` on the inline axis. */
  columnGap?: ResponsiveValue<SpaceStep>;
}
