'use client';

import { forwardRef } from 'react';
import { useComponentDefaults } from '../../theme/defaultProps';
import { cx } from '../../utils/cx';
import type { StackProps } from './Stack.types';
import './Stack.css';

/** Classes rendered by {@link Stack} — the documented override surface. */
export const stackClasses = {
  root: 'ui-stack',
  column: 'ui-stack--column',
  row: 'ui-stack--row',
  gap0: 'ui-stack--gap-0',
  gap1: 'ui-stack--gap-1',
  gap2: 'ui-stack--gap-2',
  gap3: 'ui-stack--gap-3',
  gap4: 'ui-stack--gap-4',
  gap5: 'ui-stack--gap-5',
  gap6: 'ui-stack--gap-6',
  gap8: 'ui-stack--gap-8',
  gap10: 'ui-stack--gap-10',
  gap12: 'ui-stack--gap-12',
  gap16: 'ui-stack--gap-16',
  alignStart: 'ui-stack--align-start',
  alignCenter: 'ui-stack--align-center',
  alignEnd: 'ui-stack--align-end',
  alignStretch: 'ui-stack--align-stretch',
  justifyStart: 'ui-stack--justify-start',
  justifyCenter: 'ui-stack--justify-center',
  justifyEnd: 'ui-stack--justify-end',
  justifyBetween: 'ui-stack--justify-between',
} as const;

const alignClass = {
  start: stackClasses.alignStart,
  center: stackClasses.alignCenter,
  end: stackClasses.alignEnd,
  stretch: stackClasses.alignStretch,
} as const;

const justifyClass = {
  start: stackClasses.justifyStart,
  center: stackClasses.justifyCenter,
  end: stackClasses.justifyEnd,
  between: stackClasses.justifyBetween,
} as const;

/**
 * A flex layout primitive: stacks children along one axis with a token gap.
 * Every step maps to a class over the space scale — no inline styles, no
 * runtime style computation, arbitrary values deliberately unsupported.
 *
 * Accessibility: a generic `<div>` with no implicit role and no interaction.
 * Layout only — pass `role`/`aria-*` through when the group has meaning.
 */
export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(props, ref) {
  const defaults = useComponentDefaults('Stack');
  const {
    direction = 'column',
    gap = defaults.gap ?? 4,
    align,
    justify,
    className,
    children,
    ...rest
  } = props;

  return (
    <div
      ref={ref}
      className={cx(
        stackClasses.root,
        stackClasses[direction],
        stackClasses[`gap${gap}`],
        align && alignClass[align],
        justify && justifyClass[justify],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});
