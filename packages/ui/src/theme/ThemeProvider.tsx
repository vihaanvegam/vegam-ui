'use client';

import { forwardRef, useContext, useMemo } from 'react';
import type { HTMLAttributes } from 'react';
import { cx } from '../utils/cx';
import { DefaultPropsContext } from './defaultProps';
import type { ThemeComponentDefaults } from './defaultProps';
import './ThemeProvider.css';

/** Classes rendered by {@link ThemeProvider} — the documented override surface. */
export const themeClasses = {
  /** The `display: contents` wrapper carrying `data-theme`. */
  root: 'ui-theme',
} as const;

/** Color schemes shipped with the token set. */
export type ColorScheme = 'light' | 'dark';

export interface ThemeProviderProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Color scheme for this subtree, rendered as a `data-theme` attribute so the
   * semantic tokens remap in CSS. Omit to inherit the nearest ancestor scheme
   * (or the `:root` light defaults).
   */
  colorScheme?: ColorScheme;
  /**
   * Default props for components in this subtree, keyed by component name.
   * Nested providers shallow-merge per component, innermost winning.
   */
  componentDefaults?: ThemeComponentDefaults;
}

/**
 * Scopes a color scheme and component prop defaults to a subtree.
 *
 * Renders a `display: contents` wrapper (no layout impact) carrying
 * `data-theme`, so server rendering emits the correct theme with no flash and
 * nested providers re-theme only their subtree. Theme values themselves live
 * exclusively in CSS custom properties — never in React state — which keeps
 * the context surface minimal (see the dual-package note in defaultProps).
 */
export const ThemeProvider = forwardRef<HTMLDivElement, ThemeProviderProps>(function ThemeProvider(
  { colorScheme, componentDefaults, className, children, ...rest },
  ref,
) {
  const parentDefaults = useContext(DefaultPropsContext);
  const mergedDefaults = useMemo(() => {
    if (!componentDefaults) return parentDefaults;
    // Internally widened: each key of ThemeComponentDefaults holds a Partial
    // of that component's cosmetic props, and shallow-merging two values of
    // the same key preserves that shape.
    type Widened = Partial<Record<keyof ThemeComponentDefaults, Record<string, unknown>>>;
    const merged: Widened = { ...(parentDefaults as Widened) };
    for (const [component, defaults] of Object.entries(componentDefaults) as [
      keyof ThemeComponentDefaults,
      Record<string, unknown>,
    ][]) {
      merged[component] = { ...(parentDefaults as Widened)[component], ...defaults };
    }
    return merged as ThemeComponentDefaults;
  }, [parentDefaults, componentDefaults]);

  return (
    <div ref={ref} data-theme={colorScheme} className={cx(themeClasses.root, className)} {...rest}>
      <DefaultPropsContext.Provider value={mergedDefaults}>{children}</DefaultPropsContext.Provider>
    </div>
  );
});
