import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Field } from '../Field';
import { Slider, sliderClasses } from './Slider';

const getThumb = () => screen.getByRole('slider');
const getRoot = (container: HTMLElement) =>
  container.querySelector(`.${sliderClasses.root}`) as HTMLElement;

const mockTrackRect = (container: HTMLElement, width = 100) => {
  const track = container.querySelector(`.${sliderClasses.track}`) as HTMLElement;
  Object.defineProperty(track, 'getBoundingClientRect', {
    value: () => ({
      left: 0,
      width,
      top: 0,
      right: width,
      bottom: 4,
      height: 4,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }),
  });
};

describe('Slider', () => {
  it('renders the APG slider attributes', () => {
    render(<Slider aria-label="Volume" defaultValue={30} />);
    const thumb = getThumb();
    expect(thumb).toHaveAttribute('aria-valuemin', '0');
    expect(thumb).toHaveAttribute('aria-valuemax', '100');
    expect(thumb).toHaveAttribute('aria-valuenow', '30');
    expect(thumb).toHaveAttribute('tabindex', '0');
  });

  it('keyboard: arrows, Home/End, Page keys step the value', () => {
    const onChange = vi.fn();
    render(<Slider aria-label="v" defaultValue={50} onChange={onChange} />);
    const thumb = getThumb();
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    expect(thumb).toHaveAttribute('aria-valuenow', '51');
    fireEvent.keyDown(thumb, { key: 'ArrowLeft' });
    fireEvent.keyDown(thumb, { key: 'ArrowLeft' });
    expect(thumb).toHaveAttribute('aria-valuenow', '49');
    fireEvent.keyDown(thumb, { key: 'PageUp' });
    expect(thumb).toHaveAttribute('aria-valuenow', '59');
    fireEvent.keyDown(thumb, { key: 'Home' });
    expect(thumb).toHaveAttribute('aria-valuenow', '0');
    fireEvent.keyDown(thumb, { key: 'End' });
    expect(thumb).toHaveAttribute('aria-valuenow', '100');
    expect(onChange).toHaveBeenLastCalledWith(100);
  });

  it('clamps at the bounds and snaps to step', () => {
    render(<Slider aria-label="v" min={0} max={10} step={5} defaultValue={10} />);
    const thumb = getThumb();
    fireEvent.keyDown(thumb, { key: 'ArrowUp' });
    expect(thumb).toHaveAttribute('aria-valuenow', '10');
    fireEvent.keyDown(thumb, { key: 'ArrowLeft' });
    expect(thumb).toHaveAttribute('aria-valuenow', '5');
  });

  it('pointer press jumps to the pressed value and drag continues it', () => {
    const onChange = vi.fn();
    const { container } = render(<Slider aria-label="v" onChange={onChange} />);
    mockTrackRect(container);
    const root = getRoot(container);

    fireEvent.pointerDown(root, { clientX: 30 });
    expect(onChange).toHaveBeenLastCalledWith(30);

    fireEvent.pointerMove(root, { clientX: 72 });
    expect(onChange).toHaveBeenLastCalledWith(72);

    fireEvent.pointerUp(root);
    fireEvent.pointerMove(root, { clientX: 90 });
    expect(onChange).toHaveBeenLastCalledWith(72);
  });

  // Regression: the drag's move handler is built once at pointerdown, so a
  // no-op guard comparing against the closed-over value goes stale for the
  // rest of the gesture and drops any move back to where the drag started.
  // Found in a real browser; jsdom passed because the earlier assertions
  // never returned to the starting value.
  it('drag back to the value the gesture started from still commits', () => {
    const onChange = vi.fn();
    const { container } = render(<Slider aria-label="v" defaultValue={50} onChange={onChange} />);
    mockTrackRect(container);
    const root = getRoot(container);
    const thumb = getThumb();

    fireEvent.pointerDown(root, { clientX: 20 });
    expect(thumb).toHaveAttribute('aria-valuenow', '20');

    fireEvent.pointerMove(root, { clientX: 50 });
    expect(thumb).toHaveAttribute('aria-valuenow', '50');
    expect(onChange).toHaveBeenLastCalledWith(50);
  });

  it('does not re-fire onChange when a drag stays on the same value', () => {
    const onChange = vi.fn();
    const { container } = render(<Slider aria-label="v" onChange={onChange} />);
    mockTrackRect(container);
    const root = getRoot(container);
    fireEvent.pointerDown(root, { clientX: 40 });
    fireEvent.pointerMove(root, { clientX: 40 });
    fireEvent.pointerMove(root, { clientX: 40 });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('controlled: value prop wins; onChange still reports intent', () => {
    const onChange = vi.fn();
    render(<Slider aria-label="v" value={40} onChange={onChange} />);
    const thumb = getThumb();
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith(41);
    expect(thumb).toHaveAttribute('aria-valuenow', '40');
  });

  it('disabled: not focusable, keys and pointer inert', () => {
    const onChange = vi.fn();
    const { container } = render(<Slider aria-label="v" disabled onChange={onChange} />);
    mockTrackRect(container);
    const thumb = getThumb();
    expect(thumb).toHaveAttribute('tabindex', '-1');
    expect(thumb).toHaveAttribute('aria-disabled', 'true');
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    fireEvent.pointerDown(getRoot(container), { clientX: 30 });
    expect(onChange).not.toHaveBeenCalled();
    expect(getRoot(container)).toHaveClass(sliderClasses.disabled);
  });

  it('carries the value in a hidden input when name is set', () => {
    const { container } = render(<Slider aria-label="v" name="volume" defaultValue={25} />);
    const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement;
    expect(hidden).toHaveAttribute('name', 'volume');
    expect(hidden.value).toBe('25');
  });

  it('wires up inside a Field via aria-labelledby on the thumb', () => {
    render(
      <Field label="Volume" description="Output level">
        <Slider defaultValue={10} />
      </Field>,
    );
    const thumb = screen.getByRole('slider', { name: 'Volume' });
    expect(thumb).toHaveAttribute('aria-describedby');
  });

  it("does not take a Field's required — aria-required is unsupported on role=slider", () => {
    render(
      <Field label="Volume" required requiredMarker="*">
        <Slider defaultValue={10} />
      </Field>,
    );
    expect(screen.getByRole('slider')).not.toHaveAttribute('aria-required');
  });

  it('sets the fill custom property from the value', () => {
    const { container } = render(<Slider aria-label="v" min={0} max={200} defaultValue={50} />);
    expect(getRoot(container).style.getPropertyValue('--ui-slider-fill')).toBe('25%');
  });

  // Widget ARIA must land on the role="slider" thumb; `...rest` spreads on
  // the roleless root, where assistive tech ignores it.
  it('routes aria-valuetext and aria-errormessage to the thumb, not the root', () => {
    const { container } = render(
      <Slider
        aria-label="Day"
        aria-valuetext="Wednesday"
        aria-errormessage="err-1"
        min={0}
        max={6}
        defaultValue={3}
      />,
    );
    const thumb = getThumb();
    expect(thumb).toHaveAttribute('aria-valuetext', 'Wednesday');
    expect(thumb).toHaveAttribute('aria-errormessage', 'err-1');
    const root = getRoot(container);
    expect(root).not.toHaveAttribute('aria-valuetext');
    expect(root).not.toHaveAttribute('aria-errormessage');
  });

  it('still spreads non-ARIA props on the root', () => {
    const { container } = render(<Slider aria-label="v" data-testid="root-probe" id="my-slider" />);
    const root = getRoot(container);
    expect(root).toHaveAttribute('data-testid', 'root-probe');
    expect(root).toHaveAttribute('id', 'my-slider');
  });

  it('merges className and forwards the ref to the thumb', () => {
    let node: HTMLDivElement | null = null;
    const { container } = render(
      <Slider
        ref={(el) => {
          node = el;
        }}
        aria-label="v"
        className="custom"
      />,
    );
    expect(getRoot(container)).toHaveClass('custom');
    expect(node).toBe(getThumb());
  });
});
