'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { CSSProperties, KeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import { useControlled } from '../../hooks/useControlled';
import { cx } from '../../utils/cx';
import { trackPointerDrag } from '../../utils/drag';
import { useField } from '../Field/FieldContext';
import type { SliderProps } from './Slider.types';
import './Slider.css';

/** Classes rendered by {@link Slider} — the documented override surface. */
export const sliderClasses = {
  root: 'ui-slider',
  disabled: 'ui-slider--disabled',
  track: 'ui-slider__track',
  range: 'ui-slider__range',
  thumb: 'ui-slider__thumb',
} as const;

const PAGE_STEP_FACTOR = 10;

/**
 * A horizontal single-value slider (the WAI-ARIA APG slider pattern), drawn
 * from tokens with drag behaviour in framework-free `utils/drag`.
 *
 * Works controlled (`value` + `onChange`) and uncontrolled (`defaultValue`).
 * Pointer: press anywhere on the control jumps to that value and starts a
 * captured drag. Keyboard, on the thumb: Arrow Left/Down −step, Arrow
 * Right/Up +step, Home/End to the bounds, PageDown/PageUp ±10 steps. When
 * `name` is set a hidden input carries the value in form submissions
 * (Select's precedent).
 *
 * Accessibility: the thumb is the focusable `role="slider"` element carrying
 * `aria-valuemin`/`-valuemax`/`-valuenow`; the ref forwards to IT (so
 * `ref.current.focus()` works) while non-ARIA props spread on the root.
 * Name it via `aria-label`/`aria-labelledby`, or wrap it in a {@link Field} —
 * the field label wires up via `aria-labelledby`, along with description,
 * error, and disabled. **`aria-valuetext` is forwarded to the thumb** — set
 * it whenever the raw number is not what the user should hear ("Wednesday",
 * "Large"), as the APG requires. A Field's `required` is deliberately NOT
 * forwarded: `aria-required` is not supported on the `slider` role, and a
 * slider always has a value, so "required" carries no meaning. The slider is
 * horizontal-only, so `aria-orientation` is omitted from the props. RTL
 * value direction is not yet mirrored (documented limitation until the RTL
 * audit).
 */
export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(props, ref) {
  const field = useField();
  const {
    min = 0,
    max = 100,
    step = 1,
    value,
    defaultValue,
    onChange,
    disabled = field?.disabled ?? false,
    name,
    className,
    style,
    onPointerDown,
    // Widget-scoped ARIA must reach the role="slider" thumb, NOT the root:
    // `...rest` lands on the roleless wrapper, where assistive tech ignores
    // it. Anything the slider role supports is routed explicitly here.
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy = field?.labelId,
    'aria-describedby': ariaDescribedBy = field?.describedBy,
    'aria-invalid': ariaInvalid = field?.invalid || undefined,
    'aria-valuetext': ariaValueText,
    'aria-errormessage': ariaErrorMessage,
    ...rest
  } = props;

  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  // The forwarded ref points at the thumb (the focusable widget), routed the
  // same way every other component does it. A hand-rolled merging callback
  // would swallow a React 19 ref cleanup function and then call the
  // consumer's ref with null, which that contract forbids.
  useImperativeHandle(ref, () => thumbRef.current as HTMLDivElement);
  const [current, setUncontrolled, isControlled] = useControlled(value, defaultValue ?? min);

  // A drag's move handler is created once at pointerdown, so the `current` it
  // closes over is frozen for the whole gesture. Comparing against that stale
  // value silently drops any move back to where the gesture started, so the
  // no-op guard reads the latest value from a ref instead. `commit` updates
  // the ref immediately because a gesture can fire many moves before React
  // re-renders.
  const valueRef = useRef(current);
  useEffect(() => {
    valueRef.current = current;
  });

  const snap = (raw: number): number => {
    const clamped = Math.min(max, Math.max(min, raw));
    const snapped = min + Math.round((clamped - min) / step) * step;
    const decimals = (String(step).split('.')[1] ?? '').length;
    return Number(Math.min(max, Math.max(min, snapped)).toFixed(decimals));
  };

  const commit = (next: number) => {
    if (next === valueRef.current) return;
    valueRef.current = next;
    if (!isControlled) setUncontrolled(next);
    onChange?.(next);
  };

  const commitClientX = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return;
    const fraction = (clientX - rect.left) / rect.width;
    commit(snap(min + fraction * (max - min)));
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    onPointerDown?.(event);
    if (event.defaultPrevented || disabled) return;
    // Keep focus behaviour deliberate: the thumb takes focus, not the root.
    event.preventDefault();
    thumbRef.current?.focus();
    commitClientX(event.clientX);
    trackPointerDrag(event.currentTarget, event.nativeEvent, {
      onMove: (move) => commitClientX(move.clientX),
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    let next: number | undefined;
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        next = snap(current - step);
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        next = snap(current + step);
        break;
      case 'Home':
        next = min;
        break;
      case 'End':
        next = max;
        break;
      case 'PageDown':
        next = snap(current - step * PAGE_STEP_FACTOR);
        break;
      case 'PageUp':
        next = snap(current + step * PAGE_STEP_FACTOR);
        break;
      default:
        return;
    }
    event.preventDefault();
    commit(next);
  };

  const percent = max > min ? ((current - min) / (max - min)) * 100 : 0;
  const rootStyle = { '--ui-slider-fill': `${percent}%`, ...style } as CSSProperties;

  return (
    <div
      className={cx(sliderClasses.root, disabled && sliderClasses.disabled, className)}
      style={rootStyle}
      onPointerDown={handlePointerDown}
      {...rest}
    >
      <div ref={trackRef} className={sliderClasses.track}>
        <div className={sliderClasses.range} aria-hidden="true" />
        <div
          ref={thumbRef}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={current}
          aria-valuetext={ariaValueText}
          aria-disabled={disabled || undefined}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          aria-errormessage={ariaErrorMessage}
          onKeyDown={handleKeyDown}
          className={sliderClasses.thumb}
        />
      </div>
      {name !== undefined ? <input type="hidden" name={name} value={current} /> : null}
    </div>
  );
});
