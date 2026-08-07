'use client';

import { useState } from 'react';
import type { RefObject } from 'react';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

/**
 * The portal container for a floating surface: the nearest `[data-theme]`
 * wrapper above `anchorRef`, falling back to `document.body`.
 *
 * Portalling to `document.body` would escape a scoped ThemeProvider and
 * render a light popup inside a dark region — theme state lives only in
 * CSS/DOM, so there is no context value to re-apply (DECISIONS 2026-07-30).
 * `<html>`/`<body>` matches fall through to body, since those need no
 * re-parenting. Returns `null` while closed or before the anchor mounts, so
 * callers can skip rendering the portal entirely.
 */
export function useThemedPortal(
  open: boolean,
  anchorRef: RefObject<Element | null>,
): HTMLElement | null {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!open || typeof document === 'undefined') {
      setContainer(null);
      return;
    }
    const themed = anchorRef.current?.closest('[data-theme]');
    setContainer(
      themed && themed !== document.documentElement && themed !== document.body
        ? (themed as HTMLElement)
        : document.body,
    );
  }, [open, anchorRef]);

  return container;
}
