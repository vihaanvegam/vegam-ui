import { forwardRef } from 'react';
import type { ForwardRefExoticComponent, ReactNode, RefAttributes, SVGProps } from 'react';
import { ICON_SIZES } from './sizes';
import type { IconSize } from './sizes';

export type { IconSize };

export interface IconProps extends SVGProps<SVGSVGElement> {
  /**
   * Rendered width and height. Named steps map to the `size.icon-*` token
   * ramp — mind the order, it is **not** alphabetical:
   * `xxs` 12 · `sm` 16 · `md` 20 · `lg` 24 · `xxl` 28 · `xl` 32.
   * A number is treated as px. The default follows the surrounding text so an
   * icon dropped into a paragraph or a button just fits.
   * @default '1em'
   */
  size?: IconSize | number;
  /**
   * Accessible name. When present the icon is exposed to assistive tech as
   * `role="img"` with this text; when absent it is `aria-hidden` (decorative),
   * which is the right default for an icon sitting next to a visible label.
   * @default undefined
   */
  title?: string;
}

export type IconComponent = ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;

/**
 * Named steps resolve to `var(--ui-size-icon-*)` with the token's own value
 * baked in as a fallback, so an icon is correctly sized even when the consumer
 * never loads the tokens stylesheet.
 */
const resolveSize = (size: IconProps['size']): string => {
  if (size === undefined) return '1em';
  if (typeof size === 'number') return `${size}px`;
  return ICON_SIZES[size];
};

/**
 * Builds one icon component. Every generated icon is a call to this factory,
 * so the entire public API — sizing, the accessibility switch, ref and class
 * merging — is defined exactly once.
 *
 * Exported so consumers can mint their own icons that behave identically to
 * the shipped set:
 *
 * ```tsx
 * export const IconSparkle = createIcon(
 *   'IconSparkle',
 *   '0 0 16 16',
 *   <path d="M8 1 L10 6 15 8 10 10 8 15 6 10 1 8 6 6Z" fill="currentColor" />,
 * );
 * ```
 *
 * No hooks, no context, no browser globals and no `'use client'`: icons render
 * straight from a React Server Component.
 */
export function createIcon(name: string, viewBox: string, children: ReactNode): IconComponent {
  const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(props, ref) {
    const { size, title, className, style, ...rest } = props;
    const dimension = resolveSize(size);

    // A consumer-supplied name counts just as much as `title` does. Without
    // this an icon given an aria-label would keep aria-hidden="true" and stay
    // invisible to screen readers — the exact opposite of what was asked for.
    const labelled =
      title !== undefined ||
      rest['aria-label'] !== undefined ||
      rest['aria-labelledby'] !== undefined;

    return (
      <svg
        {...(labelled ? { role: 'img' } : { 'aria-hidden': true })}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={viewBox}
        fill="none"
        {...rest}
        ref={ref}
        className={className === undefined ? 'ui-icon' : `ui-icon ${className}`}
        // Consumer style spread last: an explicit width/height wins over `size`.
        style={{ width: dimension, height: dimension, ...style }}
      >
        {title === undefined ? null : <title>{title}</title>}
        {children}
      </svg>
    );
  });

  Icon.displayName = name;
  return Icon;
}
