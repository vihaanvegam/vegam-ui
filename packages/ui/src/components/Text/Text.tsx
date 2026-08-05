'use client';

import { createElement, forwardRef } from 'react';
import { useComponentDefaults } from '../../theme/defaultProps';
import { cx } from '../../utils/cx';
import type { TextProps, TextSize } from './Text.types';
import './Text.css';

/** Classes rendered by {@link Text} — the documented override surface. */
export const textClasses = {
  root: 'ui-text',
  sizeXxs: 'ui-text--size-xxs',
  sizeXs: 'ui-text--size-xs',
  sizeSm: 'ui-text--size-sm',
  sizeMd: 'ui-text--size-md',
  sizeLg: 'ui-text--size-lg',
  sizeXl: 'ui-text--size-xl',
  sizeXxl: 'ui-text--size-xxl',
  sizeXxxl: 'ui-text--size-xxxl',
  sizeDisplay: 'ui-text--size-display',
  regular: 'ui-text--regular',
  medium: 'ui-text--medium',
  semibold: 'ui-text--semibold',
  bold: 'ui-text--bold',
  primary: 'ui-text--primary',
  muted: 'ui-text--muted',
  disabled: 'ui-text--disabled',
  danger: 'ui-text--danger',
  success: 'ui-text--success',
  warning: 'ui-text--warning',
} as const;

const sizeClass: Record<TextSize, string> = {
  xxs: textClasses.sizeXxs,
  xs: textClasses.sizeXs,
  sm: textClasses.sizeSm,
  md: textClasses.sizeMd,
  lg: textClasses.sizeLg,
  xl: textClasses.sizeXl,
  xxl: textClasses.sizeXxl,
  xxxl: textClasses.sizeXxxl,
  display: textClasses.sizeDisplay,
};

/**
 * Typographic primitive. Renders any text element (`as`) with size, weight,
 * and tone mapped straight onto the token scales; every visual prop is
 * optional and inherits when omitted, so Text composes inside styled contexts
 * without fighting them.
 *
 * Accessibility: the element carries the semantics — choose `as` for meaning
 * (heading levels build document outline; `label` needs `htmlFor` via props).
 * Visual size is independent of the heading level, so outlines stay honest.
 * All tone colors meet WCAG AA against the surface backgrounds in both
 * schemes. Not interactive: no focus or keyboard behavior of its own.
 */
export const Text = forwardRef<HTMLElement, TextProps>(function Text(props, ref) {
  const defaults = useComponentDefaults('Text');
  const {
    as = 'p',
    size = defaults.size,
    weight = defaults.weight,
    tone = defaults.tone,
    className,
    children,
    ...rest
  } = props;

  return createElement(
    as,
    {
      ref,
      className: cx(
        textClasses.root,
        size !== undefined && sizeClass[size],
        weight && textClasses[weight],
        tone && textClasses[tone],
        className,
      ),
      ...rest,
    },
    children,
  );
});
