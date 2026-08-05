'use client';

import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useComponentDefaults } from '../../theme/defaultProps';
import { cx } from '../../utils/cx';
import { getTabbables, nextTrapTarget } from '../../utils/focusTrap';
import { lockScroll } from '../../utils/scrollLock';
import { useIsomorphicLayoutEffect } from '../../utils/useIsomorphicLayoutEffect';
import { Blanket } from '../Blanket/Blanket';
import type { ModalProps } from './Modal.types';
import './Modal.css';

/** Classes rendered by {@link Modal} — the documented override surface. */
export const modalClasses = {
  root: 'ui-modal',
  panel: 'ui-modal__panel',
  sm: 'ui-modal__panel--sm',
  md: 'ui-modal__panel--md',
  lg: 'ui-modal__panel--lg',
  xl: 'ui-modal__panel--xl',
  fullscreen: 'ui-modal__panel--fullscreen',
  warning: 'ui-modal__panel--warning',
  danger: 'ui-modal__panel--danger',
  header: 'ui-modal__header',
  icon: 'ui-modal__icon',
  headings: 'ui-modal__headings',
  title: 'ui-modal__title',
  description: 'ui-modal__description',
  body: 'ui-modal__body',
  footer: 'ui-modal__footer',
  close: 'ui-modal__close',
} as const;

/**
 * A modal dialog: blanket scrim behind a centered panel with header
 * (icon · title/description · close), scrollable body, and footer actions.
 *
 * Works controlled only: `open` shows it, and every dismissal affordance
 * (Escape, blanket click, close button) reports through `onClose` — the
 * consumer flips `open`. The panel renders in a portal into the nearest
 * `[data-theme]` wrapper so scoped themes apply, falling back to
 * `document.body`. While open, body scroll is locked (scrollbar width
 * compensated) and Tab/Shift+Tab are trapped inside the panel.
 *
 * Accessibility: `role="dialog"` + `aria-modal="true"`, named by the title
 * via `aria-labelledby` and described by `description` via
 * `aria-describedby`. On open, focus moves to the first tabbable inside the
 * panel (the panel itself as fallback — it carries `tabIndex={-1}`); on
 * close, focus returns to the element focused before opening. Escape closes
 * (WAI-ARIA APG dialog pattern). The blanket is pointer-only and
 * `aria-hidden`; Escape is the keyboard path. The close button is a native
 * `<button>` named by `closeLabel`, with the `:focus-visible` ring from the
 * focus tokens and a 44px target on coarse pointers.
 */
export const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal(props, ref) {
  const defaults = useComponentDefaults('Modal');
  const {
    open,
    onClose,
    title,
    description,
    icon,
    footer,
    size = defaults.size ?? 'sm',
    appearance = defaults.appearance ?? 'default',
    closeLabel,
    slotProps,
    role,
    className,
    children,
    ...rest
  } = props;

  const titleId = useId();
  const descriptionId = useId();

  const anchorRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);
  useImperativeHandle(ref, () => panelRef.current as HTMLDivElement);

  const [container, setContainer] = useState<HTMLElement | null>(null);

  // Portal into the nearest themed wrapper so a scoped [data-theme] applies
  // to the dialog; <html>-level theming falls through to body correctly.
  useIsomorphicLayoutEffect(() => {
    if (!open) {
      setContainer(null);
      return;
    }
    const themed = anchorRef.current?.closest('[data-theme]');
    setContainer(
      themed && themed !== document.documentElement && themed !== document.body
        ? (themed as HTMLElement)
        : document.body,
    );
  }, [open]);

  // Initial focus in, focus restore out.
  useEffect(() => {
    if (!open || !container) return;
    const panel = panelRef.current;
    if (!panel) return;
    prevFocusRef.current = document.activeElement as HTMLElement | null;
    (getTabbables(panel)[0] ?? panel).focus();
    return () => {
      prevFocusRef.current?.focus?.();
    };
  }, [open, container]);

  // Scroll lock while open.
  useEffect(() => {
    if (!open) return;
    return lockScroll(document);
  }, [open]);

  // Escape dismissal + Tab trap. Listening on the document (not the panel)
  // also recaptures focus that escaped to the browser chrome or body.
  useEffect(() => {
    if (!open || !container) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose?.();
        return;
      }
      if (event.key === 'Tab' && panelRef.current) {
        const target = nextTrapTarget(panelRef.current, document.activeElement, event.shiftKey);
        if (target) {
          event.preventDefault();
          target.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, container, onClose]);

  const { className: rootClassName, ...rootRest } = slotProps?.root ?? {};
  const {
    className: blanketClassName,
    onClick: blanketOnClick,
    ...blanketRest
  } = slotProps?.blanket ?? {};
  const { className: headerClassName, ...headerRest } = slotProps?.header ?? {};
  const { className: iconClassName, ...iconRest } = slotProps?.icon ?? {};
  const { className: titleClassName, ...titleRest } = slotProps?.title ?? {};
  const { className: descriptionClassName, ...descriptionRest } = slotProps?.description ?? {};
  const { className: bodyClassName, ...bodyRest } = slotProps?.body ?? {};
  const { className: footerClassName, ...footerRest } = slotProps?.footer ?? {};
  const { className: closeClassName, ...closeRest } = slotProps?.close ?? {};

  return (
    <>
      <span hidden ref={anchorRef} />
      {open && container && typeof document !== 'undefined'
        ? createPortal(
            <div className={cx(modalClasses.root, rootClassName)} {...rootRest}>
              <Blanket
                className={blanketClassName}
                onClick={(event) => {
                  blanketOnClick?.(event);
                  onClose?.();
                }}
                {...blanketRest}
              />
              <div
                ref={panelRef}
                role={role ?? 'dialog'}
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={description ? descriptionId : undefined}
                tabIndex={-1}
                className={cx(
                  modalClasses.panel,
                  modalClasses[size],
                  appearance !== 'default' && modalClasses[appearance],
                  className,
                )}
                {...rest}
              >
                <div className={cx(modalClasses.header, headerClassName)} {...headerRest}>
                  {icon ? (
                    <span
                      aria-hidden="true"
                      className={cx(modalClasses.icon, iconClassName)}
                      {...iconRest}
                    >
                      {icon}
                    </span>
                  ) : null}
                  <div className={modalClasses.headings}>
                    <div
                      id={titleId}
                      className={cx(modalClasses.title, titleClassName)}
                      {...titleRest}
                    >
                      {title}
                    </div>
                    {description ? (
                      <div
                        id={descriptionId}
                        className={cx(modalClasses.description, descriptionClassName)}
                        {...descriptionRest}
                      >
                        {description}
                      </div>
                    ) : null}
                  </div>
                  {onClose && closeLabel ? (
                    <button
                      type="button"
                      aria-label={closeLabel}
                      onClick={onClose}
                      className={cx(modalClasses.close, closeClassName)}
                      {...closeRest}
                    />
                  ) : null}
                </div>
                {children ? (
                  <div className={cx(modalClasses.body, bodyClassName)} {...bodyRest}>
                    {children}
                  </div>
                ) : null}
                {footer ? (
                  <div className={cx(modalClasses.footer, footerClassName)} {...footerRest}>
                    {footer}
                  </div>
                ) : null}
              </div>
            </div>,
            container,
          )
        : null}
    </>
  );
});
