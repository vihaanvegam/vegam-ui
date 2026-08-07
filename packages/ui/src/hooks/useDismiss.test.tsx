import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { UseDismissOptions } from './useDismiss';
import { useDismiss } from './useDismiss';

const pointerDown = (node: Node) => {
  node.dispatchEvent(new Event('pointerdown', { bubbles: true, cancelable: true }));
};
const escapeKey = () => {
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
  );
};

describe('useDismiss', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  const setup = (overrides: Partial<UseDismissOptions> = {}) => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const onDismiss = vi.fn();
    const options: UseDismissOptions = {
      active: true,
      onDismiss,
      inside: [{ current: el }],
      ...overrides,
    };
    const view = renderHook((props: UseDismissOptions) => useDismiss(props), {
      initialProps: options,
    });
    return { el, onDismiss, options, ...view };
  };

  it('dismisses on Escape and on outside pointerdown while active', () => {
    const { el, onDismiss } = setup();
    escapeKey();
    expect(onDismiss).toHaveBeenCalledTimes(1);
    pointerDown(document.body);
    expect(onDismiss).toHaveBeenCalledTimes(2);
    pointerDown(el);
    expect(onDismiss).toHaveBeenCalledTimes(2);
  });

  it('does nothing while inactive', () => {
    const { onDismiss } = setup({ active: false });
    escapeKey();
    pointerDown(document.body);
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('escape: false leaves the key path alone', () => {
    const { onDismiss } = setup({ escape: false });
    escapeKey();
    expect(onDismiss).not.toHaveBeenCalled();
    pointerDown(document.body);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('checks every inside ref', () => {
    const second = document.createElement('div');
    document.body.appendChild(second);
    const { el, onDismiss } = setup();
    // rerender with two refs via a fresh setup instead: simplest is a new hook
    const next = vi.fn();
    renderHook(() =>
      useDismiss({
        active: true,
        onDismiss: next,
        inside: [{ current: el }, { current: second }],
      }),
    );
    pointerDown(second);
    expect(next).not.toHaveBeenCalled();
    expect(onDismiss).toHaveBeenCalledTimes(1); // first hook: second div IS outside for it
  });

  it('uses the latest onDismiss without re-attaching', () => {
    const { options, rerender } = setup();
    const replacement = vi.fn();
    rerender({ ...options, onDismiss: replacement });
    escapeKey();
    expect(replacement).toHaveBeenCalledTimes(1);
    expect(options.onDismiss).not.toHaveBeenCalled();
  });

  it('stops observing on unmount', () => {
    const { onDismiss, unmount } = setup();
    unmount();
    escapeKey();
    pointerDown(document.body);
    expect(onDismiss).not.toHaveBeenCalled();
  });
});
