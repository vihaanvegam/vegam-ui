'use client';

import { forwardRef, useId, useMemo } from 'react';
import { cx } from '../../utils/cx';
import { FieldContext } from './FieldContext';
import type { FieldContextValue } from './FieldContext';
import type { FieldProps } from './Field.types';
import './Field.css';

/** Classes rendered by {@link Field} — the documented override surface. */
export const fieldClasses = {
  root: 'ui-field',
  invalid: 'ui-field--invalid',
  disabled: 'ui-field--disabled',
  label: 'ui-field__label',
  required: 'ui-field__required',
  description: 'ui-field__description',
  error: 'ui-field__error',
} as const;

/**
 * Label/description/error wiring around exactly ONE control (BLUEPRINT §4).
 * `useId` generates the control/label/description/error ids and a
 * FieldContext carries them; library controls read the context automatically
 * — explicit props on the control always win. All copy is consumer content.
 *
 * Accessibility: the `<label htmlFor>` targets the wrapped control's
 * generated id (labelable elements — input, textarea, select trigger button).
 * Group controls (RadioGroup) use the label's id via `aria-labelledby`
 * instead. Description and error are joined into the control's
 * `aria-describedby`; error presence also sets `aria-invalid` on the control,
 * so the visual and assistive-tech states cannot desynchronize. The required
 * marker is `aria-hidden` — `aria-required` on the control carries the
 * semantics.
 */
export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(props, ref) {
  const {
    label,
    description,
    error,
    required = false,
    disabled = false,
    requiredMarker,
    slotProps,
    className,
    children,
    ...rest
  } = props;

  const id = useId();
  const controlId = `${id}-control`;
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const invalid = error !== undefined && error !== null && error !== false;

  const describedBy =
    [description ? descriptionId : null, invalid ? errorId : null].filter(Boolean).join(' ') ||
    undefined;

  const context = useMemo<FieldContextValue>(
    () => ({ controlId, labelId, describedBy, invalid, required, disabled }),
    [controlId, labelId, describedBy, invalid, required, disabled],
  );

  const { className: labelClassName, ...labelRest } = slotProps?.label ?? {};
  const { className: descriptionClassName, ...descriptionRest } = slotProps?.description ?? {};
  const { className: errorClassName, ...errorRest } = slotProps?.error ?? {};

  return (
    <div
      ref={ref}
      className={cx(
        fieldClasses.root,
        invalid && fieldClasses.invalid,
        disabled && fieldClasses.disabled,
        className,
      )}
      data-invalid={invalid || undefined}
      {...rest}
    >
      <label
        id={labelId}
        htmlFor={controlId}
        className={cx(fieldClasses.label, labelClassName)}
        {...labelRest}
      >
        {label}
        {required && requiredMarker !== undefined ? (
          <span aria-hidden="true" className={fieldClasses.required}>
            {requiredMarker}
          </span>
        ) : null}
      </label>
      {description ? (
        <div
          id={descriptionId}
          className={cx(fieldClasses.description, descriptionClassName)}
          {...descriptionRest}
        >
          {description}
        </div>
      ) : null}
      <FieldContext.Provider value={context}>{children}</FieldContext.Provider>
      {invalid ? (
        <div id={errorId} className={cx(fieldClasses.error, errorClassName)} {...errorRest}>
          {error}
        </div>
      ) : null}
    </div>
  );
});
