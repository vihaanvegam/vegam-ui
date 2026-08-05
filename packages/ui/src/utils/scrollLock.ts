// Framework-free scroll lock (no React types here).
// Used by Modal to stop the page behind an open dialog from scrolling.

/**
 * Locks scrolling on the document's body and returns a function that restores
 * the previous inline styles exactly.
 *
 * The vanished scrollbar's width is added as body padding so the page content
 * does not shift when the lock engages. Call only from an effect/event (never
 * during render or at module scope — SSR rule).
 */
export function lockScroll(doc: Document): () => void {
  const body = doc.body;
  const prevOverflow = body.style.overflow;
  const prevPaddingRight = body.style.paddingRight;

  const scrollbarWidth = (doc.defaultView?.innerWidth ?? 0) - doc.documentElement.clientWidth;
  if (scrollbarWidth > 0) {
    const current = parseFloat(doc.defaultView?.getComputedStyle(body).paddingRight ?? '0') || 0;
    body.style.paddingRight = `${current + scrollbarWidth}px`;
  }
  body.style.overflow = 'hidden';

  return () => {
    body.style.overflow = prevOverflow;
    body.style.paddingRight = prevPaddingRight;
  };
}
