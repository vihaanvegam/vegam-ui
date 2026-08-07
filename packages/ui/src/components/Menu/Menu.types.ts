import type { ComponentType, HTMLAttributes, ReactElement, ReactNode } from 'react';
import type { Align, Side } from '../../utils/positioning';

/** One menu entry. Items are DATA (the locked composite pattern). */
export interface MenuItem {
  /** Stable identity, and what `onSelect` receives. */
  value: string;
  /** Visible text. Drives type-ahead, so it must be a string. */
  label: string;
  /** Skipped by arrows and type-ahead, and not selectable. */
  disabled?: boolean;
}

/**
 * Menu semantics for one item. Spread these on the focusable element your
 * slot renders — they carry the role, the roving `tabIndex`, and the
 * activation handlers, and Menu finds items by their `role` to move focus.
 */
export interface MenuItemDomProps {
  role: 'menuitem';
  tabIndex: number;
  'aria-disabled'?: true;
  onClick: () => void;
  onMouseEnter: () => void;
}

/** What {@link MenuSlots.item} receives. */
export interface MenuItemRenderProps {
  item: MenuItem;
  /** True for the roving-focus target. */
  active: boolean;
  /** Pre-merged class name — apply it so states keep their styling. */
  className: string;
  /** MUST be spread on the focusable element (see {@link MenuItemDomProps}). */
  itemProps: MenuItemDomProps;
  children: ReactNode;
}

/** Replaceable parts of {@link Menu}. */
export interface MenuSlots {
  /**
   * Renders one item — the escape hatch for router links or rich content.
   * It must render a focusable element carrying `className` and spreading
   * `itemProps`; no ref is needed, since Menu locates items by role.
   */
  item?: ComponentType<MenuItemRenderProps>;
}

/** Per-part props for {@link Menu}. */
export interface MenuSlotProps {
  /** Props for the floating surface (`role="menu"`). */
  menu?: HTMLAttributes<HTMLDivElement>;
  /** Props applied to every item. */
  item?: HTMLAttributes<HTMLDivElement>;
}

/** Props for {@link Menu}. */
export interface MenuProps {
  /** The trigger. Exactly one focusable element. */
  children: ReactElement;
  /** Menu entries, in order. */
  items: MenuItem[];
  /** Fired with the chosen item's `value`. */
  onSelect?: (value: string) => void;
  /** Accessible name for the menu itself. */
  label: string;
  /** Preferred side; flips when it does not fit. @default 'bottom' */
  side?: Side;
  /** Alignment along that side. @default 'start' */
  align?: Align;
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. @default false */
  defaultOpen?: boolean;
  /** Called whenever the menu wants to open or close. */
  onOpenChange?: (open: boolean) => void;
  /** Replaceable parts. */
  slots?: MenuSlots;
  /** Per-part props. */
  slotProps?: MenuSlotProps;
}
