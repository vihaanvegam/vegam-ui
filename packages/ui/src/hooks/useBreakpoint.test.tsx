import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { installMatchMedia } from '../test/matchMedia';
import type { MatchMediaController } from '../test/matchMedia';
import { breakpointWidths } from '../utils/breakpoints';
import { useBreakpoint } from './useBreakpoint';

const queryFor = (bp: keyof typeof breakpointWidths) => `(min-width: ${breakpointWidths[bp]})`;

describe('useBreakpoint', () => {
  let media: MatchMediaController | undefined;
  afterEach(() => {
    media?.restore();
    media = undefined;
  });

  it("reports 'base' when no bound matches", () => {
    media = installMatchMedia(() => false);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current).toBe('base');
  });

  it('reports the widest matching bound', () => {
    media = installMatchMedia((query) => [queryFor('tablet'), queryFor('laptop')].includes(query));
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current).toBe('laptop');
  });

  it('updates as bounds change', () => {
    const controller = installMatchMedia(() => false);
    media = controller;
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current).toBe('base');

    act(() => controller.set(queryFor('tablet'), true));
    expect(result.current).toBe('tablet');

    act(() => {
      controller.set(queryFor('laptop'), true);
      controller.set(queryFor('desktop'), true);
      controller.set(queryFor('wide'), true);
    });
    expect(result.current).toBe('wide');

    act(() => {
      controller.set(queryFor('wide'), false);
      controller.set(queryFor('desktop'), false);
    });
    expect(result.current).toBe('laptop');
  });
});
