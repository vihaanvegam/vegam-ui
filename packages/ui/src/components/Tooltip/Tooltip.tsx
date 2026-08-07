'use client';

import { cloneElement, useCallback, useEffect, useId, useRef, useState } from 'react';

import type { CSSProperties, FocusEvent, PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { useControlled } from '../../hooks/useControlled';
import { useAnchoredPosition } from '../../hooks/useAnchoredPosition';
import { useThemedPortal } from '../../hooks/useThemedPortal';
import { useTransitionState } from '../../hooks/useTransitionState';
import { useTriggerRef } from '../../hooks/useTriggerRef';
import { cx } from '../../utils/cx';
import type { TooltipProps } from './Tooltip.types';
import './Tooltip.css';

/** Classes rendered by {@link Tooltip} — the documented override surface. */
export const tooltipClasses = {
  root: 'ui-tooltip',
} as const;

/** Matches the `motion.duration.tooltip-delay` token (300ms). */
const DEFAULT_DELAY_MS = 300;
/** Matches the fast duration the CSS transitions on. */
const EXIT_MS = 150;
const OFFSET_PX = 8;
const VIEWPORT_PADDING_PX = 8;

/**
 * A short text hint attached to a focusable trigger.
 *
 * Opens on hover after `delay` and on focus immediately; closes on pointer
 * leave, blur, and Escape. **Never put interactive content in a tooltip** —
 * it is `pointer-events: none` and unreachable by keyboard; use Popover for
 * anything clickable.
 *
 * Accessibility: the bubble is `role="tooltip"` and the trigger points at it
 * via `aria-describedby`, so screen readers read the hint as a description
 * of the control rather than as separate content. The trigger keeps its own
 * accessible name — a tooltip DESCRIBES, it does not name. Escape dismisses
 * while the trigger keeps focus (WAI-ARIA APG). **Tooltips are unreliable on
 * touch**, where there is no hover: never put information here that a user
 * cannot get another way.
 */
export function Tooltip(props: TooltipProps) {
  const {
    children,
    content,
    side = 'top',
    align = 'center',
    delay = DEFAULT_DELAY_MS,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    disabled = false,
    slotProps,
  } = props;

  const id = useId();
  const anchorRef = useRef<HTMLElement | null>(null);
  // The surface is tracked as STATE, not a ref: it mounts a commit after
  // this component first renders (its portal container is resolved by an
  // effect), and positioning must re-run when it appears.
  const [floating, setFloating] = useState<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [open, setUncontrolled, isControlled] = useControlled(openProp, defaultOpen);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [isControlled, setUncontrolled, onOpenChange],
  );

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };
  // Any pending open timer must die with the component, or it fires into an
  // unmounted tree.
  useEffect(() => clearTimer, []);

  const effectiveOpen = open && !disabled;
  const { mounted, state } = useTransitionState(effectiveOpen, EXIT_MS);
  const container = useThemedPortal(mounted, anchorRef);
  const placement = useAnchoredPosition({
    open: mounted,
    anchorRef,
    floating,
    side,
    align,
    offset: OFFSET_PX,
    padding: VIEWPORT_PADDING_PX,
  });

  // Escape closes while focus stays on the trigger (APG).
  useEffect(() => {
    if (!effectiveOpen || typeof document === 'undefined') return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        clearTimer();
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [effectiveOpen, setOpen]);

  const openAfterDelay = () => {
    clearTimer();
    if (delay <= 0) {
      setOpen(true);
      return;
    }
    timerRef.current = setTimeout(() => setOpen(true), delay);
  };

  const closeNow = () => {
    clearTimer();
    setOpen(false);
  };

  const childProps = children.props as Record<string, unknown>;
  const triggerRef = useTriggerRef(anchorRef, (children as unknown as { ref?: unknown }).ref);
  const call = (name: string, event: unknown) => {
    const handler = childProps[name];
    if (typeof handler === 'function') (handler as (e: unknown) => void)(event);
  };

  const trigger = cloneElement(children, {
    ref: triggerRef,
    // Describes, never names: the trigger keeps its own accessible name.
    'aria-describedby': effectiveOpen
      ? [childProps['aria-describedby'], id].filter(Boolean).join(' ')
      : childProps['aria-describedby'],
    onPointerEnter: (event: ReactPointerEvent) => {
      call('onPointerEnter', event);
      if (!disabled) openAfterDelay();
    },
    onPointerLeave: (event: ReactPointerEvent) => {
      call('onPointerLeave', event);
      closeNow();
    },
    onFocus: (event: FocusEvent) => {
      call('onFocus', event);
      // No delay for keyboard users — the hint should be there on arrival.
      if (!disabled) {
        clearTimer();
        setOpen(true);
      }
    },
    onBlur: (event: FocusEvent) => {
      call('onBlur', event);
      closeNow();
    },
  } as Record<string, unknown>);

  const {
    className: contentClassName,
    style: contentStyle,
    ...contentRest
  } = slotProps?.content ?? {};

  // Hidden for the one frame before measurement lands. `opacity`, NOT
  // `visibility: hidden` — the latter removes the surface from the
  // accessibility tree AND makes `focus()` a silent no-op, which is exactly
  // how Popover's and Menu's focus management broke.
  const positionStyle: CSSProperties = placement
    ? { top: placement.top, left: placement.left }
    : { top: 0, left: 0, opacity: 0, pointerEvents: 'none' };

  return (
    <>
      {trigger}
      {mounted && container && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={setFloating}
              id={id}
              role="tooltip"
              data-state={state}
              data-side={placement?.side ?? side}
              className={cx(tooltipClasses.root, contentClassName)}
              style={{ ...positionStyle, ...contentStyle }}
              {...contentRest}
            >
              {content}
            </div>,
            container,
          )
        : null}
    </>
  );
}
