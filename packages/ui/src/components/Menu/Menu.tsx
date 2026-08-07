'use client';

import { cloneElement, useCallback, useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { useAnchoredPosition } from '../../hooks/useAnchoredPosition';
import { useControlled } from '../../hooks/useControlled';
import { useDismiss } from '../../hooks/useDismiss';
import { useRovingFocus } from '../../hooks/useRovingFocus';
import { useThemedPortal } from '../../hooks/useThemedPortal';
import { useTransitionState } from '../../hooks/useTransitionState';
import { useTriggerRef } from '../../hooks/useTriggerRef';
import { cx } from '../../utils/cx';
import { firstEnabledIndex, lastEnabledIndex, typeAheadIndex } from '../../utils/listNavigation';
import type { MenuItemDomProps, MenuProps } from './Menu.types';
import './Menu.css';

/** Classes rendered by {@link Menu} — the documented override surface. */
export const menuClasses = {
  root: 'ui-menu',
  item: 'ui-menu__item',
  itemActive: 'ui-menu__item--active',
  itemDisabled: 'ui-menu__item--disabled',
} as const;

const EXIT_MS = 150;
const OFFSET_PX = 4;
const VIEWPORT_PADDING_PX = 8;
const TYPE_AHEAD_RESET_MS = 500;

/**
 * A menu button: a trigger that opens a list of actions (the WAI-ARIA APG
 * menu-button pattern). Items are data; `slots.item` is the escape hatch for
 * router links or richer content. Use Select to pick a VALUE from options,
 * and Popover for arbitrary content.
 *
 * Accessibility: the trigger carries `aria-haspopup="menu"` and
 * `aria-expanded`; the surface is `role="menu"` named by `label`, and items
 * are `role="menuitem"`. **Focus MOVES into the menu** (roving tabindex —
 * the APG default here, unlike Select's activedescendant model, §8.4): the
 * active item is the only one with `tabIndex=0`. Opening with ArrowDown
 * focuses the first item, ArrowUp the last, and a pointer click focuses
 * none. Arrows move, Home/End jump, printable characters type-ahead by
 * label, Enter/Space select, and Escape or Tab closes — Escape returning
 * focus to the trigger, which is what keeps keyboard users oriented.
 * Disabled items are skipped by arrows and type-ahead.
 */
export function Menu(props: MenuProps) {
  const {
    children,
    items,
    onSelect,
    label,
    side = 'bottom',
    align = 'start',
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    slots,
    slotProps,
  } = props;

  const id = useId();
  const anchorRef = useRef<HTMLElement | null>(null);
  // Tracked as STATE, not a ref: the surface mounts a commit later (its
  // portal container is resolved by an effect), and both positioning and
  // roving focus must re-run when it appears.
  const [floating, setFloating] = useState<HTMLDivElement | null>(null);
  const typeAheadRef = useRef<{ buffer: string; timeout: ReturnType<typeof setTimeout> | null }>({
    buffer: '',
    timeout: null,
  });

  const [open, setUncontrolled, isControlled] = useControlled(openProp, defaultOpen);
  // Roving tabindex, shared with Tabs. `focusContainerWhenInactive` is what
  // keeps a pointer-opened menu operable: with no active item, focus must
  // still enter the surface or its key handler never runs.
  const { activeIndex, setActiveIndex, handleNavigationKey } = useRovingFocus({
    items,
    active: open,
    container: floating,
    itemSelector: '[role="menuitem"]',
    orientation: 'vertical',
    focusContainerWhenInactive: true,
  });

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

  useDismiss({
    active: open,
    inside: [anchorRef, { current: floating }],
    // Escape is handled on the surface so focus can return to the trigger.
    escape: false,
    onDismiss: () => setOpen(false),
  });

  useEffect(() => {
    const state = typeAheadRef.current;
    return () => {
      if (state.timeout) clearTimeout(state.timeout);
    };
  }, []);

  const openWith = (index: number) => {
    setActiveIndex(index);
    setOpen(true);
  };

  const close = (returnFocus: boolean) => {
    setOpen(false);
    setActiveIndex(-1);
    // Drop any partial type-ahead query: without this, keystrokes from the
    // previous session concatenate onto the next one whenever close/reopen/
    // retype happens inside the 500ms reset window.
    const typeAhead = typeAheadRef.current;
    if (typeAhead.timeout) clearTimeout(typeAhead.timeout);
    typeAhead.buffer = '';
    typeAhead.timeout = null;
    if (returnFocus) anchorRef.current?.focus?.();
  };

  const select = (index: number) => {
    const item = items[index];
    if (!item || item.disabled) return;
    onSelect?.(item.value);
    close(true);
  };

  const typeAhead = (character: string) => {
    const state = typeAheadRef.current;
    state.buffer += character.toLowerCase();
    if (state.timeout) clearTimeout(state.timeout);
    state.timeout = setTimeout(() => {
      state.buffer = '';
    }, TYPE_AHEAD_RESET_MS);
    const match = typeAheadIndex(items, state.buffer, activeIndex);
    if (match >= 0) setActiveIndex(match);
  };

  const onMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    // Arrows and Home/End belong to the shared roving-focus contract.
    if (handleNavigationKey(event)) return;
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        select(activeIndex);
        return;
      case 'Escape':
        event.preventDefault();
        close(true);
        return;
      case 'Tab':
        // Tab leaves the menu entirely; do not fight the browser's focus move.
        close(false);
        return;
      default:
        break;
    }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && event.key !== ' ') {
      event.preventDefault();
      typeAhead(event.key);
    }
  };

  const childProps = children.props as Record<string, unknown>;
  const triggerRef = useTriggerRef(anchorRef, (children as unknown as { ref?: unknown }).ref);

  const trigger = cloneElement(children, {
    ref: triggerRef,
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    'aria-controls': open ? id : undefined,
    onClick: (event: MouseEvent) => {
      const handler = childProps.onClick;
      if (typeof handler === 'function') (handler as (e: unknown) => void)(event);
      if (event.defaultPrevented) return;
      // Pointer opening focuses no item — the APG's pointer path.
      if (open) close(false);
      else openWith(-1);
    },
    onKeyDown: (event: ReactKeyboardEvent) => {
      const handler = childProps.onKeyDown;
      if (typeof handler === 'function') (handler as (e: unknown) => void)(event);
      if (event.defaultPrevented || open) return;
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        openWith(firstEnabledIndex(items));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        openWith(lastEnabledIndex(items));
      }
    },
  } as Record<string, unknown>);

  const { className: menuClassName, style: menuStyle, ...menuRest } = slotProps?.menu ?? {};
  const { className: itemClassName, ...itemRest } = slotProps?.item ?? {};
  const ItemSlot = slots?.item;

  // `opacity`, NOT `visibility: hidden`: the latter makes `focus()` a silent
  // no-op, which would break roving focus on the commit where the surface
  // first mounts (before measurement lands).
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
              role="menu"
              aria-label={label}
              // Programmatically focusable, never tabbable: the keyboard
              // contract lives on the items (roving tabindex), but the menu
              // must be able to hold focus if it ever has no enabled item.
              tabIndex={-1}
              data-state={state}
              data-side={placement?.side ?? side}
              onKeyDown={onMenuKeyDown}
              className={cx(menuClasses.root, menuClassName)}
              style={{ ...positionStyle, ...menuStyle }}
              {...menuRest}
            >
              {items.map((item, index) => {
                const active = index === activeIndex;
                const className = cx(
                  menuClasses.item,
                  active && menuClasses.itemActive,
                  item.disabled && menuClasses.itemDisabled,
                  itemClassName,
                );
                const itemProps: MenuItemDomProps = {
                  role: 'menuitem',
                  tabIndex: active ? 0 : -1,
                  ...(item.disabled ? { 'aria-disabled': true as const } : {}),
                  onClick: () => select(index),
                  onMouseEnter: () => {
                    if (!item.disabled) setActiveIndex(index);
                  },
                };
                if (ItemSlot) {
                  return (
                    <ItemSlot
                      key={item.value}
                      item={item}
                      active={active}
                      className={className}
                      itemProps={itemProps}
                    >
                      {item.label}
                    </ItemSlot>
                  );
                }
                return (
                  <div key={item.value} className={className} {...itemProps} {...itemRest}>
                    {item.label}
                  </div>
                );
              })}
            </div>,
            container,
          )
        : null}
    </>
  );
}
