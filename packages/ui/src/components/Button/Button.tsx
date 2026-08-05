'use client';

import { forwardRef } from 'react';
import { useComponentDefaults } from '../../theme/defaultProps';
import { cx } from '../../utils/cx';
import type { ButtonProps } from './Button.types';
import './Button.css';

/** Classes rendered by {@link Button} — the documented override surface. */
export const buttonClasses = {
  root: 'ui-button',
  primary: 'ui-button--primary',
  secondary: 'ui-button--secondary',
  danger: 'ui-button--danger',
  ghost: 'ui-button--ghost',
  sm: 'ui-button--sm',
  md: 'ui-button--md',
  lg: 'ui-button--lg',
} as const;

/**
 * A button.
 *
 * Accessibility: renders a native `<button>`, so Space/Enter activation,
 * focusability, and `disabled` semantics come from the platform. The focus
 * ring is a `:focus-visible` outline driven by the focus tokens. All variant
 * color pairs meet WCAG AA contrast in both light and dark schemes
 * (light: blue-600/white 5.2:1, gray-100/gray-900 16.2:1, red-600/white 4.8:1;
 * dark uses near-black text on brightened fills). Touch targets grow to 44px
 * minimum on coarse pointers.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  const defaults = useComponentDefaults('Button');
  const {
    variant = defaults.variant ?? 'primary',
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
      className={cx(buttonClasses.root, buttonClasses[variant], buttonClasses[size], className)}
      {...rest}
    >
      {children}
    </button>
  );
});
