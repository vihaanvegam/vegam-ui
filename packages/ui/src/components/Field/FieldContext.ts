'use client';

import { createContext, useContext } from 'react';

/** What a {@link Field} provides to the single control it wraps. */
export interface FieldContextValue {
  /** id for the control — the field label's `htmlFor` points here. */
  controlId: string;
  /** id of the rendered label — group controls reference it via `aria-labelledby`. */
  labelId: string;
  /** Space-joined ids of the description/error paragraphs currently rendered. */
  describedBy?: string;
  /** True while the field shows an error — controls mirror it as `aria-invalid`. */
  invalid: boolean;
  /** Field-level required — controls mirror it as `aria-required`. */
  required: boolean;
  /** Field-level disabled — controls disable themselves. */
  disabled: boolean;
}

export const FieldContext = createContext<FieldContextValue | null>(null);

/**
 * The nearest Field's wiring, or `null` outside one. Library controls consume
 * it automatically with explicit props always winning; a custom control can
 * do the same:
 *
 * ```tsx
 * const field = useField();
 * <input
 *   id={field?.controlId}
 *   aria-describedby={field?.describedBy}
 *   aria-invalid={field?.invalid || undefined}
 * />;
 * ```
 */
export function useField(): FieldContextValue | null {
  return useContext(FieldContext);
}
