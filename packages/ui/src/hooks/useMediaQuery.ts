'use client';

import { useCallback, useSyncExternalStore } from 'react';

const getServerSnapshot = () => false;

/**
 * Reactive `window.matchMedia`, SSR-safe via `useSyncExternalStore`.
 *
 * The server snapshot is always `false`, so server HTML and the hydration
 * render agree (no mismatch); the real result applies immediately after
 * hydration. Treat `false` as "unknown yet" when a wrong first frame would
 * matter — prefer expressing purely visual differences in CSS media queries,
 * and reach for this hook when behaviour (not styling) must branch.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onStoreChange);
      return () => list.removeEventListener('change', onStoreChange);
    },
    [query],
  );
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
