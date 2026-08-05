import type { HTMLAttributes } from 'react';

/** Status tones shipped with Badge. */
export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Status color pair (subtle background + readable text).
   * @default 'neutral' (themeable via ThemeProvider componentDefaults)
   */
  tone?: BadgeTone;
}
