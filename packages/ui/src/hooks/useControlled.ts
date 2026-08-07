'use client';

import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

/**
 * Controlled/uncontrolled state for a prop pair — the pattern behind
 * `value`/`defaultValue` (Select) and `collapsed`/`defaultCollapsed`
 * (Breadcrumbs), and the required mechanism for every future pair
 * (BLUEPRINT §5: "controlled + uncontrolled via `useControlled` wherever
 * state exists").
 *
 * `controlled !== undefined` selects controlled mode, matching the component
 * convention that an explicit prop takes over entirely. Returns the resolved
 * value, the uncontrolled-state setter, and the mode flag. Component
 * convention at a change site:
 *
 * ```ts
 * if (!isControlled) setUncontrolledValue(next);
 * onChange?.(next);
 * ```
 *
 * The mode is expected to stay fixed for a component's lifetime — switching
 * mid-life silently changes which state wins, exactly like a native input
 * flipping between controlled and uncontrolled.
 */
export function useControlled<T>(
  controlled: T | undefined,
  defaultValue: T | (() => T),
): readonly [T, Dispatch<SetStateAction<T>>, boolean] {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const isControlled = controlled !== undefined;
  return [isControlled ? controlled : uncontrolled, setUncontrolled, isControlled];
}
