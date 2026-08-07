'use client';

import { forwardRef } from 'react';
import type { ChangeEvent } from 'react';
import { useComponentDefaults } from '../../theme/defaultProps';
import { cx } from '../../utils/cx';
import { useRadioGroup } from './RadioGroupContext';
import type { RadioProps } from './Radio.types';
import './Radio.css';

/** Classes rendered by {@link Radio} — the documented override surface. */
export const radioClasses = {
  root: 'ui-radio',
  sm: 'ui-radio--sm',
  md: 'ui-radio--md',
  lg: 'ui-radio--lg',
} as const;

/**
 * A radio button. Usually lives inside a {@link RadioGroup}, which supplies
 * `name`, selection state, and disabled — explicit props always win; outside
 * a group it behaves exactly like a native radio input.
 *
 * Accessibility: the native `<input type="radio">` is kept (focus, form
 * semantics, and the native arrow-key roving+select within a same-`name`
 * group all come from the platform); only its appearance is drawn — checked
 * shows a `border-width.selected` ring with a dot, the state the token was
 * cut for. Forced-colors mode restores the user agent's rendering. Label
 * each radio with a paired `<label htmlFor>`, which also extends the touch
 * target (the control itself meets the 24px AA minimum on coarse pointers,
 * the Checkbox precedent).
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(props, ref) {
  const defaults = useComponentDefaults('Radio');
  const group = useRadioGroup();
  const {
    size = group?.size ?? defaults.size ?? 'md',
    className,
    name = group?.name,
    checked = group && props.value !== undefined ? group.value === String(props.value) : undefined,
    disabled = group?.disabled || undefined,
    onChange,
    ...rest
  } = props;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    if (event.defaultPrevented) return;
    if (group && props.value !== undefined && event.target.checked) {
      group.onSelect(String(props.value), event);
    }
  };

  return (
    <input
      ref={ref}
      type="radio"
      name={name}
      checked={checked}
      disabled={disabled}
      onChange={handleChange}
      className={cx(radioClasses.root, radioClasses[size], className)}
      {...rest}
    />
  );
});
