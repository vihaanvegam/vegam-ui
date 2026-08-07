'use client';

import { forwardRef } from 'react';
import { useComponentDefaults } from '../../theme/defaultProps';
import { cx } from '../../utils/cx';
import { buttonClasses } from '../Button/Button';
import type { IconButtonProps } from './IconButton.types';
import './IconButton.css';

/** Classes rendered by {@link IconButton} — the documented override surface. */
export const iconButtonClasses = {
  root: 'ui-icon-button',
  sm: 'ui-icon-button--sm',
  md: 'ui-icon-button--md',
  lg: 'ui-icon-button--lg',
} as const;

/**
 * Button's square sibling for icon-only actions. Composes Button's variant
 * classes for every color and state, adding only the square geometry — the
 * two can never drift apart visually. The glyph is `children` (the library
 * ships no icon assets; pass an `@vegam-ui/icons` icon once Phase 5 lands,
 * or any SVG).
 *
 * Accessibility: the accessible name is REQUIRED at the type level — exactly
 * one of `aria-label` or `aria-labelledby`. `type` defaults to `"button"`
 * (Button's documented departure from the DOM). Focus ring, disabled
 * semantics, and 44px coarse-pointer targets come with the composed Button
 * styles; the width floor matches on coarse pointers too. Mark the glyph
 * `aria-hidden` if it is an `<svg>` without its own title.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(props, ref) {
    const defaults = useComponentDefaults('IconButton');
    const {
      variant = defaults.variant ?? 'ghost',
      size = defaults.size ?? 'md',
      type = 'button',
      className,
      children,
      ...rest
    } = props;

    return (
      <button
        ref={ref}
        type={type}
        className={cx(
          buttonClasses.root,
          buttonClasses[variant],
          buttonClasses[size],
          iconButtonClasses.root,
          iconButtonClasses[size],
          className,
        )}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
