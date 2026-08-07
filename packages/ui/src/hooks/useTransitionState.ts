'use client';

import { useEffect, useState } from 'react';

/** Lifecycle of a transitioned surface, as driven by `useTransitionState`. */
export type TransitionState = 'exited' | 'entering' | 'entered' | 'exiting';

export interface UseTransitionStateResult {
  /** Keep the element rendered while true (open, or still animating out). */
  mounted: boolean;
  /** Render as `data-state` on the root and key CSS transitions off it. */
  state: TransitionState;
}

/**
 * Enter/exit mount states for CSS transitions — the BLUEPRINT Phase 0.3
 * overlay convention. Render the surface while `mounted`, put `state` on the
 * root as `data-state`, and let the stylesheet transition between
 * `[data-state='entering'|'entered'|'exiting']`.
 *
 * Opening mounts in `exited` for one frame (so the transition has a start
 * value), then moves through `entering` → `entered` after `durationMs`.
 * Closing runs `exiting` → `exited`, at which point `mounted` drops and the
 * element can unmount.
 *
 * `durationMs` must be the ms value of the same `--ui-motion-duration-*`
 * token the CSS uses — the hook cannot read the stylesheet. When
 * `(prefers-reduced-motion: reduce)` matches (or the duration is 0) states
 * jump straight to `entered`/`exited`, complementing the CSS
 * `transition: none` guard the recipe already requires.
 */
export function useTransitionState(open: boolean, durationMs: number): UseTransitionStateResult {
  const [state, setState] = useState<TransitionState>('exited');

  useEffect(() => {
    // Read per toggle rather than subscribing: flipping the OS setting
    // mid-session applies from the next open/close, which is plenty.
    const reduced =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const instant = reduced || durationMs <= 0;

    let frame = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (open) {
      if (instant) {
        setState('entered');
      } else {
        // One painted frame in the pre-enter state; re-runs (e.g. a duration
        // change while open) must not knock an entered surface back.
        setState((current) => (current === 'entered' ? current : 'exited'));
        frame = requestAnimationFrame(() => {
          setState((current) => (current === 'entered' ? current : 'entering'));
          timer = setTimeout(() => setState('entered'), durationMs);
        });
      }
    } else if (instant) {
      setState('exited');
    } else {
      setState((current) => (current === 'exited' ? current : 'exiting'));
      timer = setTimeout(() => setState('exited'), durationMs);
    }

    return () => {
      if (frame) cancelAnimationFrame(frame);
      if (timer) clearTimeout(timer);
    };
  }, [open, durationMs]);

  return { mounted: open || state !== 'exited', state };
}
