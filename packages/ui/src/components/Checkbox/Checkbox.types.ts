import type { InputHTMLAttributes } from 'react';

/** Control sizes shipped with Checkbox. */
export type CheckboxSize = 'sm' | 'md' | 'lg';

/**
 * Extends the native input props except `type` (fixed to `checkbox`) and
 * `size` (the native character-width attribute, replaced by the size union).
 */
export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size'
> {
  /**
   * Visual size of the control.
   * @default 'md' (themeable via ThemeProvider componentDefaults)
   */
  size?: CheckboxSize;
  /**
   * Renders the mixed state ("some but not all selected"). This is a DOM
   * property, not an attribute, so it is applied via the internal ref;
   * assistive tech reports it as `mixed`. Independent of `checked`.
   * @default false
   */
  indeterminate?: boolean;
}
