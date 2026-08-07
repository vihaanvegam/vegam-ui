import type { HTMLAttributes } from 'react';
import type { RadiusStep } from '../../utils/tokenScales';

/** Placeholder shape. */
export type SkeletonVariant = 'text' | 'rect' | 'circle';

/** Props for {@link Skeleton}. */
export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Shape: `text` is a line whose height follows the current font,
   * `rect` fills the size you give it, `circle` is a 1:1 disc.
   * @default 'text' (themeable)
   */
  variant?: SkeletonVariant;
  /** Any CSS length. @default '100%' */
  width?: string;
  /** Any CSS length. Ignored by `text` (font-derived) and `circle` (= width). */
  height?: string;
  /** Corner radius. Ignored by `circle`. @default variant-dependent */
  radius?: RadiusStep;
  /** Number of stacked lines. `text` only. @default 1 */
  lines?: number;
}
