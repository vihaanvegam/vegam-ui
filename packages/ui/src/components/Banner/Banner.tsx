'use client';

import { forwardRef } from 'react';
import { useComponentDefaults } from '../../theme/defaultProps';
import { cx } from '../../utils/cx';
import type { BannerProps } from './Banner.types';
import './Banner.css';

/** Classes rendered by {@link Banner} — the documented override surface. */
export const bannerClasses = {
  root: 'ui-banner',
  info: 'ui-banner--info',
  success: 'ui-banner--success',
  warning: 'ui-banner--warning',
  danger: 'ui-banner--danger',
  icon: 'ui-banner__icon',
  content: 'ui-banner__content',
  title: 'ui-banner__title',
  description: 'ui-banner__description',
  actions: 'ui-banner__actions',
  close: 'ui-banner__close',
} as const;

/**
 * A prominent inline status message: icon · title + description · actions ·
 * close, on an intent-tinted surface.
 *
 * Accessibility: a `<div>` live region — `role="status"` (polite) for
 * info/success, `role="alert"` (assertive) for warning/danger, overridable via
 * the native `role` prop (pass e.g. `role="presentation"` for static page
 * chrome that should not announce). The icon wrapper is `aria-hidden`, so the
 * title text must carry the meaning — never convey the status by color or icon
 * alone. The close button is a native `<button type="button">` named by
 * `closeLabel` (required with `onClose`); it is keyboard-activatable natively,
 * shows the `:focus-visible` ring from the focus tokens, and its target grows
 * to 44px on coarse pointers. Every intent's title/border pair meets WCAG AA
 * on its soft background in both schemes.
 */
export const Banner = forwardRef<HTMLDivElement, BannerProps>(function Banner(props, ref) {
  const defaults = useComponentDefaults('Banner');
  const {
    intent = defaults.intent ?? 'info',
    title,
    icon,
    actions,
    onClose,
    closeLabel,
    slotProps,
    role,
    className,
    children,
    ...rest
  } = props;

  const { className: iconClassName, ...iconRest } = slotProps?.icon ?? {};
  const { className: contentClassName, ...contentRest } = slotProps?.content ?? {};
  const { className: titleClassName, ...titleRest } = slotProps?.title ?? {};
  const { className: descriptionClassName, ...descriptionRest } = slotProps?.description ?? {};
  const { className: actionsClassName, ...actionsRest } = slotProps?.actions ?? {};
  const { className: closeClassName, ...closeRest } = slotProps?.close ?? {};

  return (
    <div
      ref={ref}
      role={role ?? (intent === 'info' || intent === 'success' ? 'status' : 'alert')}
      className={cx(bannerClasses.root, bannerClasses[intent], className)}
      {...rest}
    >
      {icon ? (
        <span aria-hidden="true" className={cx(bannerClasses.icon, iconClassName)} {...iconRest}>
          {icon}
        </span>
      ) : null}
      <div className={cx(bannerClasses.content, contentClassName)} {...contentRest}>
        <div className={cx(bannerClasses.title, titleClassName)} {...titleRest}>
          {title}
        </div>
        {children ? (
          <div className={cx(bannerClasses.description, descriptionClassName)} {...descriptionRest}>
            {children}
          </div>
        ) : null}
      </div>
      {actions ? (
        <div className={cx(bannerClasses.actions, actionsClassName)} {...actionsRest}>
          {actions}
        </div>
      ) : null}
      {onClose ? (
        <button
          type="button"
          aria-label={closeLabel}
          onClick={onClose}
          className={cx(bannerClasses.close, closeClassName)}
          {...closeRest}
        />
      ) : null}
    </div>
  );
});
