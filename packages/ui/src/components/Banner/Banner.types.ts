import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

/** Status intents shipped with Banner. Figma's "Error" variant is `danger`. */
export type BannerIntent = 'info' | 'success' | 'warning' | 'danger';

/** Extra props merged onto internal parts (className via cx, rest spread). */
export interface BannerSlotProps {
  /** The leading icon wrapper (`span`, rendered `aria-hidden`). */
  icon?: HTMLAttributes<HTMLSpanElement>;
  /** The column holding title and description. */
  content?: HTMLAttributes<HTMLDivElement>;
  /** The title line. */
  title?: HTMLAttributes<HTMLDivElement>;
  /** The description block (rendered only when children are given). */
  description?: HTMLAttributes<HTMLDivElement>;
  /** The trailing actions container (rendered only when `actions` is given). */
  actions?: HTMLAttributes<HTMLDivElement>;
  /** The close button (rendered only when `onClose` is given). */
  close?: ButtonHTMLAttributes<HTMLButtonElement>;
}

/**
 * Extends the native div props except `title` — the native tooltip attribute —
 * which Banner redefines as its heading content (documented omission, like
 * Input's `size`). Need a browser tooltip? Put `title` on a part via
 * `slotProps` or on an outer wrapper.
 */
export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * Status color set: tinted background, matching border, and a readable
   * foreground for the title and any `currentColor` icon.
   * @default 'info' (themeable via ThemeProvider componentDefaults)
   */
  intent?: BannerIntent;
  /** The banner's heading line (bold, intent-colored). */
  title: ReactNode;
  /**
   * Supporting description rendered under the title in the secondary text
   * color. Omit it for a single-line banner.
   */
  children?: ReactNode;
  /**
   * Decorative leading icon. The library ships no icon assets — pass your
   * own (an SVG using `currentColor` picks up the intent foreground). The
   * wrapper is `aria-hidden`: the title must carry the meaning.
   */
  icon?: ReactNode;
  /**
   * Action area after the content — typically one or two small `Button`s.
   * Content is consumer-provided; the banner only lays it out.
   */
  actions?: ReactNode;
  /**
   * Renders the close button and is called when it is activated. The banner
   * does not remove itself — dismissal state belongs to the consumer.
   */
  onClose?: () => void;
  /**
   * Accessible name for the close button (its glyph is decorative CSS).
   * REQUIRED whenever `onClose` is set — without it the button has no name.
   * Not defaulted: the library ships no hardcoded copy, and this string must
   * be localized by the consumer.
   */
  closeLabel?: string;
  /** Extra props for internal parts. */
  slotProps?: BannerSlotProps;
}
