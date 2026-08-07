import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

/** One disclosure section. */
export interface AccordionItem {
  /** Stable identity, and what the expansion callbacks report. */
  value: string;
  /** Header content — the button's accessible name. */
  label: ReactNode;
  /** Panel content. */
  content: ReactNode;
  /** Not expandable. */
  disabled?: boolean;
}

/** Per-part props for {@link Accordion}. */
export interface AccordionSlotProps {
  item?: HTMLAttributes<HTMLDivElement>;
  header?: HTMLAttributes<HTMLHeadingElement>;
  /** Button attributes, so `type`/`form`/`name` type-check. */
  trigger?: ButtonHTMLAttributes<HTMLButtonElement>;
  panel?: HTMLAttributes<HTMLDivElement>;
}

/** Props for {@link Accordion}. */
export interface AccordionProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
  /** Sections in order. */
  items: AccordionItem[];
  /**
   * Allow several sections open at once. Changes the shape of `value`:
   * a single string when false, an array when true.
   * @default false
   */
  multiple?: boolean;
  /** Controlled expansion. */
  value?: string | string[];
  /** Initial expansion when uncontrolled. */
  defaultValue?: string | string[];
  /** Expansion change — receives the new value in the same shape. */
  onChange?: (value: string | string[]) => void;
  /**
   * Heading level the section headers render at (`h2`…`h6`). Pick the one
   * that fits the surrounding document outline. @default 3
   */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Per-part props. */
  slotProps?: AccordionSlotProps;
}
