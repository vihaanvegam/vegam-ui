import type { ButtonHTMLAttributes, ComponentType, HTMLAttributes, LiHTMLAttributes } from 'react';

/** Control sizes shipped with Select. */
export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption {
  /** The value submitted/reported for this option. */
  value: string;
  /** Visible label; also drives keyboard type-ahead. */
  label: string;
  /** Prevents selection; keyboard navigation skips it. */
  disabled?: boolean;
}

/** Render props handed to a custom option slot. */
export interface SelectOptionRenderProps {
  option: SelectOption;
  /** True when this option is the current value. */
  selected: boolean;
  /** True when this option is the keyboard-active one. */
  active: boolean;
}

/** Replaceable internal parts. */
export interface SelectSlots {
  /** Custom renderer for option content (inside the li[role=option]). */
  option?: ComponentType<SelectOptionRenderProps>;
}

/** Extra props merged onto internal parts (className via cx, style merged). */
export interface SelectSlotProps {
  /** The floating popup container (portal child). */
  popup?: HTMLAttributes<HTMLDivElement>;
  /** The ul[role=listbox]. */
  listbox?: HTMLAttributes<HTMLUListElement>;
  /** Every li[role=option]. */
  option?: LiHTMLAttributes<HTMLLIElement>;
}

/**
 * Extends the native button props (the root element is the trigger button)
 * except `value`/`defaultValue`/`onChange`, which Select redefines for its
 * selection semantics.
 */
export interface SelectProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'value' | 'defaultValue' | 'onChange'
> {
  /** The selectable options, in render order. */
  options: SelectOption[];
  /** Controlled selected value. Pair with `onChange`. */
  value?: string;
  /** Initial value for uncontrolled use. */
  defaultValue?: string;
  /** Called with the newly selected option's value. */
  onChange?: (value: string) => void;
  /** Shown (muted) in the trigger while nothing is selected. */
  placeholder?: string;
  /** When set, renders a hidden form input carrying the current value. */
  name?: string;
  /**
   * Control size: affects typography, padding, and minimum height.
   * @default 'md' (themeable via ThemeProvider componentDefaults)
   */
  size?: SelectSize;
  /** Replaceable internal parts. */
  slots?: SelectSlots;
  /** Extra props for internal parts. */
  slotProps?: SelectSlotProps;
}
