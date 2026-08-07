import { describe, expect, it } from 'vitest';
import { computeAnchoredPlacement, computePopupPlacement } from './positioning';

const viewport = { width: 1000, height: 800 };

describe('computePopupPlacement', () => {
  it('places below when there is room', () => {
    const placement = computePopupPlacement({
      trigger: { top: 100, left: 50, bottom: 140, width: 200 },
      viewport,
      popupHeight: 300,
      offset: 4,
    });
    expect(placement.placement).toBe('below');
    expect(placement.top).toBe(144);
    expect(placement.left).toBe(50);
    expect(placement.minWidth).toBe(200);
    expect(placement.maxHeight).toBe(800 - 140 - 4);
  });

  it('flips above when below is tight and above is roomier', () => {
    const placement = computePopupPlacement({
      trigger: { top: 700, left: 50, bottom: 740, width: 200 },
      viewport,
      popupHeight: 300,
      offset: 4,
    });
    expect(placement.placement).toBe('above');
    expect(placement.top).toBe(700 - 4 - 300);
    expect(placement.maxHeight).toBe(696);
  });

  it('caps maxHeight to available space and clamps left into the viewport', () => {
    const placement = computePopupPlacement({
      trigger: { top: 780, left: 950, bottom: 790, width: 200 },
      viewport,
      popupHeight: 900,
      offset: 4,
    });
    expect(placement.maxHeight).toBeLessThanOrEqual(776);
    expect(placement.left).toBe(800);
  });
});

describe('computeAnchoredPlacement', () => {
  // A 100x40 anchor sitting comfortably in the middle of the viewport.
  const anchor = { top: 300, left: 400, width: 100, height: 40 };
  const floating = { width: 200, height: 80 };

  it('defaults to bottom/center with no offset', () => {
    const p = computeAnchoredPlacement({ anchor, floating, viewport });
    expect(p.side).toBe('bottom');
    expect(p.flipped).toBe(false);
    expect(p.top).toBe(340); // anchor bottom
    expect(p.left).toBe(350); // centered: 400 + (100 - 200) / 2
  });

  it('applies the offset on the main axis only', () => {
    const p = computeAnchoredPlacement({ anchor, floating, viewport, offset: 8 });
    expect(p.top).toBe(348);
    expect(p.left).toBe(350);
  });

  it.each([
    ['start', 400],
    ['center', 350],
    ['end', 300],
  ] as const)('aligns %s along a vertical side', (align, expectedLeft) => {
    const p = computeAnchoredPlacement({ anchor, floating, viewport, align });
    expect(p.left).toBe(expectedLeft);
  });

  it('places on the requested horizontal side', () => {
    const p = computeAnchoredPlacement({ anchor, floating, viewport, side: 'right', offset: 4 });
    expect(p.side).toBe('right');
    expect(p.left).toBe(504); // 400 + 100 + 4
    expect(p.top).toBe(280); // centered: 300 + (40 - 80) / 2
  });

  it('flips to the opposite side when the preferred one cannot fit', () => {
    // Anchor near the bottom edge: no room below, plenty above.
    const low = { top: 760, left: 400, width: 100, height: 40 };
    const p = computeAnchoredPlacement({ anchor: low, floating, viewport, side: 'bottom' });
    expect(p.flipped).toBe(true);
    expect(p.side).toBe('top');
    expect(p.top).toBe(680); // 760 - 80
  });

  it('does NOT flip when the opposite side is no roomier', () => {
    // Squeezed both ways — flipping would not help, so stay put.
    const tall = { width: 200, height: 700 };
    const p = computeAnchoredPlacement({
      anchor: { top: 380, left: 400, width: 100, height: 40 },
      floating: tall,
      viewport,
      side: 'bottom',
    });
    expect(p.flipped).toBe(false);
    expect(p.side).toBe('bottom');
  });

  it('shifts along the cross axis to stay inside the viewport', () => {
    const nearLeft = { top: 300, left: 10, width: 40, height: 40 };
    const p = computeAnchoredPlacement({
      anchor: nearLeft,
      floating,
      viewport,
      padding: 8,
    });
    // Centering would put it at -70; clamped to the padding instead.
    expect(p.left).toBe(8);
  });

  it('shifts away from the right edge too', () => {
    const nearRight = { top: 300, left: 960, width: 40, height: 40 };
    const p = computeAnchoredPlacement({ anchor: nearRight, floating, viewport, padding: 8 });
    expect(p.left).toBe(1000 - 8 - 200);
  });

  it('pins to the start edge when the floating element exceeds the viewport', () => {
    const huge = { width: 1200, height: 80 };
    const p = computeAnchoredPlacement({ anchor, floating: huge, viewport, padding: 8 });
    expect(p.left).toBe(8);
  });

  it('reports the alignment it used', () => {
    const p = computeAnchoredPlacement({ anchor, floating, viewport, align: 'end' });
    expect(p.align).toBe('end');
  });
});
