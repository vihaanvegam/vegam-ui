import type { HTMLAttributes } from 'react';

/** Surface treatments shipped with Card. */
export type CardVariant = 'outlined' | 'elevated';

/** Interior padding steps. */
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Surface treatment: a border, or an elevation shadow.
   * @default 'outlined' (themeable via ThemeProvider componentDefaults)
   */
  variant?: CardVariant;
  /**
   * Interior padding. `none` lets consumers manage their own spacing (e.g.
   * full-bleed media).
   * @default 'md' (themeable via ThemeProvider componentDefaults)
   */
  padding?: CardPadding;
}
