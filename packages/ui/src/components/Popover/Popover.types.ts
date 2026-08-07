import type { HTMLAttributes, ReactElement, ReactNode } from 'react';
import type { Align, Side } from '../../utils/positioning';

/** Per-part props for {@link Popover}. */
export interface PopoverSlotProps {
  /** Props for the floating surface. */
  content?: HTMLAttributes<HTMLDivElement>;
}

/** Props for {@link Popover}. */
export interface PopoverProps {
  /**
   * The trigger. Exactly one focusable element — Popover clones it to attach
   * a click handler, `aria-expanded`, and `aria-haspopup`.
   */
  children: ReactElement;
  /** Surface content. May contain interactive elements (unlike Tooltip). */
  content: ReactNode;
  /**
   * Accessible name for the surface. Required: an unnamed dialog is
   * announced as an anonymous group.
   */
  label: string;
  /** Preferred side; flips when it does not fit. @default 'bottom' */
  side?: Side;
  /** Alignment along that side. @default 'center' */
  align?: Align;
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. @default false */
  defaultOpen?: boolean;
  /** Called whenever the popover wants to open or close. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Move focus into the surface when it opens. Leave on for menus of
   * actions and forms; turn off for surfaces that only add context.
   * @default true
   */
  initialFocus?: boolean;
  /** Per-part props. */
  slotProps?: PopoverSlotProps;
}
