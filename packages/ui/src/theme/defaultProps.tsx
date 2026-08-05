'use client';

import { createContext, useContext } from 'react';
import type { BadgeProps } from '../components/Badge/Badge.types';
import type { BannerProps } from '../components/Banner/Banner.types';
import type { ButtonProps } from '../components/Button/Button.types';
import type { CardProps } from '../components/Card/Card.types';
import type { CheckboxProps } from '../components/Checkbox/Checkbox.types';
import type { InputProps } from '../components/Input/Input.types';
import type { ModalProps } from '../components/Modal/Modal.types';
import type { SelectProps } from '../components/Select/Select.types';
import type { StackProps } from '../components/Stack/Stack.types';
import type { TextProps } from '../components/Text/Text.types';

/**
 * Per-component default props, keyed by component name. Add a concrete
 * optional key here as each component lands. Only cosmetic defaults
 * (variant, size, tone, …) belong here — never event handlers, refs,
 * content, or semantics-changing props like `as`.
 */
export interface ThemeComponentDefaults {
  Badge?: Pick<BadgeProps, 'tone'>;
  Banner?: Pick<BannerProps, 'intent'>;
  Button?: Pick<ButtonProps, 'variant' | 'size'>;
  Card?: Pick<CardProps, 'variant' | 'padding'>;
  Checkbox?: Pick<CheckboxProps, 'size'>;
  Input?: Pick<InputProps, 'size'>;
  Modal?: Pick<ModalProps, 'size' | 'appearance'>;
  Select?: Pick<SelectProps, 'size'>;
  Stack?: Pick<StackProps, 'gap'>;
  Text?: Pick<TextProps, 'size' | 'weight' | 'tone'>;
}

/**
 * Internal registry context. Intentionally minimal: theme *values* travel via
 * CSS custom properties, never through React state, so a dual-package (ESM +
 * CJS) consumer that ends up with two copies of this context still renders
 * correctly themed UI — only configured prop defaults would fall back.
 */
export const DefaultPropsContext = createContext<ThemeComponentDefaults>({});

const EMPTY_DEFAULTS = Object.freeze({});

/**
 * Reads the theme's default props for one component. Returns a stable empty
 * object when no ThemeProvider is mounted or the component has no defaults —
 * components always work without a provider.
 */
export function useComponentDefaults<K extends keyof ThemeComponentDefaults>(
  component: K,
): NonNullable<ThemeComponentDefaults[K]> {
  const registry = useContext(DefaultPropsContext);
  // The frozen empty object is a valid value for every per-component Partial.
  return (registry[component] ?? EMPTY_DEFAULTS) as NonNullable<ThemeComponentDefaults[K]>;
}
