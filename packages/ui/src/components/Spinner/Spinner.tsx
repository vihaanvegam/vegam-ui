'use client';

import { forwardRef } from 'react';
import { useComponentDefaults } from '../../theme/defaultProps';
import { cx } from '../../utils/cx';
import type { SpinnerProps } from './Spinner.types';
import './Spinner.css';

/** Classes rendered by {@link Spinner} — the documented override surface. */
export const spinnerClasses = {
  root: 'ui-spinner',
  sm: 'ui-spinner--sm',
  md: 'ui-spinner--md',
  lg: 'ui-spinner--lg',
  label: 'ui-spinner__label',
} as const;

/**
 * An indeterminate busy indicator — a rotating ring drawn from borders, with
 * no icon assets. For progress with a known percentage use Progress; for
 * content-shaped placeholders use Skeleton.
 *
 * Accessibility: with a `label`, the root is `role="status"` (an implicit
 * `aria-live="polite"` region) and the label text is rendered visually
 * hidden, so screen readers announce it when the spinner appears. Without a
 * label it is `aria-hidden` decoration — correct only when a surrounding
 * live region already announces the loading state, otherwise the busy state
 * is silent. Rotation stops under `prefers-reduced-motion` while the ring
 * stays visible.
 */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(props, ref) {
  const defaults = useComponentDefaults('Spinner');
  const { size = defaults.size ?? 'md', label, className, ...rest } = props;

  const labelled = label !== undefined && label !== '';

  return (
    <span
      ref={ref}
      role={labelled ? 'status' : undefined}
      aria-hidden={labelled ? undefined : 'true'}
      className={cx(spinnerClasses.root, spinnerClasses[size], className)}
      {...rest}
    >
      {labelled ? <span className={spinnerClasses.label}>{label}</span> : null}
    </span>
  );
});
