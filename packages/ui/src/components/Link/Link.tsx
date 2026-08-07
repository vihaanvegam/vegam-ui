'use client';

import { forwardRef } from 'react';
import { useComponentDefaults } from '../../theme/defaultProps';
import { cx } from '../../utils/cx';
import type { LinkProps } from './Link.types';
import './Link.css';

/** Classes rendered by {@link Link} — the documented override surface. */
export const linkClasses = {
  root: 'ui-link',
  default: 'ui-link--default',
  subtle: 'ui-link--subtle',
  standalone: 'ui-link--standalone',
  newTab: 'ui-link__new-tab',
} as const;

/**
 * A navigational link. Renders a real `<a>` so middle-click, copy-link, and
 * the platform's link semantics all work; `slots.anchor` swaps in a router's
 * link component without losing them (Breadcrumbs' precedent).
 *
 * **Use a link to go somewhere, a Button to do something.** Styling a button
 * as a link (or vice versa) breaks keyboard expectations — Enter vs Space —
 * and history.
 *
 * Accessibility: the accessible name is the link text; make it meaningful on
 * its own ("Pricing", not "click here"), since users navigate by a list of
 * links. `variant="default"` underlines, so colour is never the only cue
 * that text is a link (WCAG 1.4.1). With `external`, `target="_blank"` is
 * paired with `rel="noopener noreferrer"` and the required `newTabLabel` is
 * appended as visually hidden text, so a screen reader announces the tab
 * switch before it happens.
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(props, ref) {
  const defaults = useComponentDefaults('Link');
  const {
    variant = defaults.variant ?? 'default',
    external = false,
    newTabLabel,
    slots,
    className,
    children,
    target,
    rel,
    ...rest
  } = props;

  const Anchor = slots?.anchor ?? 'a';

  const anchorProps = {
    ref,
    className: cx(linkClasses.root, linkClasses[variant], className),
    // noopener blocks the opened page from touching window.opener; noreferrer
    // is paired with it as the conventional safe default.
    target: target ?? (external ? '_blank' : undefined),
    rel: rel ?? (external ? 'noopener noreferrer' : undefined),
    ...rest,
  };

  return (
    <Anchor {...anchorProps}>
      {children}
      {/* The separator is its own text node, NOT whitespace inside the span:
          the accessible-name algorithm trims each element's text, so a
          leading space in there is dropped and the name concatenates as
          "Docsopens in a new tab". */}
      {external && newTabLabel ? (
        <>
          {' '}
          <span className={linkClasses.newTab}>{newTabLabel}</span>
        </>
      ) : null}
    </Anchor>
  );
});
