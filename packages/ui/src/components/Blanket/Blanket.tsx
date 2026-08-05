'use client';

import { forwardRef } from 'react';
import { cx } from '../../utils/cx';
import type { BlanketProps } from './Blanket.types';
import './Blanket.css';

/** Classes rendered by {@link Blanket} — the documented override surface. */
export const blanketClasses = {
  root: 'ui-blanket',
} as const;

/**
 * A full-viewport scrim that dims and blurs the page behind an overlay.
 * Modal composes it; it is also usable standalone behind any custom surface.
 *
 * Accessibility: rendered `aria-hidden` — the scrim is decoration, never
 * content. When a composer wires `onClick` for pointer dismissal, it must
 * also provide a keyboard path (Modal pairs the blanket click with Escape),
 * because an aria-hidden div is intentionally unreachable by keyboard or
 * screen reader. Not focusable; no keyboard behavior of its own.
 */
export const Blanket = forwardRef<HTMLDivElement, BlanketProps>(function Blanket(props, ref) {
  const { className, ...rest } = props;
  return (
    <div ref={ref} aria-hidden="true" className={cx(blanketClasses.root, className)} {...rest} />
  );
});
