import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

/** Which edge the drawer slides in from. */
export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';

/** Drawer thickness along its placement axis. */
export type DrawerSize = 'sm' | 'md' | 'lg' | 'full';

/** Per-part props for {@link Drawer}. */
export interface DrawerSlotProps {
  root?: HTMLAttributes<HTMLDivElement>;
  blanket?: HTMLAttributes<HTMLDivElement>;
  header?: HTMLAttributes<HTMLDivElement>;
  title?: HTMLAttributes<HTMLDivElement>;
  description?: HTMLAttributes<HTMLDivElement>;
  body?: HTMLAttributes<HTMLDivElement>;
  footer?: HTMLAttributes<HTMLDivElement>;
  /** Button attributes — matches Modal/Banner/Select, so `disabled` etc. type-check. */
  close?: ButtonHTMLAttributes<HTMLButtonElement>;
}

/** Props for {@link Drawer}. */
export interface DrawerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Controlled visibility. */
  open: boolean;
  /** Every dismissal affordance reports here; the consumer flips `open`. */
  onClose?: () => void;
  /** Accessible name for the dialog (`aria-labelledby`). */
  title: ReactNode;
  /** Optional supporting text (`aria-describedby`). */
  description?: ReactNode;
  /** Scrollable body content. */
  children?: ReactNode;
  /** Footer actions — consumer Buttons. */
  footer?: ReactNode;
  /** Edge to slide in from. @default 'right' (themeable) */
  placement?: DrawerPlacement;
  /** Thickness along the placement axis. @default 'md' (themeable) */
  size?: DrawerSize;
  /**
   * Accessible name for the close button. Together with `onClose` it gates
   * whether a close button renders — not defaulted, since the library ships
   * no copy.
   */
  closeLabel?: string;
  /** Per-part props. */
  slotProps?: DrawerSlotProps;
}
