/**
 * Framework-free light-dismiss observer — the shared behaviour behind
 * dismissable floating surfaces (Select's popup today; Tooltip, Popover,
 * Menu, and Toast in BLUEPRINT Phase 3). React code uses it through
 * `hooks/useDismiss`.
 *
 * While active it attaches document-level listeners:
 *
 * - `keydown` — Escape dismisses regardless of where focus sits.
 * - `pointerdown` — a press outside `isInside` dismisses. Pointerdown, not
 *   click, so the surface is gone before a click lands elsewhere (Select's
 *   original semantics).
 *
 * Events already claimed by inner UI (`defaultPrevented`) never dismiss, so
 * nested surfaces can take their Escape first.
 */
export interface DismissObserverOptions {
  /** Called with the dismissing event. */
  onDismiss: (event: KeyboardEvent | PointerEvent) => void;
  /** Whether a DOM node counts as inside the surface (never dismisses). */
  isInside: (target: Node) => boolean;
  /** Listen for the Escape key. @default true */
  escape?: boolean;
  /** Listen for pointerdown outside the surface. @default true */
  outsidePointer?: boolean;
}

/** Start observing; returns the cleanup that removes every listener. */
export function observeDismiss(doc: Document, options: DismissObserverOptions): () => void {
  const { onDismiss, isInside, escape = true, outsidePointer = true } = options;

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.key !== 'Escape') return;
    onDismiss(event);
  };
  const onPointerDown = (event: PointerEvent) => {
    if (event.defaultPrevented) return;
    const target = event.target;
    if (!(target instanceof Node) || isInside(target)) return;
    onDismiss(event);
  };

  if (escape) doc.addEventListener('keydown', onKeyDown);
  if (outsidePointer) doc.addEventListener('pointerdown', onPointerDown);
  return () => {
    doc.removeEventListener('keydown', onKeyDown);
    doc.removeEventListener('pointerdown', onPointerDown);
  };
}
