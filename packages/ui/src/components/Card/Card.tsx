'use client';

import { forwardRef } from 'react';
import { useComponentDefaults } from '../../theme/defaultProps';
import { cx } from '../../utils/cx';
import type { CardProps } from './Card.types';
import './Card.css';

/** Classes rendered by {@link Card} — the documented override surface. */
export const cardClasses = {
  root: 'ui-card',
  outlined: 'ui-card--outlined',
  elevated: 'ui-card--elevated',
  paddingNone: 'ui-card--padding-none',
  paddingSm: 'ui-card--padding-sm',
  paddingMd: 'ui-card--padding-md',
  paddingLg: 'ui-card--padding-lg',
} as const;

const paddingClass = {
  none: cardClasses.paddingNone,
  sm: cardClasses.paddingSm,
  md: cardClasses.paddingMd,
  lg: cardClasses.paddingLg,
} as const;

/**
 * A surface container: background, radius, and either a border or an
 * elevation shadow.
 *
 * Accessibility: a generic `<div>` with no implicit role — Card carries no
 * semantics of its own. Give it a heading structure inside, or pass a `role`
 * / `aria-*` props through when a landmark is intended. Not interactive: no
 * focus or keyboard behavior. In dark scheme the elevation shadow remains
 * subtle by design; the surface/border tokens carry the separation.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(props, ref) {
  const defaults = useComponentDefaults('Card');
  const {
    variant = defaults.variant ?? 'outlined',
    padding = defaults.padding ?? 'md',
    className,
    children,
    ...rest
  } = props;

  return (
    <div
      ref={ref}
      className={cx(cardClasses.root, cardClasses[variant], paddingClass[padding], className)}
      {...rest}
    >
      {children}
    </div>
  );
});
