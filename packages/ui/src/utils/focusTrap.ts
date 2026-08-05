// Framework-free focus-trap helpers (no React types here).
// Used by Modal to keep Tab/Shift+Tab cycling inside an open dialog.

/**
 * Selector for elements that can receive keyboard focus. Deliberately the
 * conservative, widely-agreed set — anything exotic (contenteditable hosts,
 * audio/video with controls) can opt in via tabindex.
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]',
  '[contenteditable="true"]',
].join(',');

/**
 * All keyboard-tabbable elements inside `root`, in DOM order.
 *
 * Filters out negative tabindex and `aria-hidden` subtrees. Visibility is NOT
 * checked (offsetParent is unreliable under test DOMs and adds layout reads);
 * hide untabbable content with `disabled`/`tabindex="-1"`/`aria-hidden`.
 */
export function getTabbables(root: Element): HTMLElement[] {
  const candidates = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  return candidates.filter(
    (el) =>
      el.tabIndex >= 0 &&
      el.getAttribute('aria-hidden') !== 'true' &&
      !el.closest('[aria-hidden="true"]'),
  );
}

/**
 * Where focus must move to keep a Tab keypress inside `root`, or null when
 * the browser's default move already stays inside.
 *
 * Returns the first tabbable when tabbing forward from the last one (or from
 * outside `root`), the last when tabbing backward from the first, and `root`
 * itself as a fallback when nothing inside is tabbable.
 */
export function nextTrapTarget(
  root: HTMLElement,
  active: Element | null,
  backwards: boolean,
): HTMLElement | null {
  const tabbables = getTabbables(root);
  const first = tabbables[0];
  const last = tabbables[tabbables.length - 1];
  if (first === undefined || last === undefined) return root;
  const inside = active !== null && root.contains(active);
  if (!inside) return backwards ? last : first;
  if (!backwards && active === last) return first;
  if (backwards && active === first) return last;
  return null;
}
