import type { HTMLAttributes, InputHTMLAttributes } from 'react';

/** Control sizes shipped with Radio (Checkbox's ladder). */
export type RadioSize = 'sm' | 'md' | 'lg';

/**
 * Extends the native radio input props except `size` (replaced by the
 * design-system union, Input precedent). Inside a {@link RadioGroup}, `name`,
 * `checked`, and `disabled` wire up from the group automatically — explicit
 * props always win.
 */
export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Control size: the drawn circle's diameter.
   * @default 'md' (group `size`, then themeable via ThemeProvider componentDefaults)
   */
  size?: RadioSize;
}

/**
 * Props for {@link RadioGroup} — single-select state and shared wiring for
 * the Radios inside. `onChange` reports the selected value (the native
 * event-level `onChange` lives on each Radio).
 */
export interface RadioGroupProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
  /** Controlled selected value. */
  value?: string;
  /** Initial selected value when uncontrolled. */
  defaultValue?: string;
  /** Selection change — receives the newly selected Radio's `value`. */
  onChange?: (value: string) => void;
  /** Shared input name. @default a generated unique name */
  name?: string;
  /** Disables every Radio in the group. @default false */
  disabled?: boolean;
  /** Marks the group required (`aria-required`). */
  required?: boolean;
  /** Size applied to every Radio without an explicit `size`. */
  size?: RadioSize;
}
