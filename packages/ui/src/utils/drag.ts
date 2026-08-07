/**
 * Framework-free pointer-drag tracking — the behaviour under Slider's thumb
 * (and any future drag surface). React code calls it from a pointerdown
 * handler; it captures the pointer so the drag survives leaving the element,
 * reports every move, and cleans itself up on pointerup/pointercancel.
 */
export interface PointerDragHandlers {
  /** Every pointermove while dragging (and NOT the initiating pointerdown). */
  onMove: (event: PointerEvent) => void;
  /** The drag ended (pointerup or pointercancel). */
  onEnd?: (event: PointerEvent) => void;
}

/**
 * Start tracking a drag begun by `event` on `element`. Returns a cleanup
 * that detaches listeners early (component unmount mid-drag); calling it
 * after the drag ended is a no-op.
 */
export function trackPointerDrag(
  element: Element,
  event: PointerEvent,
  handlers: PointerDragHandlers,
): () => void {
  // jsdom has no pointer capture; real browsers keep the drag when the
  // pointer leaves the element.
  if (typeof element.setPointerCapture === 'function') {
    try {
      element.setPointerCapture(event.pointerId);
    } catch {
      // Capture is an enhancement — a detached element must not kill the drag.
    }
  }

  const onMove = (moveEvent: Event) => {
    handlers.onMove(moveEvent as PointerEvent);
  };
  const cleanup = () => {
    element.removeEventListener('pointermove', onMove);
    element.removeEventListener('pointerup', onUp);
    element.removeEventListener('pointercancel', onUp);
  };
  const onUp = (upEvent: Event) => {
    cleanup();
    handlers.onEnd?.(upEvent as PointerEvent);
  };

  element.addEventListener('pointermove', onMove);
  element.addEventListener('pointerup', onUp);
  element.addEventListener('pointercancel', onUp);
  return cleanup;
}
