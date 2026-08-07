import type { HTMLAttributes } from 'react';

/** Avatar diameters. */
export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

/** Silhouette. */
export type AvatarShape = 'circle' | 'square';

/** Props for {@link Avatar}. */
export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Image URL. Falls back to initials (then `children`) if it fails to load. */
  src?: string;
  /**
   * The person or entity's name. Used to derive initials AND as the image's
   * `alt`. Required for a meaningful avatar; omit only for decoration, which
   * renders `aria-hidden`.
   */
  name?: string;
  /** Diameter. @default 'md' (themeable) */
  size?: AvatarSize;
  /** Silhouette. @default 'circle' (themeable) */
  shape?: AvatarShape;
  /**
   * Overrides the derived initials. Keep to 1–2 characters — more will not
   * fit at small sizes.
   */
  initials?: string;
  /** Final fallback when there is no `src` and no `name` (e.g. an icon). */
  children?: React.ReactNode;
}
