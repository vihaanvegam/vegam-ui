import type { InputHTMLAttributes } from 'react';

/**
 * Extends the native checkbox input props (checked/defaultChecked/onChange
 * behave exactly like the native element). `type` and `role` are fixed by
 * the component (`checkbox` + `switch`); the native character-width `size`
 * is dropped like Input's. The track geometry comes from the
 * `size.switch-track-*` tokens — there is no size axis.
 */
export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'role'>;
