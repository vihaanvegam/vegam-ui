'use client';

import { forwardRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import type { BreadcrumbsItem, BreadcrumbsProps } from './Breadcrumbs.types';
import './Breadcrumbs.css';

/** Classes rendered by {@link Breadcrumbs} — the documented override surface. */
export const breadcrumbsClasses = {
  root: 'ui-breadcrumbs',
  list: 'ui-breadcrumbs__list',
  item: 'ui-breadcrumbs__item',
  link: 'ui-breadcrumbs__link',
  current: 'ui-breadcrumbs__link--current',
  label: 'ui-breadcrumbs__label',
  icon: 'ui-breadcrumbs__icon',
  separator: 'ui-breadcrumbs__separator',
  overflow: 'ui-breadcrumbs__overflow',
  dots: 'ui-breadcrumbs__dots',
} as const;

/**
 * A breadcrumb trail. Items are data (root first); the last item is the
 * current page. With `collapsed` (or `defaultCollapsed`) and more than two
 * items, the middle of the trail folds into an overflow trigger — activating
 * it expands the full path (the Figma "collapsed" variant).
 *
 * No cosmetic defaults are registered in the theme: Breadcrumbs has no
 * variant/size axis, so it does not read `useComponentDefaults`.
 *
 * Accessibility: a `<nav>` landmark — label it via `aria-label` (e.g.
 * "Breadcrumb"), which is not defaulted because the library ships no
 * hardcoded copy. Crumbs live in an `<ol>` so assistive tech announces
 * order and count. The current page is a `<span aria-current="page">`, never
 * a link. Separators and icons are `aria-hidden` decoration. The overflow
 * trigger is a native `<button>` named by `overflowLabel` with
 * `aria-expanded`; links/buttons show the `:focus-visible` ring from the
 * focus tokens and reach 44px targets on coarse pointers.
 */
export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(
  function Breadcrumbs(props, ref) {
    const {
      items,
      collapsed,
      defaultCollapsed = false,
      onCollapsedChange,
      overflowLabel,
      truncateWidth,
      slots,
      slotProps,
      className,
      style,
      ...rest
    } = props;

    const [innerCollapsed, setInnerCollapsed] = useState(defaultCollapsed);
    const isControlled = collapsed !== undefined;
    // The undefined checks below are for noUncheckedIndexedAccess only —
    // length > 2 already guarantees both ends exist.
    const first = items[0];
    const last = items[items.length - 1];
    const isCollapsed = (isControlled ? collapsed : innerCollapsed) && items.length > 2;

    const expand = () => {
      if (!isControlled) setInnerCollapsed(false);
      onCollapsedChange?.(false);
    };

    const { className: listClassName, ...listRest } = slotProps?.list ?? {};
    const { className: itemClassName, ...itemRest } = slotProps?.item ?? {};
    const { className: linkClassName, ...linkRest } = slotProps?.link ?? {};
    const { className: separatorClassName, ...separatorRest } = slotProps?.separator ?? {};
    const { className: overflowClassName, ...overflowRest } = slotProps?.overflow ?? {};

    const LinkSlot = slots?.link;

    const rootStyle: CSSProperties | undefined = truncateWidth
      ? ({ ...style, '--ui-breadcrumbs-truncate-width': truncateWidth } as CSSProperties)
      : style;

    const separator = (
      <span
        aria-hidden="true"
        className={cx(breadcrumbsClasses.separator, separatorClassName)}
        {...separatorRest}
      />
    );

    const renderCrumb = (item: BreadcrumbsItem, index: number) => {
      const isCurrent = index === items.length - 1;
      const content: ReactNode = (
        <>
          {item.iconBefore ? (
            <span aria-hidden="true" className={breadcrumbsClasses.icon}>
              {item.iconBefore}
            </span>
          ) : null}
          <span className={breadcrumbsClasses.label}>{item.label}</span>
          {item.iconAfter ? (
            <span aria-hidden="true" className={breadcrumbsClasses.icon}>
              {item.iconAfter}
            </span>
          ) : null}
        </>
      );

      const crumbClassName = cx(
        breadcrumbsClasses.link,
        isCurrent && breadcrumbsClasses.current,
        linkClassName,
      );

      let crumb: ReactNode;
      if (isCurrent) {
        crumb = (
          <span aria-current="page" className={crumbClassName} {...linkRest}>
            {content}
          </span>
        );
      } else if (LinkSlot) {
        crumb = (
          <LinkSlot item={item} index={index} className={crumbClassName}>
            {content}
          </LinkSlot>
        );
      } else if (item.href !== undefined) {
        crumb = (
          <a href={item.href} onClick={item.onClick} className={crumbClassName} {...linkRest}>
            {content}
          </a>
        );
      } else if (item.onClick) {
        crumb = (
          <button type="button" onClick={item.onClick} className={crumbClassName} {...linkRest}>
            {content}
          </button>
        );
      } else {
        crumb = (
          <span className={crumbClassName} {...linkRest}>
            {content}
          </span>
        );
      }

      return (
        <li
          key={`${index}-${item.label}`}
          className={cx(breadcrumbsClasses.item, itemClassName)}
          {...itemRest}
        >
          {crumb}
          {!isCurrent ? separator : null}
        </li>
      );
    };

    return (
      <nav ref={ref} className={cx(breadcrumbsClasses.root, className)} style={rootStyle} {...rest}>
        <ol className={cx(breadcrumbsClasses.list, listClassName)} {...listRest}>
          {isCollapsed && first !== undefined && last !== undefined ? (
            <>
              {renderCrumb(first, 0)}
              <li
                key="overflow"
                className={cx(breadcrumbsClasses.item, itemClassName)}
                {...itemRest}
              >
                <button
                  type="button"
                  aria-label={overflowLabel}
                  aria-expanded={false}
                  onClick={expand}
                  className={cx(breadcrumbsClasses.overflow, overflowClassName)}
                  {...overflowRest}
                >
                  <span className={breadcrumbsClasses.dots} />
                </button>
                {separator}
              </li>
              {renderCrumb(last, items.length - 1)}
            </>
          ) : (
            items.map(renderCrumb)
          )}
        </ol>
      </nav>
    );
  },
);
