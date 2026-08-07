// The only public entry point. Named re-exports only; no default exports.
// The CSS import is extracted into dist/index.css at build time (it does not
// survive into the JS bundle), so the built barrel stays side-effect-free.
import '@vegam-ui/tokens/tokens.css';

export { cx } from './utils/cx';
export { breakpointOrder, breakpointWidths } from './utils/breakpoints';
export type { Breakpoint } from './utils/breakpoints';
export type { ResponsiveObject, ResponsiveValue } from './utils/responsive';
export {
  spaceSteps,
  radiusSteps,
  surfaceKeys,
  borderColorKeys,
  elevationSteps,
  dividerTones,
} from './utils/tokenScales';
export type {
  SpaceStep,
  RadiusStep,
  SurfaceKey,
  BorderColorKey,
  ElevationStep,
  DividerTone,
} from './utils/tokenScales';

export { useIsomorphicLayoutEffect } from './hooks/useIsomorphicLayoutEffect';
export { useControlled } from './hooks/useControlled';
export { useMediaQuery } from './hooks/useMediaQuery';
export { useBreakpoint } from './hooks/useBreakpoint';
export { useDismiss } from './hooks/useDismiss';
export type { UseDismissOptions } from './hooks/useDismiss';
export { useTransitionState } from './hooks/useTransitionState';
export type { TransitionState, UseTransitionStateResult } from './hooks/useTransitionState';

export type { Side, Align } from './utils/positioning';

export { ThemeProvider, themeClasses, useComponentDefaults } from './theme';
export type { ThemeProviderProps, ColorScheme, ThemeComponentDefaults } from './theme';

export { Button, buttonClasses } from './components/Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './components/Button';

export { Input, inputClasses } from './components/Input';
export type { InputProps, InputSize } from './components/Input';

export { Field, fieldClasses, useField, FieldContext } from './components/Field';
export type { FieldProps, FieldSlotProps, FieldContextValue } from './components/Field';

export { IconButton, iconButtonClasses } from './components/IconButton';
export type { IconButtonProps, IconButtonName } from './components/IconButton';

export { Textarea, textareaClasses } from './components/Textarea';
export type { TextareaProps, TextareaSize } from './components/Textarea';

export { Radio, radioClasses, RadioGroup, radioGroupClasses } from './components/Radio';
export type { RadioProps, RadioGroupProps, RadioSize } from './components/Radio';

export { Switch, switchClasses } from './components/Switch';
export type { SwitchProps } from './components/Switch';

export { Slider, sliderClasses } from './components/Slider';
export type { SliderProps } from './components/Slider';

export { Spinner, spinnerClasses } from './components/Spinner';
export type { SpinnerProps, SpinnerSize } from './components/Spinner';

export { Progress, progressClasses } from './components/Progress';
export type { ProgressProps, ProgressSize, ProgressTone } from './components/Progress';

export { Skeleton, skeletonClasses } from './components/Skeleton';
export type { SkeletonProps, SkeletonVariant } from './components/Skeleton';

export { Tooltip, tooltipClasses } from './components/Tooltip';
export type { TooltipProps, TooltipSlotProps } from './components/Tooltip';

export { Popover, popoverClasses } from './components/Popover';
export type { PopoverProps, PopoverSlotProps } from './components/Popover';

export { Menu, menuClasses } from './components/Menu';
export type {
  MenuProps,
  MenuItem,
  MenuItemDomProps,
  MenuItemRenderProps,
  MenuSlots,
  MenuSlotProps,
} from './components/Menu';

export { Drawer, drawerClasses } from './components/Drawer';
export type {
  DrawerProps,
  DrawerPlacement,
  DrawerSize,
  DrawerSlotProps,
} from './components/Drawer';

export { Tabs, tabsClasses } from './components/Tabs';
export type {
  TabsProps,
  TabItem,
  TabsOrientation,
  TabsActivation,
  TabsSlotProps,
} from './components/Tabs';

export { Link, linkClasses } from './components/Link';
export type { LinkProps, LinkVariant, LinkSlots, LinkAnchorProps } from './components/Link';

export { Pagination, paginationClasses, paginationRange } from './components/Pagination';
export type { PaginationProps, PaginationSlotProps } from './components/Pagination';

export { Accordion, accordionClasses } from './components/Accordion';
export type { AccordionProps, AccordionItem, AccordionSlotProps } from './components/Accordion';

export { Avatar, avatarClasses } from './components/Avatar';
export type { AvatarProps, AvatarSize, AvatarShape } from './components/Avatar';

export { Chip, chipClasses } from './components/Chip';
export type { ChipProps, ChipTone, ChipSize, ChipSlotProps } from './components/Chip';

export { Table, tableClasses } from './components/Table';
export type {
  TableProps,
  TableColumn,
  TableSort,
  SortDirection,
  TableAlign,
  TableSlots,
  TableSlotProps,
  TableHeaderCellRenderProps,
  TableCellRenderProps,
} from './components/Table';

export { ToastProvider, useToast, toastClasses } from './components/Toast';
export type {
  ToastApi,
  ToastIntent,
  ToastOptions,
  ToastPlacement,
  ToastProviderProps,
  ToastRecord,
} from './components/Toast';

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

export { Box, boxClasses } from './components/Box';
export type { BoxProps, BoxAs } from './components/Box';

export { Flex, flexClasses } from './components/Flex';
export type { FlexProps, FlexDirection, FlexWrap, FlexAlign, FlexJustify } from './components/Flex';

export { Grid, gridClasses } from './components/Grid';
export type { GridProps } from './components/Grid';

export { Container, containerClasses } from './components/Container';
export type { ContainerProps, ContainerSize, ContainerAs } from './components/Container';

export { Divider, dividerClasses } from './components/Divider';
export type { DividerProps, DividerOrientation } from './components/Divider';

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
