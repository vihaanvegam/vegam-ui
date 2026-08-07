import type { AnchorHTMLAttributes, ComponentType, ReactNode } from 'react';

/** Visual weight. */
export type LinkVariant = 'default' | 'subtle' | 'standalone';

/** What {@link LinkSlots.anchor} receives — spread ALL of it on your element. */
export interface LinkAnchorProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
}

/** Replaceable parts of {@link Link}. */
export interface LinkSlots {
  /**
   * Replaces the rendered `<a>` — the router integration point (Next's
   * `Link`, React Router's `NavLink`, …). It receives every anchor prop
   * including `href` and `className`, and must render a real anchor so the
   * platform's link semantics survive. Breadcrumbs' `slots.link` precedent.
   */
  anchor?: ComponentType<LinkAnchorProps>;
}

/** Props for {@link Link}. */
export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * Visual weight: `default` is underlined in flowing text, `subtle` drops
   * the underline until hover, `standalone` is for links sitting on their
   * own (nav items, cards).
   * @default 'default' (themeable via ThemeProvider componentDefaults)
   */
  variant?: LinkVariant;
  /**
   * Marks the link as opening a new tab: sets `target`/`rel` safely and
   * exposes the fact to assistive tech via the required `newTabLabel`.
   */
  external?: boolean;
  /**
   * Visually hidden text appended for external links ("opens in a new
   * tab"). REQUIRED with `external` — an unannounced tab switch is
   * disorienting, and the library ships no copy.
   */
  newTabLabel?: string;
  /** Replaceable parts. */
  slots?: LinkSlots;
}
