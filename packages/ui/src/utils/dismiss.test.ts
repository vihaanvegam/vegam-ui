import { afterEach, describe, expect, it, vi } from 'vitest';
import { observeDismiss } from './dismiss';

const pointerDown = (node: Node) => {
  node.dispatchEvent(new Event('pointerdown', { bubbles: true, cancelable: true }));
};
const escapeKey = (options: EventInit & { key?: string } = {}) => {
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true, ...options }),
  );
};

describe('observeDismiss', () => {
  let cleanup: (() => void) | undefined;
  afterEach(() => {
    cleanup?.();
    cleanup = undefined;
    document.body.innerHTML = '';
  });

  const setup = (options: Partial<Parameters<typeof observeDismiss>[1]> = {}) => {
    const inside = document.createElement('div');
    document.body.appendChild(inside);
    const onDismiss = vi.fn();
    cleanup = observeDismiss(document, {
      onDismiss,
      isInside: (target) => inside.contains(target),
      ...options,
    });
    return { inside, onDismiss };
  };

  it('dismisses on Escape', () => {
    const { onDismiss } = setup();
    escapeKey();
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onDismiss.mock.calls[0]?.[0]).toBeInstanceOf(KeyboardEvent);
  });

  it('ignores other keys and defaultPrevented Escapes', () => {
    const { onDismiss } = setup();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    const claim = (event: Event) => event.preventDefault();
    document.addEventListener('keydown', claim, { capture: true, once: true });
    escapeKey();
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('dismisses on pointerdown outside, not inside', () => {
    const { inside, onDismiss } = setup();
    pointerDown(inside);
    expect(onDismiss).not.toHaveBeenCalled();
    pointerDown(document.body);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('ignores defaultPrevented pointerdowns', () => {
    const { onDismiss } = setup();
    const claim = (event: Event) => event.preventDefault();
    document.addEventListener('pointerdown', claim, { capture: true, once: true });
    pointerDown(document.body);
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('honors escape/outsidePointer toggles', () => {
    const { onDismiss } = setup({ escape: false });
    escapeKey();
    expect(onDismiss).not.toHaveBeenCalled();
    pointerDown(document.body);
    expect(onDismiss).toHaveBeenCalledTimes(1);

    cleanup?.();
    const second = setup({ outsidePointer: false });
    pointerDown(document.body);
    expect(second.onDismiss).not.toHaveBeenCalled();
    escapeKey();
    expect(second.onDismiss).toHaveBeenCalledTimes(1);
  });

  it('cleanup removes every listener', () => {
    const { onDismiss } = setup();
    cleanup?.();
    cleanup = undefined;
    escapeKey();
    pointerDown(document.body);
    expect(onDismiss).not.toHaveBeenCalled();
  });
});
