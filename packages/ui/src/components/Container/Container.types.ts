import type { HTMLAttributes } from 'react';

/**
 * Content width cap — each maps to the viewport tier's
 * `--ui-viewport-<size>-content-max` token.
 */
export type ContainerSize = 'tablet' | 'laptop' | 'desktop' | 'wide';

/** Elements Container may render (Box precedent: curated, non-interactive). */
export type ContainerAs = 'div' | 'section' | 'article' | 'main' | 'header' | 'footer';

/** Props for {@link Container}. */
export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  /** Element to render. Semantics only — never themeable. @default 'div' */
  as?: ContainerAs;
  /**
   * Content width cap from the viewport tokens. Page margins (inline
   * padding) always follow the CURRENT breakpoint's `viewport.*.margin`
   * regardless of the cap. Themeable. @default 'desktop'
   */
  size?: ContainerSize;
}
