import type { HTMLAttributes } from 'react';

/** Progress bar thickness. */
export type ProgressSize = 'sm' | 'md';

/** Semantic colour of the filled portion. */
export type ProgressTone = 'primary' | 'success' | 'warning' | 'danger';

/** Props for {@link Progress}. */
export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Completion between `min` and `max`. Omit for the INDETERMINATE state
   * (an animated sweep with no percentage announced).
   */
  value?: number;
  /** Lower bound. @default 0 */
  min?: number;
  /** Upper bound. @default 100 */
  max?: number;
  /** Bar thickness. @default 'md' (themeable) */
  size?: ProgressSize;
  /** Fill colour. @default 'primary' (themeable) */
  tone?: ProgressTone;
  /**
   * Human-readable form of the current value ("3 of 10 files"). Announced in
   * place of the raw percentage when set.
   */
  valueText?: string;
}
