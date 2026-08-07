'use client';

import { useCallback, useId, useMemo, useRef, useState } from 'react';
import { cx } from '../../utils/cx';
import { ToastContext } from './ToastContext';
import { ToastItem } from './ToastItem';
import type { ToastOptions, ToastProviderProps, ToastRecord } from './Toast.types';
import './Toast.css';

/** Classes rendered by the toast system — the documented override surface. */
export const toastClasses = {
  region: 'ui-toast-region',
  list: 'ui-toast-region__list',
  root: 'ui-toast',
  info: 'ui-toast--info',
  success: 'ui-toast--success',
  warning: 'ui-toast--warning',
  danger: 'ui-toast--danger',
  content: 'ui-toast__content',
  title: 'ui-toast__title',
  description: 'ui-toast__description',
  action: 'ui-toast__action',
  close: 'ui-toast__close',
} as const;

const placementClass = {
  'top-start': 'ui-toast-region--top-start',
  'top-center': 'ui-toast-region--top-center',
  'top-end': 'ui-toast-region--top-end',
  'bottom-start': 'ui-toast-region--bottom-start',
  'bottom-center': 'ui-toast-region--bottom-center',
  'bottom-end': 'ui-toast-region--bottom-end',
} as const;

const DEFAULT_DURATION_MS = 5000;

/**
 * Hosts the toast queue and renders the stack. Mount it once, near the root
 * of the app, then call {@link useToast} anywhere beneath it.
 *
 * Accessibility: the stack lives in TWO live regions — a `role="status"`
 * (polite) one for info/success and a `role="alert"` (assertive) one for
 * warning/danger, matching Banner. A toast must be inside a live region
 * that already exists when it appears, so both regions are always rendered
 * and the toasts move into the right one. The regions are labelled
 * landmarks so they can be navigated to deliberately. Auto-dismiss timers
 * pause while the pointer is over a toast or focus is inside it — otherwise
 * a toast can vanish mid-read or while being operated. Anything requiring
 * action should pass `duration: null` and a close button.
 */
export function ToastProvider(props: ToastProviderProps) {
  const { children, placement = 'bottom-end', max = 5, regionProps } = props;

  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const idPrefix = useId();
  const counterRef = useRef(0);

  // Dismiss MARKS a toast closing so it can play its exit transition;
  // ToastItem calls `remove` once that finishes. Deleting it here directly
  // would make the exit state unreachable and toasts vanish instantly.
  const dismiss = useCallback((id: string) => {
    setToasts((current) =>
      current.map((toast) => (toast.id === id ? { ...toast, closing: true } : toast)),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const dismissAll = useCallback(
    () => setToasts((current) => current.map((toast) => ({ ...toast, closing: true }))),
    [],
  );

  const show = useCallback(
    (options: ToastOptions) => {
      counterRef.current += 1;
      const id = `${idPrefix}-toast-${counterRef.current}`;
      setToasts((current) => {
        const next = [...current, { ...options, id }];
        // Drop the oldest rather than let the stack grow past `max`.
        return next.length > max ? next.slice(next.length - max) : next;
      });
      return id;
    },
    [idPrefix, max],
  );

  const api = useMemo(() => ({ show, dismiss, dismissAll }), [show, dismiss, dismissAll]);

  const { className: regionClassName, ...regionRest } = regionProps ?? {};
  const polite = toasts.filter((t) => t.intent !== 'warning' && t.intent !== 'danger');
  const assertive = toasts.filter((t) => t.intent === 'warning' || t.intent === 'danger');

  // The two live regions are UNPOSITIONED children of one fixed container.
  // Positioning them both would pin two stacks to the same corner, drawn on
  // top of each other; in flow they simply stack.
  const region = (role: 'status' | 'alert', list: ToastRecord[]) => (
    <div
      // regionRest is spread FIRST so a consumer cannot override the
      // live-region contract below and silently break announcements.
      {...regionRest}
      role={role}
      aria-live={role === 'alert' ? 'assertive' : 'polite'}
      // Without this the region is atomic, so adding one toast re-announces
      // every toast already in it ("Saved", "Saved Saved", …).
      aria-atomic="false"
      className={toastClasses.list}
    >
      {list.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          defaultDuration={DEFAULT_DURATION_MS}
          onDismiss={dismiss}
          onRemove={remove}
        />
      ))}
    </div>
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className={cx(toastClasses.region, placementClass[placement], regionClassName)}>
        {region('status', polite)}
        {region('alert', assertive)}
      </div>
    </ToastContext.Provider>
  );
}
