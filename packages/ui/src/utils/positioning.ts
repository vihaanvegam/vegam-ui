/**
 * Framework-free popup positioning (no React, no DOM types beyond numbers —
 * callers measure and pass plain rects).
 */

export interface RectLike {
  top: number;
  left: number;
  bottom: number;
  width: number;
}

export interface ViewportSize {
  width: number;
  height: number;
}

export interface PopupPlacementInput {
  trigger: RectLike;
  viewport: ViewportSize;
  /** Measured (or estimated) popup height in px. */
  popupHeight: number;
  /** Gap between trigger and popup in px. */
  offset: number;
}

export interface PopupPlacement {
  top: number;
  left: number;
  minWidth: number;
  maxHeight: number;
  placement: 'below' | 'above';
}

/**
 * Places the popup below the trigger, flipping above when it does not fit
 * below AND there is more room above. maxHeight is capped to the available
 * space so the listbox scrolls instead of overflowing the viewport.
 */
export function computePopupPlacement(input: PopupPlacementInput): PopupPlacement {
  const { trigger, viewport, popupHeight, offset } = input;
  const spaceBelow = viewport.height - trigger.bottom - offset;
  const spaceAbove = trigger.top - offset;
  const fitsBelow = popupHeight <= spaceBelow;
  const placement = fitsBelow || spaceBelow >= spaceAbove ? 'below' : 'above';

  const maxHeight = Math.max(0, placement === 'below' ? spaceBelow : spaceAbove);
  const height = Math.min(popupHeight, maxHeight);
  const top = placement === 'below' ? trigger.bottom + offset : trigger.top - offset - height;
  const left = Math.max(0, Math.min(trigger.left, viewport.width - trigger.width));

  return { top, left, minWidth: trigger.width, maxHeight, placement };
}
