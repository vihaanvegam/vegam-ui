'use client';

import { useCallback, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { firstEnabledIndex, lastEnabledIndex, nextEnabledIndex } from '../utils/listNavigation';
import type { NavigableItem } from '../utils/listNavigation';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

/** Which arrow keys navigate the collection. */
export type RovingOrientation = 'vertical' | 'horizontal';

export interface UseRovingFocusOptions {
  /** The collection, in DOM order. Only `disabled` is read. */
  items: readonly NavigableItem[];
  /** Manage focus only while true (an open menu, a mounted tablist). */
  active: boolean;
  /** Element containing the items. */
  container: HTMLElement | null;
  /** Selector matching the focusable items inside `container`, in DOM order. */
  itemSelector: string;
  /** Arrows that navigate. @default 'vertical' */
  orientation?: RovingOrientation;
  /** Wrap around the ends (the APG tabs behaviour). @default false */
  loop?: boolean;
  /**
   * Focus the CONTAINER when there is no active item. Menus need this — a
   * pointer-opened menu has no active item, and without focus inside the
   * surface its key handler never runs. @default false
   */
  focusContainerWhenInactive?: boolean;
}

export interface UseRovingFocusResult {
  activeIndex: number;
  setActiveIndex: Dispatch<SetStateAction<number>>;
  /**
   * Handles the orientation's arrows plus Home/End, moving the active index.
   * Returns true when it consumed the event, so callers can fall through to
   * their own keys (Enter, Escape, type-ahead) when it did not.
   */
  handleNavigationKey: (event: { key: string; preventDefault: () => void }) => boolean;
}

/**
 * Roving tabindex over a collection: exactly one item is in the tab order at
 * a time and arrow keys move REAL DOM focus between them (the WAI-ARIA APG
 * model used by Menu and Tabs — Select deliberately keeps
 * `aria-activedescendant` instead, §8.4).
 *
 * Items are located by selector rather than per-item refs, so replaceable
 * slot content participates without having to forward a ref. The caller owns
 * `tabIndex` (`index === activeIndex ? 0 : -1`) and disabled semantics; this
 * hook owns which index is active and putting focus on it.
 */
export function useRovingFocus(options: UseRovingFocusOptions): UseRovingFocusResult {
  const {
    items,
    active,
    container,
    itemSelector,
    orientation = 'vertical',
    loop = false,
    focusContainerWhenInactive = false,
  } = options;

  const [activeIndex, setActiveIndex] = useState(-1);

  // Reconcile a stale index when the collection shrinks. Without this, an
  // index past the end leaves the collection with nothing focused AND
  // nothing tabbable — the caller derives `tabIndex` from this value, so
  // every item would render -1 and the widget would drop out of the tab
  // order entirely.
  useIsomorphicLayoutEffect(() => {
    if (activeIndex >= items.length) {
      setActiveIndex(items.length > 0 ? lastEnabledIndex(items) : -1);
    }
  }, [items, activeIndex]);

  useIsomorphicLayoutEffect(() => {
    if (!active || !container) return;
    if (activeIndex < 0) {
      if (focusContainerWhenInactive) container.focus();
      return;
    }
    const nodes = container.querySelectorAll<HTMLElement>(itemSelector);
    nodes[activeIndex]?.focus();
  }, [active, container, activeIndex, itemSelector, focusContainerWhenInactive]);

  const handleNavigationKey = useCallback(
    (event: { key: string; preventDefault: () => void }) => {
      const forward = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
      const backward = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';

      switch (event.key) {
        case forward:
          event.preventDefault();
          setActiveIndex((index) =>
            index < 0 ? firstEnabledIndex(items) : nextEnabledIndex(items, index, 1, loop),
          );
          return true;
        case backward:
          event.preventDefault();
          setActiveIndex((index) =>
            index < 0 ? lastEnabledIndex(items) : nextEnabledIndex(items, index, -1, loop),
          );
          return true;
        case 'Home':
          event.preventDefault();
          setActiveIndex(firstEnabledIndex(items));
          return true;
        case 'End':
          event.preventDefault();
          setActiveIndex(lastEnabledIndex(items));
          return true;
        default:
          return false;
      }
    },
    [items, orientation, loop],
  );

  return { activeIndex, setActiveIndex, handleNavigationKey };
}
