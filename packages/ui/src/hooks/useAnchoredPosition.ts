'use client';

import { useCallback, useState } from 'react';
import type { RefObject } from 'react';
import { computeAnchoredPlacement } from '../utils/positioning';
import type { Align, AnchoredPlacement, Side } from '../utils/positioning';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

export interface UseAnchoredPositionOptions {
  /** Track only while true. */
  open: boolean;
  /** The element the surface is positioned against. */
  anchorRef: RefObject<Element | null>;
  /**
   * The floating surface itself. Pass the ELEMENT (from a callback ref kept
   * in state), not a ref object: the surface mounts a commit later than this
   * hook first runs — it lives in a portal whose container is resolved by an
   * effect — and a ref would give this hook no way to notice it appearing,
   * leaving the surface unmeasured and hidden forever.
   */
  floating: HTMLElement | null;
  side?: Side;
  align?: Align;
  offset?: number;
  padding?: number;
}

/**
 * Positions a floating surface against an anchor and keeps it there while
 * open, re-measuring on resize and on scroll (captured, so scrolling ANY
 * ancestor is caught, not just the window).
 *
 * Returns `null` until the first measurement lands. Coordinates are viewport
 * relative: apply them with `position: fixed`, which also keeps the surface
 * correct regardless of which themed wrapper it portalled into.
 */
export function useAnchoredPosition(options: UseAnchoredPositionOptions): AnchoredPlacement | null {
  const { open, anchorRef, floating, side, align, offset, padding } = options;
  const [placement, setPlacement] = useState<AnchoredPlacement | null>(null);

  const update = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor || !floating) return;
    const rect = anchor.getBoundingClientRect();
    setPlacement(
      computeAnchoredPlacement({
        anchor: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
        floating: { width: floating.offsetWidth, height: floating.offsetHeight },
        viewport: { width: window.innerWidth, height: window.innerHeight },
        side,
        align,
        offset,
        padding,
      }),
    );
  }, [anchorRef, floating, side, align, offset, padding]);

  useIsomorphicLayoutEffect(() => {
    if (!open || !floating) {
      setPlacement(null);
      return undefined;
    }
    update();
    window.addEventListener('resize', update);
    // Capture phase: a scroll inside any scrollable ancestor moves the
    // anchor, and those events do not bubble to window.
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, floating, update]);

  return placement;
}
