'use client';

import { forwardRef } from 'react';
import type { CSSProperties } from 'react';
import { useComponentDefaults } from '../../theme/defaultProps';
import { cx } from '../../utils/cx';
import type { SkeletonProps } from './Skeleton.types';
import './Skeleton.css';

/** Classes rendered by {@link Skeleton} — the documented override surface. */
export const skeletonClasses = {
  root: 'ui-skeleton',
  text: 'ui-skeleton--text',
  rect: 'ui-skeleton--rect',
  circle: 'ui-skeleton--circle',
  group: 'ui-skeleton__group',
} as const;

/**
 * A content-shaped loading placeholder. Use it when you know the shape of
 * what is coming (avatar, lines of text, a card); use Spinner when you do
 * not, and Progress when a percentage is known.
 *
 * Accessibility: purely decorative — the whole thing is `aria-hidden`, so
 * screen readers never announce placeholder boxes. **The surrounding region
 * must convey loading some other way** (a `role="status"` live region, or a
 * labelled Spinner), otherwise the wait is silent to assistive tech; the
 * docs page shows the pattern. The shimmer stops under
 * `prefers-reduced-motion`, leaving a flat fill.
 */
export const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(function Skeleton(props, ref) {
  const defaults = useComponentDefaults('Skeleton');
  const {
    variant = defaults.variant ?? 'text',
    width,
    height,
    radius,
    lines = 1,
    className,
    style,
    ...rest
  } = props;

  const vars: Record<string, string> = {};
  if (width !== undefined) vars['--ui-skeleton-width'] = width;
  if (height !== undefined) vars['--ui-skeleton-height'] = height;
  if (radius !== undefined) vars['--ui-skeleton-radius'] = `var(--ui-radius-${radius})`;

  const rootStyle = { ...vars, ...style } as CSSProperties;

  // Multi-line text renders a group whose last line is shortened by CSS, so
  // a paragraph placeholder does not read as a solid block.
  if (variant === 'text' && lines > 1) {
    return (
      <span
        ref={ref}
        aria-hidden="true"
        className={cx(skeletonClasses.group, className)}
        style={rootStyle}
        {...rest}
      >
        {Array.from({ length: lines }, (_, index) => (
          <span key={index} className={cx(skeletonClasses.root, skeletonClasses.text)} />
        ))}
      </span>
    );
  }

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cx(skeletonClasses.root, skeletonClasses[variant], className)}
      style={rootStyle}
      {...rest}
    />
  );
});
