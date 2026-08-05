import type { ButtonHTMLAttributes } from 'react';

/** Visual styles shipped with Button. */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

/** Control sizes shipped with Button. */
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual style of the button.
   * @default 'primary' (themeable via ThemeProvider componentDefaults)
   */
  variant?: ButtonVariant;
  /**
   * Control size: affects typography, padding, and minimum height.
   * @default 'md' (themeable via ThemeProvider componentDefaults)
   */
  size?: ButtonSize;
  /**
   * Native button type. Unlike the DOM default (`submit`), this defaults to
   * `button` so placing a Button inside a form never submits accidentally.
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset';
}
