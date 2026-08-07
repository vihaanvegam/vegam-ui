'use client';

import { createElement, forwardRef } from 'react';
import { useComponentDefaults } from '../../theme/defaultProps';
import { cx } from '../../utils/cx';
import type { ContainerProps, ContainerSize } from './Container.types';
import './Container.css';

/** Classes rendered by {@link Container} — the documented override surface. */
export const containerClasses = {
  root: 'ui-container',
  tablet: 'ui-container--tablet',
  laptop: 'ui-container--laptop',
  desktop: 'ui-container--desktop',
  wide: 'ui-container--wide',
} as const;

const sizeClass: Record<ContainerSize, string> = {
  tablet: containerClasses.tablet,
  laptop: containerClasses.laptop,
  desktop: containerClasses.desktop,
  wide: containerClasses.wide,
};

/**
 * Centered page shell: caps content at the viewport tier's content-max for
 * the chosen `size`, centers it, and applies the current breakpoint's page
 * margin as inline padding — max-widths, margins, and gutters all come
 * straight from the `--ui-viewport-*` tokens.
 *
 * Accessibility: renders the element given by `as` (default `div`) with no
 * implicit role — choose `as` for document structure (`main`, `section`, …).
 * Layout only.
 */
export const Container = forwardRef<HTMLElement, ContainerProps>(function Container(props, ref) {
  const defaults = useComponentDefaults('Container');
  const { as = 'div', size = defaults.size ?? 'desktop', className, children, ...rest } = props;

  return createElement(
    as,
    {
      ref,
      className: cx(containerClasses.root, sizeClass[size], className),
      ...rest,
    },
    children,
  );
});
