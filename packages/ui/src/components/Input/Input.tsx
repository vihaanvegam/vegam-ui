'use client';

import { forwardRef } from 'react';
import { useComponentDefaults } from '../../theme/defaultProps';
import { cx } from '../../utils/cx';
import type { InputProps } from './Input.types';
import './Input.css';

/** Classes rendered by {@link Input} — the documented override surface. */
export const inputClasses = {
  root: 'ui-input',
  sm: 'ui-input--sm',
  md: 'ui-input--md',
  lg: 'ui-input--lg',
} as const;

/**
 * A single-line text input.
 *
 * Works controlled (`value` + `onChange`) and uncontrolled (`defaultValue`)
 * exactly like the native element — no wrapper state. Label it with an
 * external `<label htmlFor>` (or `aria-label`); the component deliberately
 * ships no label of its own.
 *
 * Accessibility: renders a native `<input>`, so focus, IME, and form
 * semantics come from the platform. Mark invalid values with the standard
 * `aria-invalid` attribute — the danger styling keys off it, keeping visual
 * state and assistive-tech state impossible to desynchronize. The focus ring
 * is a `:focus-visible` outline driven by the focus tokens; touch targets
 * grow to 44px minimum on coarse pointers.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  const defaults = useComponentDefaults('Input');
  const { size = defaults.size ?? 'md', className, ...rest } = props;

  return (
    <input ref={ref} className={cx(inputClasses.root, inputClasses[size], className)} {...rest} />
  );
});
