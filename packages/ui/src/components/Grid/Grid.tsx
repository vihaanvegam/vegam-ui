'use client';

import { forwardRef } from 'react';
import type { CSSProperties } from 'react';
import { useComponentDefaults } from '../../theme/defaultProps';
import { responsiveStyleVars } from '../../utils/responsive';
import { cx } from '../../utils/cx';
import { spaceVar } from '../../utils/tokenScales';
import type { GridProps } from './Grid.types';
import './Grid.css';

/** Classes rendered by {@link Grid} — the documented override surface. */
export const gridClasses = {
  root: 'ui-grid',
} as const;

/**
 * CSS grid with responsive equal-width columns
 * (`repeat(columns, minmax(0, 1fr))`) and token gaps. For anything beyond
 * uniform tracks (named areas, spans, auto-fill), use `className`/`style` on
 * Grid or reach for raw CSS grid — this primitive deliberately stays small.
 *
 * Accessibility: a generic `<div>` with no implicit role and no interaction.
 * Layout only — pass `role`/`aria-*` through when the group has meaning.
 */
export const Grid = forwardRef<HTMLDivElement, GridProps>(function Grid(props, ref) {
  const defaults = useComponentDefaults('Grid');
  const {
    columns,
    gap = defaults.gap,
    rowGap,
    columnGap,
    className,
    style,
    children,
    ...rest
  } = props;

  const vars: Record<string, string> = {
    ...responsiveStyleVars('--ui-grid-columns', columns, String),
    ...responsiveStyleVars('--ui-grid-gap', gap, spaceVar),
    ...responsiveStyleVars('--ui-grid-row-gap', rowGap, spaceVar),
    ...responsiveStyleVars('--ui-grid-column-gap', columnGap, spaceVar),
  };

  return (
    <div
      ref={ref}
      className={cx(gridClasses.root, className)}
      style={{ ...vars, ...style } as CSSProperties}
      {...rest}
    >
      {children}
    </div>
  );
});
