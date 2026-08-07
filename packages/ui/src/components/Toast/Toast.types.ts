import type { HTMLAttributes, ReactNode } from 'react';

/** Semantic intent — drives colour AND the live-region politeness. */
export type ToastIntent = 'info' | 'success' | 'warning' | 'danger';

/** Where the stack sits on screen. */
export type ToastPlacement =
  'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end';

/** What a consumer passes to `show()`. */
export interface ToastOptions {
  /** Heading line. */
  title: ReactNode;
  /** Optional supporting text. */
  description?: ReactNode;
  /** Colour and announcement politeness. @default 'info' */
  intent?: ToastIntent;
  /**
   * Auto-dismiss delay in ms. `null` keeps it until dismissed —
   * use that for anything the user must act on.
   * @default 5000
   */
  duration?: number | null;
  /** Action element (a consumer Button). */
  action?: ReactNode;
  /** Accessible name for the close button. Omit to render no close button. */
  closeLabel?: string;
}

/** A queued toast: the options plus its assigned id. */
export interface ToastRecord extends ToastOptions {
  id: string;
  /**
   * Set once dismissal starts, so the toast can play its exit transition
   * before leaving the queue. Internal bookkeeping — never passed to `show`.
   */
  closing?: boolean;
}

/** What {@link useToast} returns. */
export interface ToastApi {
  /** Queue a toast; returns its id so it can be dismissed early. */
  show: (options: ToastOptions) => string;
  /** Dismiss one toast by id. */
  dismiss: (id: string) => void;
  /** Dismiss everything currently queued. */
  dismissAll: () => void;
}

/** Props for {@link ToastProvider}. */
export interface ToastProviderProps {
  children?: ReactNode;
  /** Where the stack renders. @default 'bottom-end' */
  placement?: ToastPlacement;
  /**
   * Maximum toasts on screen; the oldest is dropped when exceeded.
   * @default 5
   */
  max?: number;
  /** Props for the region element wrapping the stack. */
  regionProps?: HTMLAttributes<HTMLDivElement>;
}
