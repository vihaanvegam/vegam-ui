import type { HTMLAttributes } from 'react';

/**
 * Props for {@link Slider}. The root is a `<div>`; `onChange` reports the
 * numeric value (there is no native form event), and the native
 * `defaultValue`/`onChange` div attributes are replaced accordingly.
 *
 * `aria-orientation` is omitted: this slider is horizontal-only, so accepting
 * the attribute would let it claim an orientation it does not render.
 * ARIA the `slider` role does support — `aria-label`, `aria-labelledby`,
 * `aria-describedby`, `aria-invalid`, `aria-valuetext`, `aria-errormessage` —
 * is routed to the thumb; everything else spreads on the root element.
 */
export interface SliderProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue' | 'aria-orientation'
> {
  /** Lower bound. @default 0 */
  min?: number;
  /** Upper bound. @default 100 */
  max?: number;
  /** Snap increment for drag and keyboard. @default 1 */
  step?: number;
  /** Controlled value. */
  value?: number;
  /** Initial value when uncontrolled. @default min */
  defaultValue?: number;
  /** Value change — fires on every drag step and keyboard step. */
  onChange?: (value: number) => void;
  /** Disables interaction and dims the control. @default false */
  disabled?: boolean;
  /** When set, a hidden input carries the value in form submissions. */
  name?: string;
}
