'use client';

import { createContext, useContext } from 'react';
import type { AvatarProps } from '../components/Avatar/Avatar.types';
import type { BadgeProps } from '../components/Badge/Badge.types';
import type { BannerProps } from '../components/Banner/Banner.types';
import type { ChipProps } from '../components/Chip/Chip.types';
import type { LinkProps } from '../components/Link/Link.types';
import type { TabsProps } from '../components/Tabs/Tabs.types';
import type { ButtonProps } from '../components/Button/Button.types';
import type { CardProps } from '../components/Card/Card.types';
import type { CheckboxProps } from '../components/Checkbox/Checkbox.types';
import type { ContainerProps } from '../components/Container/Container.types';
import type { DividerProps } from '../components/Divider/Divider.types';
import type { DrawerProps } from '../components/Drawer/Drawer.types';
import type { FlexProps } from '../components/Flex/Flex.types';
import type { GridProps } from '../components/Grid/Grid.types';
import type { ProgressProps } from '../components/Progress/Progress.types';
import type { SkeletonProps } from '../components/Skeleton/Skeleton.types';
import type { SpinnerProps } from '../components/Spinner/Spinner.types';
import type { IconButtonProps } from '../components/IconButton/IconButton.types';
import type { InputProps } from '../components/Input/Input.types';
import type { RadioProps } from '../components/Radio/Radio.types';
import type { TextareaProps } from '../components/Textarea/Textarea.types';
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
  Avatar?: Pick<AvatarProps, 'size' | 'shape'>;
  Badge?: Pick<BadgeProps, 'tone'>;
  Banner?: Pick<BannerProps, 'intent'>;
  Chip?: Pick<ChipProps, 'tone' | 'size'>;
  Link?: Pick<LinkProps, 'variant'>;
  Tabs?: Pick<TabsProps, 'orientation' | 'activation'>;
  Button?: Pick<ButtonProps, 'variant' | 'size'>;
  Card?: Pick<CardProps, 'variant' | 'padding'>;
  Checkbox?: Pick<CheckboxProps, 'size'>;
  Container?: Pick<ContainerProps, 'size'>;
  Divider?: Pick<DividerProps, 'tone'>;
  Drawer?: Pick<DrawerProps, 'placement' | 'size'>;
  Flex?: Pick<FlexProps, 'gap'>;
  Grid?: Pick<GridProps, 'gap'>;
  IconButton?: Pick<IconButtonProps, 'variant' | 'size'>;
  Input?: Pick<InputProps, 'size'>;
  Modal?: Pick<ModalProps, 'size' | 'appearance'>;
  Progress?: Pick<ProgressProps, 'size' | 'tone'>;
  Radio?: Pick<RadioProps, 'size'>;
  Select?: Pick<SelectProps, 'size'>;
  Skeleton?: Pick<SkeletonProps, 'variant'>;
  Spinner?: Pick<SpinnerProps, 'size'>;
  Stack?: Pick<StackProps, 'gap'>;
  Text?: Pick<TextProps, 'size' | 'weight' | 'tone'>;
  Textarea?: Pick<TextareaProps, 'size'>;
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
