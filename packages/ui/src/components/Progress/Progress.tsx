'use client';

import { forwardRef } from 'react';
import type { CSSProperties } from 'react';
import { useComponentDefaults } from '../../theme/defaultProps';
import { cx } from '../../utils/cx';
import type { ProgressProps } from './Progress.types';
import './Progress.css';

/** Classes rendered by {@link Progress} — the documented override surface. */
export const progressClasses = {
  root: 'ui-progress',
  sm: 'ui-progress--sm',
  md: 'ui-progress--md',
  primary: 'ui-progress--primary',
  success: 'ui-progress--success',
  warning: 'ui-progress--warning',
  danger: 'ui-progress--danger',
  indeterminate: 'ui-progress--indeterminate',
  fill: 'ui-progress__fill',
} as const;

/**
 * A progress bar. With `value` it is determinate and announces a percentage
 * (or `valueText`); without `value` it is indeterminate — an animated sweep
 * that reports busy-ness without a number. Use Spinner when there is no
 * meaningful track to draw.
 *
 * Accessibility: `role="progressbar"` with `aria-valuemin`/`-valuemax` and,
 * when determinate, `aria-valuenow` (+ `aria-valuetext` from `valueText`).
 * An indeterminate bar deliberately omits `aria-valuenow`, which is exactly
 * how assistive tech is told the value is unknown. Name it with `aria-label`
 * or `aria-labelledby` — the component ships no copy. Not focusable and not
 * interactive. Motion stops under `prefers-reduced-motion`.
 */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(props, ref) {
  const defaults = useComponentDefaults('Progress');
  const {
    value,
    min = 0,
    max = 100,
    size = defaults.size ?? 'md',
    tone = defaults.tone ?? 'primary',
    valueText,
    className,
    style,
    ...rest
  } = props;

  const indeterminate = value === undefined;
  const clamped = indeterminate ? 0 : Math.min(max, Math.max(min, value));
  const percent = max > min ? ((clamped - min) / (max - min)) * 100 : 0;

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={indeterminate ? undefined : clamped}
      aria-valuetext={indeterminate ? undefined : valueText}
      className={cx(
        progressClasses.root,
        progressClasses[size],
        progressClasses[tone],
        indeterminate && progressClasses.indeterminate,
        className,
      )}
      style={style}
      {...rest}
    >
      <div
        className={progressClasses.fill}
        style={indeterminate ? undefined : ({ inlineSize: `${percent}%` } as CSSProperties)}
      />
    </div>
  );
});
