'use client';

import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { useComponentDefaults } from '../../theme/defaultProps';
import { cx } from '../../utils/cx';
import { useIsomorphicLayoutEffect } from '../../hooks/useIsomorphicLayoutEffect';
import { useField } from '../Field/FieldContext';
import type { TextareaProps } from './Textarea.types';
import './Textarea.css';

/** Classes rendered by {@link Textarea} — the documented override surface. */
export const textareaClasses = {
  root: 'ui-textarea',
  autosize: 'ui-textarea--autosize',
  sm: 'ui-textarea--sm',
  md: 'ui-textarea--md',
  lg: 'ui-textarea--lg',
} as const;

const DEFAULT_MIN_ROWS = 2;

/**
 * A multi-line text input — Input's sibling, same states and tokens.
 *
 * Fixed height comes from the native `rows` attribute (with the user-agent's
 * vertical resize handle). Passing `minRows` and/or `maxRows` opts into
 * autosize instead: the height tracks the content between those row bounds,
 * scrolling beyond `maxRows`; the manual resize handle is disabled so it
 * cannot fight the measurement.
 *
 * Accessibility: renders a native `<textarea>` — focus, IME, and form
 * semantics come from the platform. Mark invalid values with `aria-invalid`
 * (the danger styling keys off it). Inside a {@link Field}, the id,
 * `aria-describedby`, `aria-invalid`, `aria-required`, and `disabled` wire up
 * automatically — explicit props always win.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(props, ref) {
    const defaults = useComponentDefaults('Textarea');
    const field = useField();
    const {
      size = defaults.size ?? 'md',
      minRows,
      maxRows,
      rows,
      className,
      id = field?.controlId,
      disabled = field?.disabled || undefined,
      'aria-describedby': ariaDescribedBy = field?.describedBy,
      'aria-invalid': ariaInvalid = field?.invalid || undefined,
      'aria-required': ariaRequired = field?.required || undefined,
      ...rest
    } = props;

    const autosize = minRows !== undefined || maxRows !== undefined;
    const lowerRows = minRows ?? DEFAULT_MIN_ROWS;

    const innerRef = useRef<HTMLTextAreaElement>(null);
    useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);

    const measure = useCallback(() => {
      const el = innerRef.current;
      if (!el) return;
      const style = window.getComputedStyle(el);
      const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.5;
      const padding = parseFloat(style.paddingBlockStart) + parseFloat(style.paddingBlockEnd);
      const borders =
        parseFloat(style.borderBlockStartWidth) + parseFloat(style.borderBlockEndWidth);
      const min = lowerRows * lineHeight + padding + borders;
      const max = maxRows !== undefined ? maxRows * lineHeight + padding + borders : Infinity;
      // Test DOMs report no layout metrics — bail rather than write NaN.
      if (!Number.isFinite(min)) return;
      // Collapse first so scrollHeight reports the content's real height;
      // scrollHeight is content + padding, so borders complete the border-box.
      el.style.blockSize = 'auto';
      const next = Math.min(Math.max(el.scrollHeight + borders, min), max);
      el.style.blockSize = `${next}px`;
    }, [lowerRows, maxRows]);

    // Measure on mount, on controlled value changes, and on every native
    // input (covers uncontrolled typing without re-rendering).
    useIsomorphicLayoutEffect(() => {
      if (!autosize) {
        // Autosize can be switched off on a mounted textarea. The inline
        // block-size measure() wrote outranks both the class rules and the
        // `rows` attribute, so leaving it behind would freeze the height.
        if (innerRef.current) innerRef.current.style.blockSize = '';
        return undefined;
      }
      measure();
      const el = innerRef.current;
      el?.addEventListener('input', measure);
      return () => el?.removeEventListener('input', measure);
    }, [autosize, measure, props.value, size]);

    return (
      <textarea
        ref={innerRef}
        id={id}
        rows={autosize ? lowerRows : rows}
        disabled={disabled}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-required={ariaRequired}
        className={cx(
          textareaClasses.root,
          textareaClasses[size],
          autosize && textareaClasses.autosize,
          className,
        )}
        {...rest}
      />
    );
  },
);
