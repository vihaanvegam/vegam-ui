import type { ButtonHTMLAttributes, HTMLAttributes } from 'react';

/**
 * Per-part props for {@link Pagination}. The accessible names are owned by
 * the component's required label props, so they are not overridable here —
 * the step buttons are icon-only and would otherwise be nameless.
 */
export interface PaginationSlotProps {
  /** Props applied to every page button. */
  page?: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'aria-labelledby'>;
  /** Props applied to the previous/next buttons. */
  step?: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'aria-labelledby'>;
}

/** Props for {@link Pagination}. */
export interface PaginationProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'onChange' | 'defaultValue'
> {
  /** Total number of pages (≥1). */
  count: number;
  /** Controlled current page, 1-based. */
  page?: number;
  /** Initial page when uncontrolled. @default 1 */
  defaultPage?: number;
  /** Page change — receives the new 1-based page. */
  onChange?: (page: number) => void;
  /**
   * How many page buttons to show around the current one. The first and
   * last page are always shown. @default 1
   */
  siblingCount?: number;
  /** Accessible name for the navigation landmark ("Pagination"). */
  label: string;
  /** Accessible name for the previous button ("Previous page"). */
  previousLabel: string;
  /** Accessible name for the next button ("Next page"). */
  nextLabel: string;
  /**
   * Builds each page button's accessible name, e.g.
   * `(page) => \`Page \${page}\``. Without it the visible number is the
   * name, which is usually enough but reads poorly in a link list.
   */
  pageLabel?: (page: number) => string;
  /** Disables the whole control. */
  disabled?: boolean;
  /** Per-part props. */
  slotProps?: PaginationSlotProps;
}
