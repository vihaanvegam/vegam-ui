'use client';

import { useCallback, useRef } from 'react';
import type { MutableRefObject } from 'react';

/**
 * A STABLE callback ref for a cloned trigger element, merging the library's
 * own anchor ref with whatever ref the consumer already put on the child.
 *
 * Stability is the point. An inline arrow recreated each render makes React
 * detach (call with `null`) and re-attach the consumer's ref on EVERY render
 * of the overlay — dozens of times during a hover or a scroll-driven
 * reposition. It also has to forward the child ref's return value: React 19
 * treats a returned function as the ref's cleanup, and swallowing it means
 * the consumer's cleanup never runs.
 */
export function useTriggerRef(
  anchorRef: MutableRefObject<HTMLElement | null>,
  childRef: unknown,
): (node: HTMLElement | null) => void | (() => void) {
  // Latest-value ref so a changing child ref never changes this callback.
  const childRefRef = useRef(childRef);
  childRefRef.current = childRef;

  return useCallback(
    (node: HTMLElement | null) => {
      anchorRef.current = node;
      const current = childRefRef.current;
      if (typeof current === 'function') {
        // Forward the cleanup React 19 may expect back.
        return (current as (n: HTMLElement | null) => void | (() => void))(node);
      }
      if (current && typeof current === 'object') {
        (current as { current: HTMLElement | null }).current = node;
      }
      return undefined;
    },
    [anchorRef],
  );
}
