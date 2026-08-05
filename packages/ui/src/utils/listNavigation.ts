/**
 * Framework-free list navigation for listbox-style widgets (no React here —
 * these are pure functions over plain data, called from component hooks).
 */

export interface NavigableItem {
  disabled?: boolean;
}

export interface TypeAheadItem extends NavigableItem {
  label: string;
}

/** Index of the first enabled item, or -1 when every item is disabled. */
export function firstEnabledIndex(items: readonly NavigableItem[]): number {
  return items.findIndex((item) => !item.disabled);
}

/** Index of the last enabled item, or -1 when every item is disabled. */
export function lastEnabledIndex(items: readonly NavigableItem[]): number {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (!items[index]?.disabled) return index;
  }
  return -1;
}

/**
 * The next enabled index stepping by `delta` from `from` (exclusive).
 * Does not wrap (per the APG listbox pattern); returns `from` unchanged when
 * there is nothing further in that direction.
 */
export function nextEnabledIndex(
  items: readonly NavigableItem[],
  from: number,
  delta: 1 | -1,
): number {
  for (let index = from + delta; index >= 0 && index < items.length; index += delta) {
    if (!items[index]?.disabled) return index;
  }
  return from;
}

/**
 * First enabled index whose label starts with `query` (case-insensitive),
 * searching forward from `from + 1` and wrapping around; -1 when nothing
 * matches.
 */
export function typeAheadIndex(
  items: readonly TypeAheadItem[],
  query: string,
  from: number,
): number {
  if (items.length === 0 || query.length === 0) return -1;
  const needle = query.toLowerCase();
  for (let step = 1; step <= items.length; step += 1) {
    const index = (from + step + items.length) % items.length;
    const item = items[index];
    if (item && !item.disabled && item.label.toLowerCase().startsWith(needle)) {
      return index;
    }
  }
  return -1;
}
