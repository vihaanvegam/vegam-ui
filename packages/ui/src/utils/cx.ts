/**
 * Joins class names, skipping falsy values.
 *
 * The library's own components use this to merge a consumer's `className`
 * with their `ui-*` classes; it is exported for consumers who want to do
 * the same.
 */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
