'use client';

import { createElement, forwardRef } from 'react';
import type { CSSProperties } from 'react';
import { breakpointOrder } from '../../utils/breakpoints';
import { responsiveStyleVars, responsiveValueAt } from '../../utils/responsive';
import type { ResponsiveValue } from '../../utils/responsive';
import { cx } from '../../utils/cx';
import { spaceVar } from '../../utils/tokenScales';
import type { SpaceStep } from '../../utils/tokenScales';
import type { BoxProps } from './Box.types';
import './Box.css';

/** Classes rendered by {@link Box} — the documented override surface. */
export const boxClasses = {
  root: 'ui-box',
  bordered: 'ui-box--bordered',
} as const;

// One padding/margin side: side (pt) beats axis (py) beats all (p), resolved
// per breakpoint with upward inheritance, then deduped — a step equal to the
// previous breakpoint's emits no var, the CSS fallback chain carries it.
function sideVars(
  vars: Record<string, string>,
  name: string,
  side: ResponsiveValue<SpaceStep> | undefined,
  axis: ResponsiveValue<SpaceStep> | undefined,
  all: ResponsiveValue<SpaceStep> | undefined,
): void {
  if (side === undefined && axis === undefined && all === undefined) return;
  let previous: SpaceStep | undefined;
  for (const bp of breakpointOrder) {
    const step =
      responsiveValueAt(side, bp) ?? responsiveValueAt(axis, bp) ?? responsiveValueAt(all, bp);
    if (step !== undefined && step !== previous) {
      vars[`--ui-box-${name}-${bp}`] = spaceVar(step);
      previous = step;
    }
  }
}

/**
 * Token-typed style primitive (BLUEPRINT §4) — deliberately NOT an `sx`
 * escape hatch. A fixed, finite prop surface where every value is a token
 * key, resolved through inline custom properties consumed by static CSS: a
 * map lookup, not a style engine, so arbitrary values are impossible.
 * Anything beyond this surface is what `className`/`style` are for.
 *
 * Accessibility: renders the element given by `as` (default `div`) with no
 * implicit role and no interaction — layout/styling only. Choose `as` for
 * document semantics (`section`, `nav`, `main`, …) and pass `role`/`aria-*`
 * through when the region has meaning.
 */
export const Box = forwardRef<HTMLElement, BoxProps>(function Box(props, ref) {
  const {
    as = 'div',
    p,
    px,
    py,
    pt,
    pr,
    pb,
    pl,
    m,
    mx,
    my,
    mt,
    mr,
    mb,
    ml,
    bg,
    radius,
    borderColor,
    shadow,
    className,
    style,
    children,
    ...rest
  } = props;

  const vars: Record<string, string> = {};
  sideVars(vars, 'pt', pt, py, p);
  sideVars(vars, 'pb', pb, py, p);
  sideVars(vars, 'pl', pl, px, p);
  sideVars(vars, 'pr', pr, px, p);
  sideVars(vars, 'mt', mt, my, m);
  sideVars(vars, 'mb', mb, my, m);
  sideVars(vars, 'ml', ml, mx, m);
  sideVars(vars, 'mr', mr, mx, m);
  Object.assign(
    vars,
    responsiveStyleVars('--ui-box-bg', bg, (key) => `var(--ui-color-surface-${key})`),
    responsiveStyleVars('--ui-box-radius', radius, (key) => `var(--ui-radius-${key})`),
    responsiveStyleVars(
      '--ui-box-border-color',
      borderColor,
      (key) => `var(--ui-color-border-${key})`,
    ),
    responsiveStyleVars('--ui-box-shadow', shadow, (key) => `var(--ui-elevation-${key})`),
  );

  return createElement(
    as,
    {
      ref,
      className: cx(boxClasses.root, borderColor !== undefined && boxClasses.bordered, className),
      style: { ...vars, ...style } as CSSProperties,
      ...rest,
    },
    children,
  );
});
