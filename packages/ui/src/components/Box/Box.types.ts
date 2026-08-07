import type { HTMLAttributes } from 'react';
import type { ResponsiveValue } from '../../utils/responsive';
import type {
  BorderColorKey,
  ElevationStep,
  RadiusStep,
  SpaceStep,
  SurfaceKey,
} from '../../utils/tokenScales';

/**
 * Elements Box may render. A curated list (Text precedent) rather than any
 * ElementType: Box styles a generic container, and interactive elements
 * (button, a, input…) belong to their real components.
 */
export type BoxAs =
  | 'div'
  | 'section'
  | 'article'
  | 'aside'
  | 'header'
  | 'footer'
  | 'main'
  | 'nav'
  | 'figure'
  | 'span';

/**
 * Token-typed style props for {@link Box}. Every value is a token KEY, never
 * a CSS value — arbitrary values are impossible by construction, and anything
 * beyond this surface is what `className`/`style` are for (they merge).
 *
 * Every prop accepts a `ResponsiveValue`: a scalar, or
 * `{ base, tablet?, laptop?, desktop?, wide? }` with overrides inheriting
 * upward. Side props beat axis props beat all-sides props (`pt` > `py` > `p`),
 * resolved per breakpoint.
 *
 * Directional names are LOGICAL: `pl`/`ml` map to `inline-start` (left in
 * LTR, right in RTL) and `pt`/`mt` to `block-start`, per the library's
 * logical-properties convention.
 */
export interface BoxProps extends HTMLAttributes<HTMLElement> {
  /** Element to render. Semantics only — never themeable. @default 'div' */
  as?: BoxAs;

  /** Padding, all sides — space scale step. @default none */
  p?: ResponsiveValue<SpaceStep>;
  /** Padding, inline axis (left+right in LTR). Beats `p`. */
  px?: ResponsiveValue<SpaceStep>;
  /** Padding, block axis (top+bottom). Beats `p`. */
  py?: ResponsiveValue<SpaceStep>;
  /** Padding block-start (top). Beats `py` and `p`. */
  pt?: ResponsiveValue<SpaceStep>;
  /** Padding inline-end (right in LTR). Beats `px` and `p`. */
  pr?: ResponsiveValue<SpaceStep>;
  /** Padding block-end (bottom). Beats `py` and `p`. */
  pb?: ResponsiveValue<SpaceStep>;
  /** Padding inline-start (left in LTR). Beats `px` and `p`. */
  pl?: ResponsiveValue<SpaceStep>;

  /** Margin, all sides — space scale step. @default none */
  m?: ResponsiveValue<SpaceStep>;
  /** Margin, inline axis. Beats `m`. */
  mx?: ResponsiveValue<SpaceStep>;
  /** Margin, block axis. Beats `m`. */
  my?: ResponsiveValue<SpaceStep>;
  /** Margin block-start. Beats `my` and `m`. */
  mt?: ResponsiveValue<SpaceStep>;
  /** Margin inline-end. Beats `mx` and `m`. */
  mr?: ResponsiveValue<SpaceStep>;
  /** Margin block-end. Beats `my` and `m`. */
  mb?: ResponsiveValue<SpaceStep>;
  /** Margin inline-start. Beats `mx` and `m`. */
  ml?: ResponsiveValue<SpaceStep>;

  /** Background from the semantic surface colors. @default none */
  bg?: ResponsiveValue<SurfaceKey>;
  /** Corner radius step. @default none */
  radius?: ResponsiveValue<RadiusStep>;
  /**
   * Border color from the semantic border colors; setting it draws a
   * hairline (`--ui-border-width-hairline`) solid border. @default none
   */
  borderColor?: ResponsiveValue<BorderColorKey>;
  /** Elevation shadow step (per-scheme composed shadows). @default none */
  shadow?: ResponsiveValue<ElevationStep>;
}
