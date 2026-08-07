import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

/** Semantic colour. */
export type ChipTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'tag';

/** Chip sizes. */
export type ChipSize = 'sm' | 'md';

/** Per-part props for {@link Chip}. */
export interface ChipSlotProps {
  /** Props for the remove button. Button attributes, so `type`/`form` fit. */
  remove?: ButtonHTMLAttributes<HTMLButtonElement>;
}

/**
 * Props for {@link Chip}. The root is a `<span>` unless `onClick` makes it a
 * `<button>`; `onChange`-style selection is not a chip concern.
 */
export interface ChipProps extends Omit<HTMLAttributes<HTMLElement>, 'onClick'> {
  /** Label content. */
  children: ReactNode;
  /** Colour. @default 'neutral' (themeable) */
  tone?: ChipTone;
  /** Size. @default 'md' (themeable) */
  size?: ChipSize;
  /**
   * Makes the chip itself activatable — it renders a `<button>` and gets
   * keyboard semantics for free. Omit for a static label.
   */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  /** Renders a remove affordance and fires when it is used. */
  onRemove?: () => void;
  /**
   * Accessible name for the remove button ("Remove React"). REQUIRED
   * alongside `onRemove` — the library ships no copy, and an unlabelled ✕ is
   * unusable by screen reader.
   */
  removeLabel?: string;
  /** Dims the chip and blocks activation/removal. */
  disabled?: boolean;
  /** Marks an activatable chip as currently selected (`aria-pressed`). */
  selected?: boolean;
  /** Per-part props. */
  slotProps?: ChipSlotProps;
}
