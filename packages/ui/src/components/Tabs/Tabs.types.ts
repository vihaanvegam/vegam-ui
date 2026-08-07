import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

/** One tab and its panel. Items are DATA (the locked composite pattern). */
export interface TabItem {
  /** Stable identity, and what `onChange` reports. */
  value: string;
  /** Visible tab label. */
  label: ReactNode;
  /** Panel content. Only the selected tab's panel is rendered. */
  content?: ReactNode;
  /** Skipped by arrows and not selectable. */
  disabled?: boolean;
}

/** Tablist axis. */
export type TabsOrientation = 'horizontal' | 'vertical';

/**
 * How arrow keys relate to selection (WAI-ARIA APG):
 * `automatic` selects the tab focus lands on — right when panels are cheap;
 * `manual` moves focus only, and Enter/Space selects. Use `manual` when
 * showing a panel is expensive.
 */
export type TabsActivation = 'automatic' | 'manual';

/** Per-part props for {@link Tabs}. */
export interface TabsSlotProps {
  /** Props for the `role="tablist"` element. */
  list?: HTMLAttributes<HTMLDivElement>;
  /** Props applied to every tab. Button attributes, so `type`/`form` fit. */
  tab?: ButtonHTMLAttributes<HTMLButtonElement>;
  /** Props for the `role="tabpanel"` element. */
  panel?: HTMLAttributes<HTMLDivElement>;
}

/** Props for {@link Tabs}. */
export interface TabsProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
  /** Tabs in order. */
  items: TabItem[];
  /** Controlled selected value. */
  value?: string;
  /** Initial selected value when uncontrolled. @default the first enabled tab */
  defaultValue?: string;
  /** Selection change — receives the newly selected tab's `value`. */
  onChange?: (value: string) => void;
  /** Tablist axis. @default 'horizontal' (themeable) */
  orientation?: TabsOrientation;
  /** Arrow-key selection behaviour. @default 'automatic' (themeable) */
  activation?: TabsActivation;
  /** Accessible name for the tablist. Required when no `aria-labelledby`. */
  label?: string;
  /** Per-part props. */
  slotProps?: TabsSlotProps;
}
