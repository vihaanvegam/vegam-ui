'use client';

import { forwardRef } from 'react';
import { useComponentDefaults } from '../../theme/defaultProps';
import { cx } from '../../utils/cx';
import { useField } from '../Field/FieldContext';
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
 *
 * Inside a {@link Field}, the id, `aria-describedby`, `aria-invalid`,
 * `aria-required`, and `disabled` wire up from the field automatically —
 * explicit props always win.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  const defaults = useComponentDefaults('Input');
  const field = useField();
  const {
    size = defaults.size ?? 'md',
    className,
    id = field?.controlId,
    disabled = field?.disabled || undefined,
    'aria-describedby': ariaDescribedBy = field?.describedBy,
    'aria-invalid': ariaInvalid = field?.invalid || undefined,
    'aria-required': ariaRequired = field?.required || undefined,
    ...rest
  } = props;

  return (
    <input
      ref={ref}
      id={id}
      disabled={disabled}
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid}
      aria-required={ariaRequired}
      className={cx(inputClasses.root, inputClasses[size], className)}
      {...rest}
    />
  );
});
