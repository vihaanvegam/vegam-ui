import type { HTMLAttributes, LabelHTMLAttributes, ReactNode } from 'react';

/** Per-part props for {@link Field}'s rendered parts. */
export interface FieldSlotProps {
  /** Props for the `<label>`. */
  label?: LabelHTMLAttributes<HTMLLabelElement>;
  /** Props for the description container. */
  description?: HTMLAttributes<HTMLElement>;
  /** Props for the error container. */
  error?: HTMLAttributes<HTMLElement>;
}

/**
 * Props for {@link Field} — label/description/error wiring around exactly ONE
 * control. All copy is consumer content; nothing is defaulted.
 */
export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  /** The visible label. Required — an unlabeled control is not an option. */
  label: ReactNode;
  /** Supporting text under the label, wired via `aria-describedby`. */
  description?: ReactNode;
  /**
   * Error content. Its presence marks the field (and the wrapped control)
   * invalid and wires the text via `aria-describedby`.
   */
  error?: ReactNode;
  /** Marks the control required (`aria-required`) and renders `requiredMarker`. */
  required?: boolean;
  /** Disables the wrapped library control and dims the label. @default false */
  disabled?: boolean;
  /**
   * Visual marker rendered after the label while `required` — a slot, not a
   * hardcoded `*` (no shipped copy). Hidden from assistive tech;
   * `aria-required` carries the semantics.
   */
  requiredMarker?: ReactNode;
  /** Exactly one form control (library controls read the context automatically). */
  children: ReactNode;
  /** Per-part props: `label`, `description`, `error`. */
  slotProps?: FieldSlotProps;
}
