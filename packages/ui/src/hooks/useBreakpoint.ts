'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { breakpointOrder, breakpointWidths } from '../utils/breakpoints';
import type { Breakpoint } from '../utils/breakpoints';

const bounds = breakpointOrder.filter((bp): bp is Exclude<Breakpoint, 'base'> => bp !== 'base');

const queryFor = (bp: Exclude<Breakpoint, 'base'>) => `(min-width: ${breakpointWidths[bp]})`;

const getSnapshot = (): Breakpoint => {
  let current: Breakpoint = 'base';
  for (const bp of bounds) {
    if (window.matchMedia(queryFor(bp)).matches) current = bp;
  }
  return current;
};

const getServerSnapshot = (): Breakpoint => 'base';

/**
 * The widest breakpoint whose lower bound currently matches; `'base'` below
 * tablet. Bounds come from `breakpointWidths` — the single JS home of the
 * breakpoint values (§8.1), drift-tested against the token export.
 *
 * SSR-safe: the server snapshot is `'base'` (mobile-first), and the real
 * breakpoint applies immediately after hydration with no markup mismatch.
 * Prefer CSS media queries for purely visual changes; use this hook when
 * behaviour must branch (e.g. swapping a Drawer for a Popover).
 */
export function useBreakpoint(): Breakpoint {
  const subscribe = useCallback((onStoreChange: () => void) => {
    const lists = bounds.map((bp) => window.matchMedia(queryFor(bp)));
    for (const list of lists) list.addEventListener('change', onStoreChange);
    return () => {
      for (const list of lists) list.removeEventListener('change', onStoreChange);
    };
  }, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
