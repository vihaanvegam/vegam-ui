'use client';

import { createElement, forwardRef } from 'react';
import { useComponentDefaults } from '../../theme/defaultProps';
import { cx } from '../../utils/cx';
import type { ChipProps } from './Chip.types';
import './Chip.css';

/** Classes rendered by {@link Chip} — the documented override surface. */
export const chipClasses = {
  root: 'ui-chip',
  label: 'ui-chip__label',
  interactive: 'ui-chip--interactive',
  selected: 'ui-chip--selected',
  disabled: 'ui-chip--disabled',
  sm: 'ui-chip--sm',
  md: 'ui-chip--md',
  neutral: 'ui-chip--neutral',
  info: 'ui-chip--info',
  success: 'ui-chip--success',
  warning: 'ui-chip--warning',
  danger: 'ui-chip--danger',
  tag: 'ui-chip--tag',
  remove: 'ui-chip__remove',
} as const;

/**
 * A compact label for a value, filter, or selection — this library's Tag.
 *
 * **Chip vs Badge:** Badge is a static status marker; Chip is the
 * interactive one. Give it `onClick` to make it activatable (it renders a
 * real `<button>`), `onRemove` to make it dismissible, or neither for a
 * plain label.
 *
 * Accessibility: a static chip is a `<span>` with no role — it is just text.
 * With `onClick` the root becomes a native `<button>`, so Enter/Space and
 * disabled semantics come from the platform, and `selected` is exposed as
 * `aria-pressed`. The remove affordance is always its own button (nesting a
 * button inside a button is invalid HTML, so an activatable chip renders the
 * remove control as a SIBLING) and requires `removeLabel` for its accessible
 * name. Selected state carries a border as well as colour, so it does not
 * depend on colour alone.
 */
export const Chip = forwardRef<HTMLElement, ChipProps>(function Chip(props, ref) {
  const defaults = useComponentDefaults('Chip');
  const {
    children,
    tone = defaults.tone ?? 'neutral',
    size = defaults.size ?? 'md',
    onClick,
    onRemove,
    removeLabel,
    disabled = false,
    selected,
    slotProps,
    className,
    ...rest
  } = props;

  const interactive = typeof onClick === 'function';
  const { className: removeClassName, ...removeRest } = slotProps?.remove ?? {};

  const rootClassName = cx(
    chipClasses.root,
    chipClasses[size],
    chipClasses[tone],
    interactive && chipClasses.interactive,
    selected && chipClasses.selected,
    disabled && chipClasses.disabled,
    className,
  );

  const label = <span className={chipClasses.label}>{children}</span>;

  const removeButton =
    onRemove && removeLabel ? (
      <button
        type="button"
        aria-label={removeLabel}
        disabled={disabled || undefined}
        onClick={(event) => {
          // Never let removal also trigger an activatable chip's onClick.
          event.stopPropagation();
          onRemove();
        }}
        className={cx(chipClasses.remove, removeClassName)}
        {...removeRest}
      />
    ) : null;

  // An activatable chip is a <button>; a remove control cannot nest inside
  // it (invalid HTML, and unreachable), so the pair renders as siblings in a
  // wrapper that carries the chip styling instead.
  if (interactive && removeButton) {
    return (
      <span ref={ref as React.Ref<HTMLSpanElement>} className={rootClassName} {...rest}>
        <button
          type="button"
          disabled={disabled || undefined}
          aria-pressed={selected}
          onClick={onClick}
          className={cx(chipClasses.label, chipClasses.interactive)}
        >
          {children}
        </button>
        {removeButton}
      </span>
    );
  }

  if (interactive) {
    return createElement(
      'button',
      {
        ref,
        type: 'button',
        disabled: disabled || undefined,
        'aria-pressed': selected,
        onClick,
        className: rootClassName,
        ...rest,
      },
      label,
    );
  }

  return createElement('span', { ref, className: rootClassName, ...rest }, label, removeButton);
});
