'use client';

import { forwardRef, useId, useMemo } from 'react';
import { useControlled } from '../../hooks/useControlled';
import { cx } from '../../utils/cx';
import { useField } from '../Field/FieldContext';
import { RadioGroupContext } from './RadioGroupContext';
import type { RadioGroupContextValue } from './RadioGroupContext';
import type { RadioGroupProps } from './Radio.types';
import './Radio.css';

/** Classes rendered by {@link RadioGroup} — the documented override surface. */
export const radioGroupClasses = {
  root: 'ui-radio-group',
} as const;

/**
 * Single-select state and shared wiring for the Radios inside. Works
 * controlled (`value` + `onChange`) and uncontrolled (`defaultValue`); the
 * group generates a unique shared `name` when none is given, which is what
 * makes the platform's arrow-key roving work.
 *
 * Accessibility: a `role="radiogroup"` container — name it with `aria-label`
 * or `aria-labelledby`. Inside a {@link Field} the field label, description,
 * error, required, and disabled wire up automatically via `aria-labelledby`
 * / `aria-describedby` / `aria-invalid` / `aria-required` (a group has no
 * single control for the label's `htmlFor` to target). Keyboard behaviour is
 * the native radio model: Tab reaches the checked (or first) radio, arrows
 * move AND select within the group.
 */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  function RadioGroup(props, ref) {
    const field = useField();
    const generatedName = useId();
    const {
      value,
      defaultValue,
      onChange,
      name = generatedName,
      disabled = field?.disabled ?? false,
      required = field?.required || undefined,
      size,
      className,
      children,
      'aria-labelledby': ariaLabelledBy = field?.labelId,
      'aria-describedby': ariaDescribedBy = field?.describedBy,
      'aria-invalid': ariaInvalid = field?.invalid || undefined,
      ...rest
    } = props;

    const [current, setUncontrolled, isControlled] = useControlled(value, defaultValue);

    const context = useMemo<RadioGroupContextValue>(
      () => ({
        name,
        value: current,
        onSelect: (next) => {
          if (!isControlled) setUncontrolled(next);
          onChange?.(next);
        },
        disabled,
        size,
      }),
      [name, current, isControlled, setUncontrolled, onChange, disabled, size],
    );

    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-required={required}
        className={cx(radioGroupClasses.root, className)}
        {...rest}
      >
        <RadioGroupContext.Provider value={context}>{children}</RadioGroupContext.Provider>
      </div>
    );
  },
);
