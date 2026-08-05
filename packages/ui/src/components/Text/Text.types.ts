import type { HTMLAttributes } from 'react';

/** Elements Text can render. Pick for meaning, not for looks. */
export type TextAs =
  'p' | 'span' | 'div' | 'label' | 'strong' | 'em' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

/** Steps of the type scale, smallest to largest (`--ui-font-size-*`). */
export type TextSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl' | 'display';

/** Font weights shipped with the token set. */
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';

/** Semantic text colors. */
export type TextTone = 'primary' | 'muted' | 'disabled' | 'danger' | 'success' | 'warning';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  /**
   * The element to render. Visual style is controlled independently via
   * `size`/`weight`/`tone`, so headings can be any size the design needs
   * without breaking document outline.
   * @default 'p'
   */
  as?: TextAs;
  /**
   * Step on the modular type scale. Omit to inherit the surrounding font size.
   * @default undefined (inherits; themeable via ThemeProvider componentDefaults)
   */
  size?: TextSize;
  /**
   * Font weight. Omit to inherit.
   * @default undefined (inherits; themeable via ThemeProvider componentDefaults)
   */
  weight?: TextWeight;
  /**
   * Semantic text color. Omit to inherit the surrounding color.
   * @default undefined (inherits; themeable via ThemeProvider componentDefaults)
   */
  tone?: TextTone;
}
