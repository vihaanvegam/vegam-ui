import type { HTMLAttributes, ReactElement, ReactNode } from 'react';
import type { Align, Side } from '../../utils/positioning';

/** Per-part props for {@link Tooltip}. */
export interface TooltipSlotProps {
  /** Props for the floating bubble. */
  content?: HTMLAttributes<HTMLDivElement>;
}

/** Props for {@link Tooltip}. */
export interface TooltipProps {
  /**
   * The trigger. Exactly one focusable element — the tooltip clones it to
   * attach handlers and `aria-describedby`, so it must forward refs and
   * spread props (every @vegam-ui component does).
   */
  children: ReactElement;
  /** Tooltip text. Plain, non-interactive content only. */
  content: ReactNode;
  /** Preferred side; flips when it does not fit. @default 'top' */
  side?: Side;
  /** Alignment along that side. @default 'center' */
  align?: Align;
  /**
   * Hover delay in ms before opening. Focus always opens immediately —
   * keyboard users get no benefit from a delay.
   * @default the `motion.duration.tooltip-delay` token value (300)
   */
  delay?: number;
  /** Controlled open state. Omit for the built-in hover/focus behaviour. */
  open?: boolean;
  /** Initial open state when uncontrolled. @default false */
  defaultOpen?: boolean;
  /** Called whenever the tooltip wants to open or close. */
  onOpenChange?: (open: boolean) => void;
  /** Disables the tooltip entirely — the trigger renders untouched. */
  disabled?: boolean;
  /** Per-part props. */
  slotProps?: TooltipSlotProps;
}
