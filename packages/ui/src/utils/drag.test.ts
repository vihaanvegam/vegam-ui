import { afterEach, describe, expect, it, vi } from 'vitest';
import { trackPointerDrag } from './drag';

const pointer = (type: string) => new Event(type) as PointerEvent;

describe('trackPointerDrag', () => {
  let el: HTMLDivElement;
  afterEach(() => {
    document.body.innerHTML = '';
  });

  const setup = () => {
    el = document.createElement('div');
    document.body.appendChild(el);
    const onMove = vi.fn();
    const onEnd = vi.fn();
    const cleanup = trackPointerDrag(el, pointer('pointerdown'), { onMove, onEnd });
    return { onMove, onEnd, cleanup };
  };

  it('reports moves until pointerup, then ends and detaches', () => {
    const { onMove, onEnd } = setup();
    el.dispatchEvent(pointer('pointermove'));
    el.dispatchEvent(pointer('pointermove'));
    expect(onMove).toHaveBeenCalledTimes(2);

    el.dispatchEvent(pointer('pointerup'));
    expect(onEnd).toHaveBeenCalledTimes(1);

    el.dispatchEvent(pointer('pointermove'));
    expect(onMove).toHaveBeenCalledTimes(2);
  });

  it('pointercancel ends the drag too', () => {
    const { onMove, onEnd } = setup();
    el.dispatchEvent(pointer('pointercancel'));
    expect(onEnd).toHaveBeenCalledTimes(1);
    el.dispatchEvent(pointer('pointermove'));
    expect(onMove).not.toHaveBeenCalled();
  });

  it('manual cleanup detaches without calling onEnd', () => {
    const { onMove, onEnd, cleanup } = setup();
    cleanup();
    el.dispatchEvent(pointer('pointermove'));
    el.dispatchEvent(pointer('pointerup'));
    expect(onMove).not.toHaveBeenCalled();
    expect(onEnd).not.toHaveBeenCalled();
  });
});
