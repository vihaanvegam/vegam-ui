import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

/**
 * Panel width steps shipped with Modal (Figma Size axis). `fullscreen` fills
 * the padded viewport in both dimensions.
 */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';

/**
 * Header icon tint (Figma Appearance axis). It colors ONLY the icon slot —
 * warning/danger use the matching `action.*.fg-on-soft` token so a
 * `currentColor` icon reads as the intent; everything else is unchanged.
 */
export type ModalAppearance = 'default' | 'warning' | 'danger';

/** Extra props merged onto internal parts (className via cx, rest spread). */
export interface ModalSlotProps {
  /** The full-viewport positioning wrapper (portal child). */
  root?: HTMLAttributes<HTMLDivElement>;
  /** The Blanket scrim behind the panel. */
  blanket?: HTMLAttributes<HTMLDivElement>;
  /** The header row (icon · headings · close). */
  header?: HTMLAttributes<HTMLDivElement>;
  /** The leading icon wrapper (rendered when `icon` is given). */
  icon?: HTMLAttributes<HTMLSpanElement>;
  /** The title line. */
  title?: HTMLAttributes<HTMLDivElement>;
  /** The description line (rendered when `description` is given). */
  description?: HTMLAttributes<HTMLDivElement>;
  /** The scrollable body (rendered when children are given). */
  body?: HTMLAttributes<HTMLDivElement>;
  /** The footer row (rendered when `footer` is given). */
  footer?: HTMLAttributes<HTMLDivElement>;
  /** The close button (rendered when `onClose` + `closeLabel` are given). */
  close?: ButtonHTMLAttributes<HTMLButtonElement>;
}

/**
 * Extends the native div props of the dialog panel except `title` — the
 * native tooltip attribute — which Modal redefines as its heading content
 * (documented omission, like Input's `size` and Banner's `title`).
 */
export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Whether the dialog is open. The modal renders nothing when false. */
  open: boolean;
  /**
   * Called when the user asks to dismiss: Escape, a blanket click, or the
   * close button. The modal does not close itself — flip `open` in response.
   */
  onClose?: () => void;
  /** The dialog's heading; also names the dialog via aria-labelledby. */
  title: ReactNode;
  /** Supporting line under the title; wired to aria-describedby. */
  description?: ReactNode;
  /** Scrollable body content. */
  children?: ReactNode;
  /**
   * Decorative header icon. The library ships no icon assets — pass your own
   * (a `currentColor` SVG picks up the appearance tint). The wrapper is
   * `aria-hidden`: the title must carry the meaning.
   */
  icon?: ReactNode;
  /** Footer action area — typically Buttons; end-aligned. */
  footer?: ReactNode;
  /**
   * Panel width step.
   * @default 'sm' (themeable via ThemeProvider componentDefaults)
   */
  size?: ModalSize;
  /**
   * Header icon tint.
   * @default 'default' (themeable via ThemeProvider componentDefaults)
   */
  appearance?: ModalAppearance;
  /**
   * Accessible name for the close button (its glyph is decorative CSS).
   * The close button renders only when BOTH `closeLabel` and `onClose` are
   * set. Not defaulted: the library ships no hardcoded copy, and this string
   * must be localized by the consumer.
   */
  closeLabel?: string;
  /** Extra props for internal parts. */
  slotProps?: ModalSlotProps;
}
