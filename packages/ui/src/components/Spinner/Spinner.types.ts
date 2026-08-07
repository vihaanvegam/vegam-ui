import type { HTMLAttributes } from 'react';

/** Spinner sizes, mapped to the icon size ramp. */
export type SpinnerSize = 'sm' | 'md' | 'lg';

/** Props for {@link Spinner}. */
export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Diameter, from the `size.icon-*` ramp.
   * @default 'md' (themeable via ThemeProvider componentDefaults)
   */
  size?: SpinnerSize;
  /**
   * Accessible status text announced while busy (e.g. "Loading"). Rendered
   * visually hidden. Omit ONLY when a surrounding live region already
   * announces the loading state — the spinner is then decoration and is
   * hidden from assistive tech.
   */
  label?: string;
}
