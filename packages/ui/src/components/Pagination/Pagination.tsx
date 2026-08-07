'use client';

import { forwardRef } from 'react';
import { useControlled } from '../../hooks/useControlled';
import { cx } from '../../utils/cx';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import type { PaginationProps } from './Pagination.types';
import './Pagination.css';

/** Classes rendered by {@link Pagination} — the documented override surface. */
export const paginationClasses = {
  root: 'ui-pagination',
  list: 'ui-pagination__list',
  ellipsis: 'ui-pagination__ellipsis',
  chevron: 'ui-pagination__chevron',
  chevronPrevious: 'ui-pagination__chevron--previous',
  chevronNext: 'ui-pagination__chevron--next',
} as const;

/** A gap in the page sequence. */
const GAP = 'gap' as const;

/**
 * The page numbers to render: always the first and last, plus `siblings`
 * either side of the current page, with gaps standing in for the rest.
 * Exported for testing — the arithmetic is the fiddly part.
 */
export function paginationRange(
  count: number,
  page: number,
  siblings: number,
): (number | typeof GAP)[] {
  const total = Math.max(0, Math.floor(count));
  if (total <= 0) return [];
  const current = Math.min(Math.max(1, page), total);

  const first = 1;
  const last = total;

  // Gaps only earn their place when they hide more than they cost. The
  // widest gapped layout is first + last + the window + two ellipses; below
  // that, listing every page is both shorter and easier to use.
  if (total <= 2 * siblings + 5) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const start = Math.max(first, current - siblings);
  const end = Math.min(last, current + siblings);

  const pages = new Set<number>([first, last]);
  for (let index = start; index <= end; index += 1) pages.add(index);

  const sorted = [...pages].filter((n) => n >= first && n <= last).sort((a, b) => a - b);
  const result: (number | typeof GAP)[] = [];
  let previous = 0;
  for (const value of sorted) {
    // A single skipped page becomes that page, not an ellipsis hiding one
    // item behind a wider control.
    if (previous && value - previous === 2) result.push(previous + 1);
    else if (previous && value - previous > 2) result.push(GAP);
    result.push(value);
    previous = value;
  }
  return result;
}

/**
 * Page navigation, composed from Button and IconButton so it inherits their
 * focus rings, disabled semantics, and touch targets.
 *
 * Works controlled (`page` + `onChange`) and uncontrolled (`defaultPage`).
 *
 * Accessibility: a `<nav>` landmark named by `label`, wrapping a list so
 * screen readers announce how many pages are offered. The current page
 * carries `aria-current="page"` — the standard way to convey "you are here"
 * — and the ellipsis is inert text, not a disabled button, so it never
 * receives focus. Previous/next are icon buttons whose names come from the
 * required `previousLabel`/`nextLabel`; they disable at the ends rather than
 * wrapping, so the boundary is discoverable. All copy is consumer-supplied.
 */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(props, ref) {
  const {
    count,
    page,
    defaultPage = 1,
    onChange,
    siblingCount = 1,
    label,
    previousLabel,
    nextLabel,
    pageLabel,
    disabled = false,
    slotProps,
    className,
    ...rest
  } = props;

  const [current, setUncontrolled, isControlled] = useControlled(page, defaultPage);
  const total = Math.max(1, Math.floor(count));
  const clamped = Math.min(Math.max(1, current), total);

  const go = (next: number) => {
    const target = Math.min(Math.max(1, next), total);
    if (target === clamped) return;
    if (!isControlled) setUncontrolled(target);
    onChange?.(target);
  };

  const { className: pageClassName, ...pageRest } = slotProps?.page ?? {};
  const { className: stepClassName, ...stepRest } = slotProps?.step ?? {};

  const items = paginationRange(total, clamped, siblingCount);

  return (
    <nav ref={ref} aria-label={label} className={cx(paginationClasses.root, className)} {...rest}>
      <ul className={paginationClasses.list}>
        <li>
          <IconButton
            aria-label={previousLabel}
            size="sm"
            disabled={disabled || clamped <= 1}
            onClick={() => go(clamped - 1)}
            className={stepClassName}
            {...stepRest}
          >
            <span
              aria-hidden="true"
              className={cx(paginationClasses.chevron, paginationClasses.chevronPrevious)}
            />
          </IconButton>
        </li>
        {items.map((item, index) =>
          item === GAP ? (
            // Inert: an ellipsis is a gap, not a control.
            <li key={`gap-${index}`} aria-hidden="true" className={paginationClasses.ellipsis}>
              …
            </li>
          ) : (
            <li key={item}>
              <Button
                variant={item === clamped ? 'primary' : 'ghost'}
                size="sm"
                aria-current={item === clamped ? 'page' : undefined}
                aria-label={pageLabel ? pageLabel(item) : undefined}
                disabled={disabled}
                onClick={() => go(item)}
                className={pageClassName}
                {...pageRest}
              >
                {item}
              </Button>
            </li>
          ),
        )}
        <li>
          <IconButton
            aria-label={nextLabel}
            size="sm"
            disabled={disabled || clamped >= total}
            onClick={() => go(clamped + 1)}
            className={stepClassName}
            {...stepRest}
          >
            <span
              aria-hidden="true"
              className={cx(paginationClasses.chevron, paginationClasses.chevronNext)}
            />
          </IconButton>
        </li>
      </ul>
    </nav>
  );
});
