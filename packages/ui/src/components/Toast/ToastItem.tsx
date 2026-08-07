'use client';

import { useEffect, useRef, useState } from 'react';
import { cx } from '../../utils/cx';
import { useTransitionState } from '../../hooks/useTransitionState';
import type { ToastRecord } from './Toast.types';

const ENTER_EXIT_MS = 200;

const intentClass = {
  info: 'ui-toast--info',
  success: 'ui-toast--success',
  warning: 'ui-toast--warning',
  danger: 'ui-toast--danger',
} as const;

export interface ToastItemProps {
  toast: ToastRecord;
  defaultDuration: number;
  /** Start the exit — marks the toast closing in the provider's queue. */
  onDismiss: (id: string) => void;
  /** Drop it from the queue once the exit transition has finished. */
  onRemove: (id: string) => void;
}

/**
 * One toast in the stack. Internal — consumers never render this directly;
 * they call `useToast().show()`.
 *
 * The auto-dismiss timer pauses on hover and on focus-within, so a toast
 * cannot disappear while it is being read or its action is being used, and
 * the REMAINING time is preserved across pause/resume rather than restarted.
 */
export function ToastItem(props: ToastItemProps) {
  const { toast, defaultDuration, onDismiss, onRemove } = props;
  const { id, title, description, intent = 'info', action, closeLabel, closing } = toast;
  const duration = toast.duration === undefined ? defaultDuration : toast.duration;

  const [paused, setPaused] = useState(false);
  // Enter on mount; `closing` (set by the provider) drives the exit.
  const [entered, setEntered] = useState(false);
  useEffect(() => setEntered(true), []);
  const { mounted, state } = useTransitionState(entered && !closing, ENTER_EXIT_MS);

  // Once the exit transition has played out, drop it from the queue.
  useEffect(() => {
    if (closing && !mounted) onRemove(id);
  }, [closing, mounted, onRemove, id]);

  // Remaining time survives pause/resume cycles, so hovering does not reset
  // a toast that was almost gone.
  const remainingRef = useRef(duration);
  const startedAtRef = useRef(0);

  useEffect(() => {
    if (duration === null || paused || closing) return undefined;
    startedAtRef.current = performance.now();
    const timer = setTimeout(() => onDismiss(id), remainingRef.current ?? duration);
    return () => {
      clearTimeout(timer);
      const elapsed = performance.now() - startedAtRef.current;
      remainingRef.current = Math.max(0, (remainingRef.current ?? duration) - elapsed);
    };
  }, [duration, paused, closing, id, onDismiss]);

  return (
    <div
      data-state={state}
      className={cx('ui-toast', intentClass[intent])}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="ui-toast__content">
        <div className="ui-toast__title">{title}</div>
        {description ? <div className="ui-toast__description">{description}</div> : null}
        {action ? <div className="ui-toast__action">{action}</div> : null}
      </div>
      {closeLabel ? (
        <button
          type="button"
          aria-label={closeLabel}
          className="ui-toast__close"
          onClick={() => onDismiss(id)}
        />
      ) : null}
    </div>
  );
}
