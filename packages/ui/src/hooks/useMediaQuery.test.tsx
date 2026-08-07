import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { installMatchMedia } from '../test/matchMedia';
import type { MatchMediaController } from '../test/matchMedia';
import { useMediaQuery } from './useMediaQuery';

describe('useMediaQuery', () => {
  let media: MatchMediaController | undefined;
  afterEach(() => {
    media?.restore();
    media = undefined;
  });

  it('returns the current match per query', () => {
    media = installMatchMedia((query) => query === '(min-width: 48rem)');
    const { result: matching } = renderHook(() => useMediaQuery('(min-width: 48rem)'));
    const { result: other } = renderHook(() => useMediaQuery('(min-width: 64rem)'));
    expect(matching.current).toBe(true);
    expect(other.current).toBe(false);
  });

  it('re-renders when the query result flips', () => {
    const controller = installMatchMedia(() => false);
    media = controller;
    const { result } = renderHook(() => useMediaQuery('(min-width: 48rem)'));
    expect(result.current).toBe(false);
    act(() => controller.set('(min-width: 48rem)', true));
    expect(result.current).toBe(true);
    act(() => controller.set('(min-width: 48rem)', false));
    expect(result.current).toBe(false);
  });

  it('tracks a changed query string', () => {
    media = installMatchMedia((query) => query === '(pointer: coarse)');
    const { result, rerender } = renderHook(({ query }) => useMediaQuery(query), {
      initialProps: { query: '(min-width: 48rem)' },
    });
    expect(result.current).toBe(false);
    rerender({ query: '(pointer: coarse)' });
    expect(result.current).toBe(true);
  });
});
