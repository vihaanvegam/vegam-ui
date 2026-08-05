import { describe, expect, it } from 'vitest';
import { computePopupPlacement } from './positioning';

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
