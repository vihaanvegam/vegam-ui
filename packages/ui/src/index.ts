// The only public entry point. Named re-exports only; no default exports.
// The CSS import is extracted into dist/index.css at build time (it does not
// survive into the JS bundle), so the built barrel stays side-effect-free.
import '@vegam-ui/tokens/tokens.css';

export { cx } from './utils/cx';
export { useIsomorphicLayoutEffect } from './utils/useIsomorphicLayoutEffect';

export { ThemeProvider, themeClasses, useComponentDefaults } from './theme';
export type { ThemeProviderProps, ColorScheme, ThemeComponentDefaults } from './theme';

export { Button, buttonClasses } from './components/Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './components/Button';

export { Input, inputClasses } from './components/Input';
export type { InputProps, InputSize } from './components/Input';

export { Text, textClasses } from './components/Text';
export type { TextProps, TextAs, TextSize, TextWeight, TextTone } from './components/Text';

export { Card, cardClasses } from './components/Card';
export type { CardProps, CardVariant, CardPadding } from './components/Card';

export { Badge, badgeClasses } from './components/Badge';
export type { BadgeProps, BadgeTone } from './components/Badge';

export { Banner, bannerClasses } from './components/Banner';
export type { BannerProps, BannerIntent, BannerSlotProps } from './components/Banner';

export { Blanket, blanketClasses } from './components/Blanket';
export type { BlanketProps } from './components/Blanket';

export { Breadcrumbs, breadcrumbsClasses } from './components/Breadcrumbs';
export type {
  BreadcrumbsProps,
  BreadcrumbsItem,
  BreadcrumbsLinkRenderProps,
  BreadcrumbsSlots,
  BreadcrumbsSlotProps,
} from './components/Breadcrumbs';

export { Modal, modalClasses } from './components/Modal';
export type { ModalProps, ModalSize, ModalAppearance, ModalSlotProps } from './components/Modal';

export { Stack, stackClasses } from './components/Stack';
export type {
  StackProps,
  StackDirection,
  StackGap,
  StackAlign,
  StackJustify,
} from './components/Stack';

export { Checkbox, checkboxClasses } from './components/Checkbox';
export type { CheckboxProps, CheckboxSize } from './components/Checkbox';

export { Select, selectClasses } from './components/Select';
export type {
  SelectProps,
  SelectSize,
  SelectOption,
  SelectOptionRenderProps,
  SelectSlots,
  SelectSlotProps,
} from './components/Select';
