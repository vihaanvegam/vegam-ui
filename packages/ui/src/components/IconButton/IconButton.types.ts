import type { ButtonHTMLAttributes } from 'react';
import type { ButtonSize, ButtonVariant } from '../Button/Button.types';

/**
 * The accessible name is REQUIRED: an icon-only button says nothing to
 * assistive tech without one. Exactly one of `aria-label` or
 * `aria-labelledby` must be provided — the union makes omitting both a type
 * error.
 */
export type IconButtonName =
  | { 'aria-label': string; 'aria-labelledby'?: never }
  | { 'aria-labelledby': string; 'aria-label'?: never };

/**
 * Props for {@link IconButton}: Button's variants and sizes on a square
 * control. The glyph is `children` — consumer content, never shipped.
 */
export type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label' | 'aria-labelledby'
> &
  IconButtonName & {
    /**
     * Visual style, shared with Button.
     * @default 'ghost' (themeable via ThemeProvider componentDefaults) —
     * icon-only actions are usually toolbar-weight, not page-primary.
     */
    variant?: ButtonVariant;
    /**
     * Square control size, matching Button's height ladder.
     * @default 'md' (themeable via ThemeProvider componentDefaults)
     */
    size?: ButtonSize;
  };
