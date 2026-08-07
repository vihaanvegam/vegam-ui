'use client';

import { forwardRef, useEffect, useState } from 'react';
import { useComponentDefaults } from '../../theme/defaultProps';
import { cx } from '../../utils/cx';
import type { AvatarProps } from './Avatar.types';
import './Avatar.css';

/** Classes rendered by {@link Avatar} — the documented override surface. */
export const avatarClasses = {
  root: 'ui-avatar',
  circle: 'ui-avatar--circle',
  square: 'ui-avatar--square',
  sm: 'ui-avatar--sm',
  md: 'ui-avatar--md',
  lg: 'ui-avatar--lg',
  xl: 'ui-avatar--xl',
  image: 'ui-avatar__image',
} as const;

/**
 * Derives up to two initials from a name: first and last word, so
 * "Ada Lovelace" gives "AL" and "Ada" gives "A". Uses `Intl.Segmenter` when
 * available so a multi-code-unit grapheme (an emoji, a combining mark, a
 * surrogate pair) is not sliced in half; falls back to the spread operator,
 * which is at least code-point aware unlike `charAt`.
 */
function deriveInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  const first = (head: string) => {
    if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
      const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
      const [segment] = segmenter.segment(head);
      return segment ? segment.segment : '';
    }
    return [...head][0] ?? '';
  };
  const initials =
    words.length === 1
      ? first(words[0] as string)
      : first(words[0] as string) + first(words[words.length - 1] as string);
  return initials.toUpperCase();
}

/**
 * A person or entity's picture, falling back to initials and then to
 * `children`. The library ships no default icon — supply one as `children`
 * if you want a generic placeholder.
 *
 * Accessibility: with a `name`, the image carries it as `alt` and the
 * initials fallback is announced as text, so the identity survives a broken
 * image. Without a `name` the avatar is decorative and `aria-hidden`, which
 * is correct **only when the name is already adjacent in the UI** (a row
 * showing the name next to the picture) — otherwise the person is invisible
 * to assistive tech. A failed image load swaps to initials automatically.
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(props, ref) {
  const defaults = useComponentDefaults('Avatar');
  const {
    src,
    name,
    size = defaults.size ?? 'md',
    shape = defaults.shape ?? 'circle',
    initials,
    className,
    children,
    ...rest
  } = props;

  const [failed, setFailed] = useState(false);
  // A new src deserves a fresh attempt.
  useEffect(() => setFailed(false), [src]);

  const text = initials ?? (name ? deriveInitials(name) : '');
  const showImage = Boolean(src) && !failed;

  return (
    <span
      ref={ref}
      aria-hidden={name ? undefined : 'true'}
      className={cx(avatarClasses.root, avatarClasses[shape], avatarClasses[size], className)}
      {...rest}
    >
      {showImage ? (
        <img
          className={avatarClasses.image}
          src={src}
          alt={name ?? ''}
          onError={() => setFailed(true)}
        />
      ) : (
        text || children
      )}
    </span>
  );
});
