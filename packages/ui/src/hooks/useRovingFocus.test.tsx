import { useState } from 'react';
import { act, render, renderHook, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useRovingFocus } from './useRovingFocus';
import type { UseRovingFocusOptions } from './useRovingFocus';

const items = [{}, {}, { disabled: true }, {}];

const key = (k: string) => ({ key: k, preventDefault: () => {} });

const renderRoving = (overrides: Partial<UseRovingFocusOptions> = {}) =>
  renderHook(() =>
    useRovingFocus({
      items,
      active: true,
      container: null,
      itemSelector: '[role="option"]',
      ...overrides,
    }),
  );

describe('useRovingFocus', () => {
  it('starts with no active item', () => {
    const { result } = renderRoving();
    expect(result.current.activeIndex).toBe(-1);
  });

  it('the forward key enters at the first enabled item', () => {
    const { result } = renderRoving();
    act(() => {
      result.current.handleNavigationKey(key('ArrowDown'));
    });
    expect(result.current.activeIndex).toBe(0);
  });

  it('the backward key enters at the last enabled item', () => {
    const { result } = renderRoving();
    act(() => {
      result.current.handleNavigationKey(key('ArrowUp'));
    });
    expect(result.current.activeIndex).toBe(3);
  });

  it('skips disabled items', () => {
    const { result } = renderRoving();
    act(() => result.current.setActiveIndex(1));
    act(() => {
      result.current.handleNavigationKey(key('ArrowDown'));
    });
    // index 2 is disabled, so it lands on 3.
    expect(result.current.activeIndex).toBe(3);
  });

  it('does not wrap by default', () => {
    const { result } = renderRoving();
    act(() => result.current.setActiveIndex(3));
    act(() => {
      result.current.handleNavigationKey(key('ArrowDown'));
    });
    expect(result.current.activeIndex).toBe(3);
  });

  it('wraps when loop is on', () => {
    const { result } = renderRoving({ loop: true });
    act(() => result.current.setActiveIndex(3));
    act(() => {
      result.current.handleNavigationKey(key('ArrowDown'));
    });
    expect(result.current.activeIndex).toBe(0);
  });

  it('uses left/right in horizontal orientation and ignores up/down', () => {
    const { result } = renderRoving({ orientation: 'horizontal' });
    act(() => {
      expect(result.current.handleNavigationKey(key('ArrowDown'))).toBe(false);
    });
    expect(result.current.activeIndex).toBe(-1);
    act(() => {
      expect(result.current.handleNavigationKey(key('ArrowRight'))).toBe(true);
    });
    expect(result.current.activeIndex).toBe(0);
  });

  it('Home and End jump to the enabled ends', () => {
    const { result } = renderRoving();
    act(() => {
      result.current.handleNavigationKey(key('End'));
    });
    expect(result.current.activeIndex).toBe(3);
    act(() => {
      result.current.handleNavigationKey(key('Home'));
    });
    expect(result.current.activeIndex).toBe(0);
  });

  it('returns false for keys it does not own', () => {
    const { result } = renderRoving();
    act(() => {
      expect(result.current.handleNavigationKey(key('Enter'))).toBe(false);
      expect(result.current.handleNavigationKey(key('a'))).toBe(false);
    });
  });

  // Regression: a stale index past the end left NOTHING focused and nothing
  // tabbable, because callers derive tabIndex from activeIndex.
  it('reconciles a stale index when the collection shrinks', () => {
    const { result, rerender } = renderHook(
      ({ list }) =>
        useRovingFocus({
          items: list,
          active: true,
          container: null,
          itemSelector: '[role="option"]',
        }),
      { initialProps: { list: items } },
    );
    act(() => result.current.setActiveIndex(3));
    expect(result.current.activeIndex).toBe(3);

    rerender({ list: [{}, {}] });
    expect(result.current.activeIndex).toBe(1);
  });

  it('clears the index when the collection empties', () => {
    const { result, rerender } = renderHook(
      ({ list }) =>
        useRovingFocus({
          items: list,
          active: true,
          container: null,
          itemSelector: '[role="option"]',
        }),
      { initialProps: { list: items } },
    );
    act(() => result.current.setActiveIndex(2));
    rerender({ list: [] });
    expect(result.current.activeIndex).toBe(-1);
  });

  it('an all-disabled list terminates rather than looping forever', () => {
    const { result } = renderRoving({
      items: [{ disabled: true }, { disabled: true }],
      loop: true,
    });
    act(() => {
      result.current.handleNavigationKey(key('ArrowDown'));
    });
    expect(result.current.activeIndex).toBe(-1);
  });

  // The focus side of the contract needs a real container. It is held in
  // STATE via a callback ref — the same pattern the components use, and the
  // reason the hook takes an element rather than a ref object.
  function Harness(props: { focusContainerWhenInactive?: boolean }) {
    const [list, setList] = useState<HTMLDivElement | null>(null);
    const { activeIndex, setActiveIndex } = useRovingFocus({
      items,
      active: true,
      container: list,
      itemSelector: '[role="option"]',
      focusContainerWhenInactive: props.focusContainerWhenInactive,
    });
    return (
      <div>
        <button type="button" onClick={() => setActiveIndex(1)}>
          activate second
        </button>
        <div ref={setList} id="list" tabIndex={-1} data-active={activeIndex}>
          {items.map((_, index) => (
            <div key={index} role="option" aria-selected={false} tabIndex={-1}>
              item {index}
            </div>
          ))}
        </div>
      </div>
    );
  }

  it('moves real DOM focus to the active item', async () => {
    render(<Harness />);
    // The container is resolved on the second render, so activate after mount.
    act(() => screen.getByRole('button').click());
    expect(screen.getByText('item 1')).toHaveFocus();
  });

  it('focuses the container when inactive only if asked', () => {
    const { unmount } = render(<Harness />);
    expect(document.getElementById('list')).not.toHaveFocus();
    unmount();

    render(<Harness focusContainerWhenInactive />);
    expect(document.getElementById('list')).toHaveFocus();
  });
});
