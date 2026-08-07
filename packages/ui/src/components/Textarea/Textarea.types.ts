import type { TextareaHTMLAttributes } from 'react';

/** Control sizes shipped with Textarea (Input's ladder). */
export type TextareaSize = 'sm' | 'md' | 'lg';

/**
 * Extends the native textarea props. Fixed height comes from the native
 * `rows` attribute; autosize is opted into via `minRows`/`maxRows` ONLY —
 * there are no height props.
 */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Control size: affects typography and padding.
   * @default 'md' (themeable via ThemeProvider componentDefaults)
   */
  size?: TextareaSize;
  /**
   * Enables autosize: the textarea grows with its content, never shorter
   * than this many rows. Ignore `rows` when set.
   */
  minRows?: number;
  /**
   * Upper bound for autosize, in rows; beyond it the content scrolls.
   * Implies autosize (with `minRows` defaulting to 2).
   */
  maxRows?: number;
}
