'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import { useComponentDefaults } from '../../theme/defaultProps';
import { cx } from '../../utils/cx';
import { useIsomorphicLayoutEffect } from '../../hooks/useIsomorphicLayoutEffect';
import { useField } from '../Field/FieldContext';
import type { CheckboxProps } from './Checkbox.types';
import './Checkbox.css';

/** Classes rendered by {@link Checkbox} — the documented override surface. */
export const checkboxClasses = {
  root: 'ui-checkbox',
  sm: 'ui-checkbox--sm',
  md: 'ui-checkbox--md',
  lg: 'ui-checkbox--lg',
} as const;

/**
 * A checkbox.
 *
 * Works controlled (`checked` + `onChange`) and uncontrolled
 * (`defaultChecked`) exactly like the native element. Label it with an
 * external `<label htmlFor>` — the label also extends the touch target.
 *
 * Accessibility: renders a native `<input type="checkbox">`, so Space
 * toggling, focus, and form semantics come from the platform; the check
 * glyph is the user agent's own, tinted via `accent-color` from the action
 * token, and adapts to dark scheme through `color-scheme`. `indeterminate`
 * is exposed to assistive tech as `mixed` automatically. The focus ring is
 * a `:focus-visible` outline from the focus tokens. On coarse pointers the
 * control meets the WCAG 2.5.8 AA 24px target minimum — pair with a
 * clickable label for a larger target.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(props, ref) {
  const defaults = useComponentDefaults('Checkbox');
  const field = useField();
  const {
    size = defaults.size ?? 'md',
    indeterminate,
    className,
    id = field?.controlId,
    disabled = field?.disabled || undefined,
    'aria-describedby': ariaDescribedBy = field?.describedBy,
    'aria-invalid': ariaInvalid = field?.invalid || undefined,
    'aria-required': ariaRequired = field?.required || undefined,
    ...rest
  } = props;

  const innerRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

  // indeterminate is a DOM property with no attribute equivalent — set it via
  // the ref, isomorphic so server rendering never touches layout effects.
  useIsomorphicLayoutEffect(() => {
    if (innerRef.current) {
      innerRef.current.indeterminate = indeterminate === true;
    }
  }, [indeterminate]);

  return (
    <input
      ref={innerRef}
      type="checkbox"
      id={id}
      disabled={disabled}
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid}
      aria-required={ariaRequired}
      className={cx(checkboxClasses.root, checkboxClasses[size], className)}
      {...rest}
    />
  );
});
