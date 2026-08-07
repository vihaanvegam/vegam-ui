import type { Breakpoint } from './breakpoints';
import { breakpointOrder } from './breakpoints';

/**
 * Object form of a responsive prop. Every key is optional: a value applies
 * from its bound upward until a wider key overrides it, and omitting `base`
 * means the prop simply does not apply below the narrowest key given
 * (`{ tablet: 4 }` = "4 from tablet up"). Deviation from the blueprint's
 * base-required sketch — DECISIONS 2026-08-07.
 */
export type ResponsiveObject<T> = Partial<Record<Breakpoint, T>>;

/**
 * A prop value that can vary by breakpoint (BLUEPRINT §5 convention): either
 * a scalar (every width) or the object form. `T` must never itself be an
 * object — the token-key unions responsive props use (strings, numbers)
 * never are, and object-ness is how the two forms are told apart.
 */
export type ResponsiveValue<T> = T | ResponsiveObject<T>;

/** Normalize a ResponsiveValue to object form; scalars become `{ base }`. */
export function resolveResponsive<T>(value: ResponsiveValue<T>): ResponsiveObject<T> {
  return typeof value === 'object' && value !== null
    ? (value as ResponsiveObject<T>)
    : { base: value as T };
}

/**
 * The value a ResponsiveValue resolves to AT a breakpoint, honoring upward
 * inheritance (a `tablet` value still applies at `laptop` unless overridden).
 * Undefined when nothing at or below the breakpoint is set.
 */
export function responsiveValueAt<T>(
  value: ResponsiveValue<T> | undefined,
  bp: Breakpoint,
): T | undefined {
  if (value === undefined) return undefined;
  const steps: Partial<Record<Breakpoint, T>> = resolveResponsive(value);
  for (let i = breakpointOrder.indexOf(bp); i >= 0; i -= 1) {
    const key = breakpointOrder[i];
    if (key === undefined) continue;
    const step = steps[key];
    if (step !== undefined) return step;
  }
  return undefined;
}

/**
 * Emit per-breakpoint custom properties for one responsive prop:
 * `responsiveStyleVars('--ui-box-p', value, toCss)` →
 * `{ '--ui-box-p-base': '…', '--ui-box-p-tablet': '…' }` (present keys only).
 *
 * The component's static CSS consumes them with a fallback chain per bound —
 * see COMPONENT_RECIPE.md "Hooks, responsive & motion". A map lookup, not a
 * style engine: arbitrary CSS values are impossible by construction
 * (BLUEPRINT §4, Box). Returns a plain record, spreadable into a `style`
 * prop; framework-free on purpose (no React types in utils/).
 */
export function responsiveStyleVars<T>(
  prefix: `--${string}`,
  value: ResponsiveValue<T> | undefined,
  toCss: (value: T) => string,
): Record<string, string> {
  if (value === undefined) return {};
  const resolved: Partial<Record<Breakpoint, T>> = resolveResponsive(value);
  const vars: Record<string, string> = {};
  for (const bp of breakpointOrder) {
    const step = resolved[bp];
    if (step !== undefined) vars[`${prefix}-${bp}`] = toCss(step);
  }
  return vars;
}
