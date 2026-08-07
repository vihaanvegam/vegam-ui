import type { HTMLAttributes } from 'react';
import type { DividerTone } from '../../utils/tokenScales';

/** Divider axis. */
export type DividerOrientation = 'horizontal' | 'vertical';

/**
 * Props for {@link Divider}. The element is chosen by orientation
 * (`<hr>` horizontally, `role="separator"` div vertically), so there is no
 * `as` prop.
 */
export interface DividerProps extends HTMLAttributes<HTMLElement> {
  /** Axis. Vertical dividers stretch to their flex/grid container. @default 'horizontal' */
  orientation?: DividerOrientation;
  /**
   * Line color from the divider tokens. `strong` is not offered — the
   * current export maps it to a red (known data error, TOKENS_PLAN §4).
   * Themeable. @default 'default'
   */
  tone?: DividerTone;
}
