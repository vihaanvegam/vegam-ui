import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useControlled } from './useControlled';

describe('useControlled', () => {
  it('uncontrolled: starts at defaultValue and updates via the setter', () => {
    const { result } = renderHook(() => useControlled<string | undefined>(undefined, 'a'));
    expect(result.current[0]).toBe('a');
    expect(result.current[2]).toBe(false);
    act(() => result.current[1]('b'));
    expect(result.current[0]).toBe('b');
  });

  it('supports lazy default initialisation', () => {
    const { result } = renderHook(() => useControlled<number>(undefined, () => 41 + 1));
    expect(result.current[0]).toBe(42);
  });

  it('controlled: reflects the prop and reports isControlled', () => {
    const { result, rerender } = renderHook(({ value }) => useControlled(value, 'a'), {
      initialProps: { value: 'x' as string | undefined },
    });
    expect(result.current[0]).toBe('x');
    expect(result.current[2]).toBe(true);
    rerender({ value: 'y' });
    expect(result.current[0]).toBe('y');
  });

  it('controlled: the resolved value ignores uncontrolled writes', () => {
    const { result } = renderHook(() => useControlled('x', 'a'));
    act(() => result.current[1]('b'));
    expect(result.current[0]).toBe('x');
    expect(result.current[2]).toBe(true);
  });
});
