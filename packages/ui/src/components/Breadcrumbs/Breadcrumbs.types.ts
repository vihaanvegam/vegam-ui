import type {
  ComponentType,
  HTMLAttributes,
  LiHTMLAttributes,
  MouseEventHandler,
  OlHTMLAttributes,
  ReactNode,
} from 'react';

/** One crumb in the trail. The LAST item is always the current page. */
export interface BreadcrumbsItem {
  /** Visible text. Also the truncation target when `truncateWidth` is set. */
  label: string;
  /** Renders the crumb as an anchor with this destination. */
  href?: string;
  /** Click handler; without `href` the crumb renders as a button. */
  onClick?: MouseEventHandler<HTMLElement>;
  /** Decorative leading icon (16px, `currentColor`); wrapper is aria-hidden. */
  iconBefore?: ReactNode;
  /** Decorative trailing icon (16px, `currentColor`); wrapper is aria-hidden. */
  iconAfter?: ReactNode;
}

/** Render props handed to a custom link slot (router integration). */
export interface BreadcrumbsLinkRenderProps {
  item: BreadcrumbsItem;
  /** Position in the full (uncollapsed) items array. */
  index: number;
  /** Pre-merged link classes — put on the rendered element. */
  className: string;
  /** Label + icon content — render inside the element. */
  children: ReactNode;
}

/** Replaceable internal parts. */
export interface BreadcrumbsSlots {
  /**
   * Custom renderer for non-current crumbs — the hook for router links
   * (Next/Remix `<Link>`). Receives pre-merged classes and prepared children;
   * the current page always renders as the built-in span.
   */
  link?: ComponentType<BreadcrumbsLinkRenderProps>;
}

/** Extra props merged onto internal parts (className via cx, rest spread). */
export interface BreadcrumbsSlotProps {
  /** The ol element holding the crumbs. */
  list?: OlHTMLAttributes<HTMLOListElement>;
  /** Every li wrapper. */
  item?: LiHTMLAttributes<HTMLLIElement>;
  /** Every crumb element (anchor, button, or current-page span). */
  link?: HTMLAttributes<HTMLElement>;
  /** Every separator chevron (aria-hidden span). */
  separator?: HTMLAttributes<HTMLSpanElement>;
  /** The overflow (ellipsis) trigger button. */
  overflow?: HTMLAttributes<HTMLButtonElement>;
}

/** Extends the native nav props (the root element is a `<nav>`). */
export interface BreadcrumbsProps extends HTMLAttributes<HTMLElement> {
  /** The trail, root first. The last item renders as the current page. */
  items: BreadcrumbsItem[];
  /**
   * Controlled collapse state. While collapsed (and more than two items
   * exist) only the first crumb, an overflow trigger, and the current page
   * render; activating the trigger expands the full trail. Pair with
   * `onCollapsedChange`.
   */
  collapsed?: boolean;
  /** Initial collapse state for uncontrolled use. @default false */
  defaultCollapsed?: boolean;
  /** Called with the new state when the overflow trigger expands the trail. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /**
   * Accessible name for the overflow trigger (its dots are decorative CSS).
   * REQUIRED whenever the trail can collapse — without it the button has no
   * name. Not defaulted: the library ships no hardcoded copy, and this
   * string must be localized by the consumer.
   */
  overflowLabel?: string;
  /**
   * Max label width (any CSS length, e.g. `'7.5rem'`) before ellipsis
   * truncation — the Figma truncationWidth variant uses 120px. Unset labels
   * never truncate.
   */
  truncateWidth?: string;
  /** Replaceable internal parts. */
  slots?: BreadcrumbsSlots;
  /** Extra props for internal parts. */
  slotProps?: BreadcrumbsSlotProps;
}
