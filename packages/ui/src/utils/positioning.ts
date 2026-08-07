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

// ---------------------------------------------------------------------------
// Anchored placement — the general side/align model used by Tooltip, Popover
// and Menu. `computePopupPlacement` above stays as Select's width-matching
// dropdown case; this is the one to reach for otherwise.
// ---------------------------------------------------------------------------

/** Which edge of the anchor the floating element sits against. */
export type Side = 'top' | 'right' | 'bottom' | 'left';
/** Where along that edge it lines up. */
export type Align = 'start' | 'center' | 'end';

/** Anchor rect in viewport coordinates. */
export interface AnchorRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface FloatingSize {
  width: number;
  height: number;
}

export interface AnchoredPlacementInput {
  anchor: AnchorRect;
  floating: FloatingSize;
  viewport: ViewportSize;
  /** Preferred side. Flips to the opposite side when it does not fit. @default 'bottom' */
  side?: Side;
  /** Alignment along the chosen side. @default 'center' */
  align?: Align;
  /** Gap between anchor and floating element, px. @default 0 */
  offset?: number;
  /** Minimum gap kept from the viewport edges, px. @default 0 */
  padding?: number;
}

export interface AnchoredPlacement {
  top: number;
  left: number;
  /** The side actually used — may differ from the request after flipping. */
  side: Side;
  /** The alignment actually used (unchanged; shifting does not alter it). */
  align: Align;
  /** True when the preferred side did not fit and the opposite one was used. */
  flipped: boolean;
}

const OPPOSITE: Record<Side, Side> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

const isVertical = (side: Side) => side === 'top' || side === 'bottom';

/** Space available between the anchor and the viewport edge on `side`. */
function spaceOn(side: Side, anchor: AnchorRect, viewport: ViewportSize): number {
  switch (side) {
    case 'top':
      return anchor.top;
    case 'bottom':
      return viewport.height - (anchor.top + anchor.height);
    case 'left':
      return anchor.left;
    case 'right':
      return viewport.width - (anchor.left + anchor.width);
  }
}

/** Start coordinate along the cross axis for an alignment. */
function alignStart(align: Align, anchorStart: number, anchorSize: number, size: number): number {
  if (align === 'start') return anchorStart;
  if (align === 'end') return anchorStart + anchorSize - size;
  return anchorStart + (anchorSize - size) / 2;
}

/** Keep a span inside [padding, limit - padding] without going negative. */
function clamp(start: number, size: number, limit: number, padding: number): number {
  const max = limit - padding - size;
  const min = padding;
  // When the element is wider than the viewport, pin to the start edge
  // rather than letting max < min produce a nonsensical negative offset.
  if (max < min) return min;
  return Math.min(Math.max(start, min), max);
}

/**
 * Positions a floating element against an anchor on a given side/alignment,
 * flipping to the opposite side when the preferred one does not fit (and the
 * opposite has more room), then shifting along the cross axis to stay inside
 * the viewport. Pure arithmetic — callers measure and pass plain rects, and
 * apply the result as `position: fixed` coordinates.
 */
export function computeAnchoredPlacement(input: AnchoredPlacementInput): AnchoredPlacement {
  const {
    anchor,
    floating,
    viewport,
    side: preferredSide = 'bottom',
    align = 'center',
    offset = 0,
    padding = 0,
  } = input;

  const mainSize = isVertical(preferredSide) ? floating.height : floating.width;
  const needed = mainSize + offset + padding;
  const spacePreferred = spaceOn(preferredSide, anchor, viewport);
  const opposite = OPPOSITE[preferredSide];
  const spaceOpposite = spaceOn(opposite, anchor, viewport);

  // Flip only when the preferred side genuinely cannot hold it AND the other
  // side is roomier — flipping into an equally bad side just looks unstable.
  const flipped = spacePreferred < needed && spaceOpposite > spacePreferred;
  const side = flipped ? opposite : preferredSide;

  let top: number;
  let left: number;

  if (isVertical(side)) {
    top =
      side === 'bottom'
        ? anchor.top + anchor.height + offset
        : anchor.top - offset - floating.height;
    left = clamp(
      alignStart(align, anchor.left, anchor.width, floating.width),
      floating.width,
      viewport.width,
      padding,
    );
  } else {
    left =
      side === 'right'
        ? anchor.left + anchor.width + offset
        : anchor.left - offset - floating.width;
    top = clamp(
      alignStart(align, anchor.top, anchor.height, floating.height),
      floating.height,
      viewport.height,
      padding,
    );
  }

  return { top, left, side, align, flipped };
}
