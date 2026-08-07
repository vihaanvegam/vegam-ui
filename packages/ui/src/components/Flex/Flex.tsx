'use client';

import { forwardRef } from 'react';
import type { CSSProperties } from 'react';
import { useComponentDefaults } from '../../theme/defaultProps';
import { responsiveStyleVars } from '../../utils/responsive';
import { cx } from '../../utils/cx';
import { spaceVar } from '../../utils/tokenScales';
import type { FlexAlign, FlexJustify, FlexProps } from './Flex.types';
import './Flex.css';

/** Classes rendered by {@link Flex} — the documented override surface. */
export const flexClasses = {
  root: 'ui-flex',
} as const;

const alignKeyword: Record<FlexAlign, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};

const justifyKeyword: Record<FlexJustify, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

/**
 * The full flexbox container surface with responsive props — where Stack is
 * the simple one-axis primitive, Flex exposes direction, wrapping, alignment,
 * distribution, and gap, each accepting per-breakpoint values. `grow` /
 * `shrink` / `basis` style the Flex when it is itself a flex item. Flex has
 * no padding/margin surface — compose with Box for spacing.
 *
 * Accessibility: a generic `<div>` with no implicit role and no interaction.
 * Layout only — pass `role`/`aria-*` through when the group has meaning.
 */
export const Flex = forwardRef<HTMLDivElement, FlexProps>(function Flex(props, ref) {
  const defaults = useComponentDefaults('Flex');
  const {
    direction,
    wrap,
    align,
    justify,
    gap = defaults.gap,
    grow,
    shrink,
    basis,
    className,
    style,
    children,
    ...rest
  } = props;

  const vars: Record<string, string> = {
    ...responsiveStyleVars('--ui-flex-direction', direction, (value) => value),
    ...responsiveStyleVars('--ui-flex-wrap', wrap, (value) => value),
    ...responsiveStyleVars('--ui-flex-align', align, (value) => alignKeyword[value]),
    ...responsiveStyleVars('--ui-flex-justify', justify, (value) => justifyKeyword[value]),
    ...responsiveStyleVars('--ui-flex-gap', gap, spaceVar),
  };
  if (grow !== undefined) vars['--ui-flex-grow'] = String(grow);
  if (shrink !== undefined) vars['--ui-flex-shrink'] = String(shrink);
  if (basis !== undefined) vars['--ui-flex-basis'] = basis === 'auto' ? 'auto' : spaceVar(basis);

  return (
    <div
      ref={ref}
      className={cx(flexClasses.root, className)}
      style={{ ...vars, ...style } as CSSProperties}
      {...rest}
    >
      {children}
    </div>
  );
});
