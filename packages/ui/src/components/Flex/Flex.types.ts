import type { HTMLAttributes } from 'react';
import type { ResponsiveValue } from '../../utils/responsive';
import type { SpaceStep } from '../../utils/tokenScales';

/** Main-axis direction. */
export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
/** Line wrapping. */
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
/** Cross-axis alignment (align-items). */
export type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
/** Main-axis distribution (justify-content). */
export type FlexJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

/**
 * Props for {@link Flex}. Container props (`direction`, `wrap`, `align`,
 * `justify`, `gap`) are responsive; item props (`grow`, `shrink`, `basis`)
 * apply when a Flex is itself a flex child and are static. Flex deliberately
 * has no padding/margin surface — compose with Box for spacing.
 */
export interface FlexProps extends HTMLAttributes<HTMLDivElement> {
  /** Main-axis direction. @default 'row' (Stack is the column-first sibling) */
  direction?: ResponsiveValue<FlexDirection>;
  /** Line wrapping. @default 'nowrap' */
  wrap?: ResponsiveValue<FlexWrap>;
  /** Cross-axis alignment. @default 'stretch' */
  align?: ResponsiveValue<FlexAlign>;
  /** Main-axis distribution. @default 'start' */
  justify?: ResponsiveValue<FlexJustify>;
  /** Gap between children — space scale step. Themeable. @default 0 */
  gap?: ResponsiveValue<SpaceStep>;
  /** flex-grow factor when this Flex is a flex item. @default 0 */
  grow?: number;
  /** flex-shrink factor when this Flex is a flex item. @default 1 */
  shrink?: number;
  /** flex-basis when this Flex is a flex item: a space step or 'auto'. @default 'auto' */
  basis?: SpaceStep | 'auto';
}
