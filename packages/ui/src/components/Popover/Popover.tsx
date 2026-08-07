'use client';

import { cloneElement, useCallback, useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { useAnchoredPosition } from '../../hooks/useAnchoredPosition';
import { useControlled } from '../../hooks/useControlled';
import { useDismiss } from '../../hooks/useDismiss';
import { useThemedPortal } from '../../hooks/useThemedPortal';
import { useTransitionState } from '../../hooks/useTransitionState';
import { useTriggerRef } from '../../hooks/useTriggerRef';
import { cx } from '../../utils/cx';
import { getTabbables } from '../../utils/focusTrap';
import type { PopoverProps } from './Popover.types';
import './Popover.css';

/** Classes rendered by {@link Popover} — the documented override surface. */
export const popoverClasses = {
  root: 'ui-popover',
} as const;

const EXIT_MS = 150;
const OFFSET_PX = 8;
const VIEWPORT_PADDING_PX = 8;

/**
 * A non-modal anchored surface that may contain interactive content — the
 * click-opened sibling of Tooltip. Use Tooltip for a passive hint, Modal
 * when the rest of the page must be blocked, and Menu for a list of actions.
 *
 * Works controlled (`open` + `onOpenChange`) and uncontrolled
 * (`defaultOpen`). Dismisses on Escape and on an outside pointer press.
 *
 * Accessibility: `role="dialog"` named by `label`, with the trigger carrying
 * `aria-expanded` and `aria-haspopup="dialog"`. **Non-modal by design**:
 * focus is NOT trapped and the page is not inert, so Tab can leave the
 * surface — that is correct for this pattern (use Modal when it should not).
 * On open, focus moves to the first tabbable inside (or the surface itself,
 * which is `tabIndex={-1}`) unless `initialFocus` is off; on close it
 * returns to the trigger, so keyboard users are never dropped at the top of
 * the document.
 */
export function Popover(props: PopoverProps) {
  const {
    children,
    content,
    label,
    side = 'bottom',
    align = 'center',
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    initialFocus = true,
    slotProps,
  } = props;

  const id = useId();
  const anchorRef = useRef<HTMLElement | null>(null);
  // Tracked as STATE, not a ref: the surface mounts a commit later (its
  // portal container is resolved by an effect), and positioning must re-run
  // when it appears.
  const [floating, setFloating] = useState<HTMLDivElement | null>(null);

  const [open, setUncontrolled, isControlled] = useControlled(openProp, defaultOpen);
  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [isControlled, setUncontrolled, onOpenChange],
  );

  const { mounted, state } = useTransitionState(open, EXIT_MS);
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

  // Escape + outside pointer. The trigger counts as "inside" so its own
  // click toggles rather than dismiss-then-reopen.
  useDismiss({
    active: open,
    inside: [anchorRef, { current: floating }],
    onDismiss: () => setOpen(false),
  });

  // Focus in on open, back to the trigger on close.
  const wasOpenRef = useRef(false);
  // Tracks the surface that was open, so the close branch can ask whether
  // focus is still inside it — `floating` is already null by then.
  const lastSurfaceRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (open && floating && !wasOpenRef.current) {
      wasOpenRef.current = true;
      lastSurfaceRef.current = floating;
      if (initialFocus) (getTabbables(floating)[0] ?? floating).focus();
    } else if (!open && wasOpenRef.current) {
      wasOpenRef.current = false;
      const surface = lastSurfaceRef.current;
      lastSurfaceRef.current = null;
      // Only pull focus back if it is still inside the closing surface (or
      // nowhere). Restoring unconditionally would yank focus away from
      // whatever the user just moved to — Tab-out, or a click elsewhere.
      const active = document.activeElement;
      const focusEscaped = active && active !== document.body && !surface?.contains(active);
      if (!focusEscaped) anchorRef.current?.focus?.();
    }
  }, [open, initialFocus, floating]);

  const childProps = children.props as Record<string, unknown>;
  const triggerRef = useTriggerRef(anchorRef, (children as unknown as { ref?: unknown }).ref);

  const trigger = cloneElement(children, {
    ref: triggerRef,
    'aria-expanded': open,
    'aria-haspopup': 'dialog',
    'aria-controls': open ? id : undefined,
    onClick: (event: ReactMouseEvent) => {
      const handler = childProps.onClick;
      if (typeof handler === 'function') (handler as (e: unknown) => void)(event);
      if (!event.defaultPrevented) setOpen(!open);
    },
  } as Record<string, unknown>);

  const {
    className: contentClassName,
    style: contentStyle,
    ...contentRest
  } = slotProps?.content ?? {};

  // `opacity`, NOT `visibility: hidden`: the latter makes `focus()` a silent
  // no-op, so initial focus would land nowhere on the commit where the
  // surface first mounts (before measurement).
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
              role="dialog"
              aria-label={label}
              tabIndex={-1}
              data-state={state}
              data-side={placement?.side ?? side}
              className={cx(popoverClasses.root, contentClassName)}
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
