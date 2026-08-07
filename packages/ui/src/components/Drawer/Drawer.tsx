'use client';

import { forwardRef, useEffect, useId, useImperativeHandle, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useComponentDefaults } from '../../theme/defaultProps';
import { useThemedPortal } from '../../hooks/useThemedPortal';
import { useTransitionState } from '../../hooks/useTransitionState';
import { cx } from '../../utils/cx';
import { getTabbables, nextTrapTarget } from '../../utils/focusTrap';
import { lockScroll } from '../../utils/scrollLock';
import { Blanket } from '../Blanket/Blanket';
import type { DrawerProps } from './Drawer.types';
import './Drawer.css';

/** Classes rendered by {@link Drawer} — the documented override surface. */
export const drawerClasses = {
  root: 'ui-drawer',
  panel: 'ui-drawer__panel',
  left: 'ui-drawer__panel--left',
  right: 'ui-drawer__panel--right',
  top: 'ui-drawer__panel--top',
  bottom: 'ui-drawer__panel--bottom',
  sm: 'ui-drawer__panel--sm',
  md: 'ui-drawer__panel--md',
  lg: 'ui-drawer__panel--lg',
  full: 'ui-drawer__panel--full',
  header: 'ui-drawer__header',
  headings: 'ui-drawer__headings',
  title: 'ui-drawer__title',
  description: 'ui-drawer__description',
  body: 'ui-drawer__body',
  footer: 'ui-drawer__footer',
  close: 'ui-drawer__close',
} as const;

/** Matches the slow duration the panel transitions on. */
const EXIT_MS = 300;

/**
 * An edge-anchored modal panel — Modal's machinery (scrim, focus trap,
 * scroll lock, controlled-only API, portal into the nearest `[data-theme]`)
 * with a placement axis and a slide transition. Use Modal for a centered
 * dialog, Popover for a non-modal anchored surface.
 *
 * Accessibility: `role="dialog"` + `aria-modal="true"`, named by `title` via
 * `aria-labelledby` and described by `description`. Focus moves to the first
 * tabbable inside on open (the panel itself as fallback — it carries
 * `tabIndex={-1}`) and returns to the previously focused element on close.
 * Tab/Shift+Tab are trapped inside the panel and Escape closes, both handled
 * at the document so focus that escapes is recaptured. The scrim is
 * pointer-only and `aria-hidden`; Escape is the keyboard path. Under
 * `prefers-reduced-motion` the panel appears without sliding.
 */
export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(function Drawer(props, ref) {
  const defaults = useComponentDefaults('Drawer');
  const {
    open,
    onClose,
    title,
    description,
    footer,
    placement = defaults.placement ?? 'right',
    size = defaults.size ?? 'md',
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

  // Stay mounted through the exit slide, then unmount.
  const { mounted, state } = useTransitionState(open, EXIT_MS);
  const container = useThemedPortal(mounted, anchorRef);

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

  // Scroll lock while open (not while merely mounted for the exit slide).
  useEffect(() => {
    if (!open) return;
    return lockScroll(document);
  }, [open]);

  // Escape + Tab trap on the document, so focus that escaped is recaptured.
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
  const { className: titleClassName, ...titleRest } = slotProps?.title ?? {};
  const { className: descriptionClassName, ...descriptionRest } = slotProps?.description ?? {};
  const { className: bodyClassName, ...bodyRest } = slotProps?.body ?? {};
  const { className: footerClassName, ...footerRest } = slotProps?.footer ?? {};
  const { className: closeClassName, ...closeRest } = slotProps?.close ?? {};

  return (
    <>
      <span hidden ref={anchorRef} />
      {mounted && container && typeof document !== 'undefined'
        ? createPortal(
            <div className={cx(drawerClasses.root, rootClassName)} {...rootRest}>
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
                data-state={state}
                className={cx(
                  drawerClasses.panel,
                  drawerClasses[placement],
                  drawerClasses[size],
                  className,
                )}
                {...rest}
              >
                <div className={cx(drawerClasses.header, headerClassName)} {...headerRest}>
                  <div className={drawerClasses.headings}>
                    <div
                      id={titleId}
                      className={cx(drawerClasses.title, titleClassName)}
                      {...titleRest}
                    >
                      {title}
                    </div>
                    {description ? (
                      <div
                        id={descriptionId}
                        className={cx(drawerClasses.description, descriptionClassName)}
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
                      className={cx(drawerClasses.close, closeClassName)}
                      {...closeRest}
                    />
                  ) : null}
                </div>
                {children ? (
                  <div className={cx(drawerClasses.body, bodyClassName)} {...bodyRest}>
                    {children}
                  </div>
                ) : null}
                {footer ? (
                  <div className={cx(drawerClasses.footer, footerClassName)} {...footerRest}>
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
