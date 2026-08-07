'use client';

import { createElement, forwardRef } from 'react';
import { useComponentDefaults } from '../../theme/defaultProps';
import { cx } from '../../utils/cx';
import type { DividerProps } from './Divider.types';
import './Divider.css';

/** Classes rendered by {@link Divider} — the documented override surface. */
export const dividerClasses = {
  root: 'ui-divider',
  horizontal: 'ui-divider--horizontal',
  vertical: 'ui-divider--vertical',
  subtle: 'ui-divider--subtle',
  default: 'ui-divider--default',
  accent: 'ui-divider--accent',
} as const;

/**
 * A themed rule between content regions, drawn at the hairline border width
 * with the semantic divider colors.
 *
 * Accessibility: horizontal renders a native `<hr>` (implicit `separator`
 * role); vertical renders a `<div role="separator"
 * aria-orientation="vertical">` — `<hr>` is horizontal-only semantically.
 * Both are announced as separators; add `aria-hidden` via props when the
 * rule is purely decorative. Not interactive, not focusable.
 */
export const Divider = forwardRef<HTMLElement, DividerProps>(function Divider(props, ref) {
  const defaults = useComponentDefaults('Divider');
  const {
    orientation = 'horizontal',
    tone = defaults.tone ?? 'default',
    className,
    ...rest
  } = props;

  const vertical = orientation === 'vertical';
  return createElement(vertical ? 'div' : 'hr', {
    ref,
    ...(vertical ? { role: 'separator', 'aria-orientation': 'vertical' } : {}),
    className: cx(
      dividerClasses.root,
      vertical ? dividerClasses.vertical : dividerClasses.horizontal,
      tone !== 'default' && dividerClasses[tone],
      className,
    ),
    ...rest,
  });
});
