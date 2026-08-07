'use client';

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { observeDismiss } from '../utils/dismiss';

export interface UseDismissOptions {
  /** Observe only while true — pass the surface's open state. */
  active: boolean;
  /** Called with the dismissing event (Escape keydown or outside pointerdown). */
  onDismiss: (event: KeyboardEvent | PointerEvent) => void;
  /** Refs whose elements count as inside; pointer events within them never dismiss. */
  inside: ReadonlyArray<RefObject<Element | null>>;
  /**
   * Listen for Escape at the document. Components that already handle Escape
   * in their own keydown (Select's combobox trigger) pass `false`.
   * @default true
   */
  escape?: boolean;
  /** Dismiss on pointerdown outside every `inside` element. @default true */
  outsidePointer?: boolean;
}

/**
 * Light-dismiss behaviour (Escape + outside pointer) for floating surfaces —
 * the React face of `utils/dismiss`, and the BLUEPRINT §5 overlay-checklist
 * mechanism. Events other UI has claimed (`defaultPrevented`) never dismiss,
 * so nested surfaces take their Escape first.
 */
export function useDismiss(options: UseDismissOptions): void {
  const { active, escape = true, outsidePointer = true, inside, onDismiss } = options;

  // Latest-value refs: a new callback identity or ref list per render must
  // not detach and re-attach document listeners.
  const onDismissRef = useRef(onDismiss);
  const insideRef = useRef(inside);
  useEffect(() => {
    onDismissRef.current = onDismiss;
    insideRef.current = inside;
  });

  useEffect(() => {
    if (!active || typeof document === 'undefined') return undefined;
    return observeDismiss(document, {
      escape,
      outsidePointer,
      onDismiss: (event) => onDismissRef.current(event),
      isInside: (target) => insideRef.current.some((ref) => ref.current?.contains(target) ?? false),
    });
  }, [active, escape, outsidePointer]);
}
