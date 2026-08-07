import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { installMatchMedia } from '../test/matchMedia';
import { useTransitionState } from './useTransitionState';

describe('useTransitionState', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame'],
    });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  // The pre-enter frame is scheduled via requestAnimationFrame, which the
  // fake-timer clock fires on its ~16ms tick.
  const advanceFrame = () =>
    act(() => {
      vi.advanceTimersByTime(16);
    });
  const advance = (ms: number) =>
    act(() => {
      vi.advanceTimersByTime(ms);
    });

  it('starts unmounted and exited when closed', () => {
    const { result } = renderHook(() => useTransitionState(false, 200));
    expect(result.current).toEqual({ mounted: false, state: 'exited' });
  });

  it('walks exited → entering → entered on open', () => {
    const { result, rerender } = renderHook(({ open }) => useTransitionState(open, 200), {
      initialProps: { open: false },
    });
    rerender({ open: true });
    expect(result.current).toEqual({ mounted: true, state: 'exited' });
    advanceFrame();
    expect(result.current.state).toBe('entering');
    advance(200);
    expect(result.current.state).toBe('entered');
  });

  it('walks exiting → exited on close, then unmounts', () => {
    const { result, rerender } = renderHook(({ open }) => useTransitionState(open, 200), {
      initialProps: { open: true },
    });
    advanceFrame();
    advance(200);
    expect(result.current).toEqual({ mounted: true, state: 'entered' });

    rerender({ open: false });
    expect(result.current).toEqual({ mounted: true, state: 'exiting' });
    advance(200);
    expect(result.current).toEqual({ mounted: false, state: 'exited' });
  });

  it('restarts the enter cleanly when reopened mid-exit', () => {
    const { result, rerender } = renderHook(({ open }) => useTransitionState(open, 200), {
      initialProps: { open: true },
    });
    advanceFrame();
    advance(200);
    rerender({ open: false });
    expect(result.current.state).toBe('exiting');

    rerender({ open: true });
    expect(result.current.mounted).toBe(true);
    advanceFrame();
    expect(result.current.state).toBe('entering');
    advance(200);
    expect(result.current).toEqual({ mounted: true, state: 'entered' });
  });

  it('snaps straight to the end states under reduced motion', () => {
    const media = installMatchMedia((query) => query === '(prefers-reduced-motion: reduce)');
    try {
      const { result, rerender } = renderHook(({ open }) => useTransitionState(open, 200), {
        initialProps: { open: false },
      });
      rerender({ open: true });
      expect(result.current).toEqual({ mounted: true, state: 'entered' });
      rerender({ open: false });
      expect(result.current).toEqual({ mounted: false, state: 'exited' });
    } finally {
      media.restore();
    }
  });

  it('treats a zero duration as instant', () => {
    const { result, rerender } = renderHook(({ open }) => useTransitionState(open, 0), {
      initialProps: { open: false },
    });
    rerender({ open: true });
    expect(result.current).toEqual({ mounted: true, state: 'entered' });
  });
});
