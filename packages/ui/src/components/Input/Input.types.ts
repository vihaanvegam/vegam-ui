import type { InputHTMLAttributes } from 'react';

/** Control sizes shipped with Input. */
export type InputSize = 'sm' | 'md' | 'lg';

/**
 * Extends the native input props except `size`: the rarely-used native
 * character-width attribute is replaced by the design-system size union.
 */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Control size: affects typography, padding, and minimum height.
   * @default 'md' (themeable via ThemeProvider componentDefaults)
   */
  size?: InputSize;
}
