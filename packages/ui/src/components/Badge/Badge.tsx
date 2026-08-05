'use client';

import { forwardRef } from 'react';
import { useComponentDefaults } from '../../theme/defaultProps';
import { cx } from '../../utils/cx';
import type { BadgeProps } from './Badge.types';
import './Badge.css';

/** Classes rendered by {@link Badge} — the documented override surface. */
export const badgeClasses = {
  root: 'ui-badge',
  neutral: 'ui-badge--neutral',
  info: 'ui-badge--info',
  success: 'ui-badge--success',
  warning: 'ui-badge--warning',
  danger: 'ui-badge--danger',
} as const;

/**
 * A small inline status label.
 *
 * Accessibility: an inline `<span>` whose text IS the status — never convey
 * the status by color alone; the label text carries it, so no extra ARIA is
 * needed. Every tone's text/background pair meets WCAG AA in both schemes
 * (feedback-* on feedback-*-subtle). Not interactive: no focus or keyboard
 * behavior of its own.
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(props, ref) {
  const defaults = useComponentDefaults('Badge');
  const { tone = defaults.tone ?? 'neutral', className, children, ...rest } = props;

  return (
    <span ref={ref} className={cx(badgeClasses.root, badgeClasses[tone], className)} {...rest}>
      {children}
    </span>
  );
});
