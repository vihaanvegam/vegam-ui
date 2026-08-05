import type { HTMLAttributes } from 'react';

/** Flex direction of the stack. */
export type StackDirection = 'column' | 'row';

/** Gap steps — the space token scale (--ui-space-N). */
export type StackGap = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;

/** Cross-axis alignment. */
export type StackAlign = 'start' | 'center' | 'end' | 'stretch';

/** Main-axis distribution. */
export type StackJustify = 'start' | 'center' | 'end' | 'between';

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Layout axis.
   * @default 'column'
   */
  direction?: StackDirection;
  /**
   * Gap between children as a step on the space scale (4px base).
   * @default 4 (themeable via ThemeProvider componentDefaults)
   */
  gap?: StackGap;
  /**
   * Cross-axis alignment. Omit for the flexbox default (stretch).
   * @default undefined
   */
  align?: StackAlign;
  /**
   * Main-axis distribution. Omit for the flexbox default (start).
   * @default undefined
   */
  justify?: StackJustify;
}
