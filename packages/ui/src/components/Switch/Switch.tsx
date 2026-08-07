'use client';

import { forwardRef } from 'react';
import { cx } from '../../utils/cx';
import { useField } from '../Field/FieldContext';
import type { SwitchProps } from './Switch.types';
import './Switch.css';

/** Classes rendered by {@link Switch} — the documented override surface. */
export const switchClasses = {
  root: 'ui-switch',
} as const;

/**
 * An on/off toggle for settings that take effect immediately — use Checkbox
 * for selections a form later submits.
 *
 * Works controlled (`checked` + `onChange`) and uncontrolled
 * (`defaultChecked`) exactly like the native element: it IS a native
 * checkbox with `role="switch"`, so Space toggling, focus, and form
 * semantics come from the platform, and its checked state is announced as
 * on/off. The track/thumb are drawn on the input itself from the
 * `size.switch-track-*` tokens (64×32 — the design ships one size);
 * forced-colors mode falls back to the user agent's rendering. Label it
 * with an external `<label htmlFor>`, which also extends the touch target
 * (the 64×32 track clears the WCAG 2.5.8 24px minimum; the Checkbox-precedent
 * deviation from the blanket 44px rule applies).
 *
 * Inside a {@link Field}, the id, `aria-describedby`, `aria-invalid`,
 * `aria-required`, and `disabled` wire up automatically — explicit props
 * always win.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(props, ref) {
  const field = useField();
  const {
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
      type="checkbox"
      role="switch"
      id={id}
      disabled={disabled}
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid}
      aria-required={ariaRequired}
      className={cx(switchClasses.root, className)}
      {...rest}
    />
  );
});
