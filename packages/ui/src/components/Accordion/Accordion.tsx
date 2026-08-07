'use client';

import { createElement, forwardRef, useId } from 'react';
import { useControlled } from '../../hooks/useControlled';
import { cx } from '../../utils/cx';
import type { AccordionProps } from './Accordion.types';
import './Accordion.css';

/** Classes rendered by {@link Accordion} — the documented override surface. */
export const accordionClasses = {
  root: 'ui-accordion',
  item: 'ui-accordion__item',
  header: 'ui-accordion__header',
  trigger: 'ui-accordion__trigger',
  indicator: 'ui-accordion__indicator',
  panel: 'ui-accordion__panel',
} as const;

const toArray = (value: string | string[] | undefined): string[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

/**
 * Stacked disclosure sections (the WAI-ARIA APG accordion pattern). Items
 * are data. `multiple` switches between one-open and many-open, which also
 * changes the shape of `value`/`onChange` (a string vs an array).
 *
 * Works controlled (`value` + `onChange`) and uncontrolled (`defaultValue`).
 *
 * Accessibility: each header is a real heading (`headingLevel`, default
 * `h3` — pick the level that fits the surrounding outline) wrapping a native
 * `<button>` carrying `aria-expanded` and `aria-controls`; the panel is
 * `role="region"` labelled by its trigger. Deliberately NO arrow-key
 * navigation: the APG marks it optional, and headers are already reachable
 * via Tab and via the screen-reader heading list, so adding it would only
 * diverge from native disclosure behaviour. A collapsed panel is unmounted,
 * so its content is out of the tab order entirely.
 */
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(props, ref) {
  const {
    items,
    multiple = false,
    value,
    defaultValue,
    onChange,
    headingLevel = 3,
    slotProps,
    className,
    ...rest
  } = props;

  const baseId = useId();
  const [current, setUncontrolled, isControlled] = useControlled<string | string[] | undefined>(
    value,
    defaultValue ?? (multiple ? [] : undefined),
  );
  const expanded = toArray(current);

  const toggle = (itemValue: string) => {
    const isOpen = expanded.includes(itemValue);
    const next: string | string[] = multiple
      ? isOpen
        ? expanded.filter((v) => v !== itemValue)
        : [...expanded, itemValue]
      : isOpen
        ? ''
        : itemValue;
    if (!isControlled) setUncontrolled(next);
    onChange?.(next);
  };

  const { className: itemClassName, ...itemRest } = slotProps?.item ?? {};
  const { className: headerClassName, ...headerRest } = slotProps?.header ?? {};
  const { className: triggerClassName, ...triggerRest } = slotProps?.trigger ?? {};
  const { className: panelClassName, ...panelRest } = slotProps?.panel ?? {};

  return (
    <div ref={ref} className={cx(accordionClasses.root, className)} {...rest}>
      {items.map((item, index) => {
        const isOpen = expanded.includes(item.value);
        const triggerId = `${baseId}-trigger-${index}`;
        const panelId = `${baseId}-panel-${index}`;
        return (
          <div key={item.value} className={cx(accordionClasses.item, itemClassName)} {...itemRest}>
            {createElement(
              `h${headingLevel}`,
              {
                className: cx(accordionClasses.header, headerClassName),
                ...headerRest,
              },
              <button
                type="button"
                id={triggerId}
                aria-expanded={isOpen}
                aria-controls={isOpen ? panelId : undefined}
                disabled={item.disabled}
                onClick={() => toggle(item.value)}
                className={cx(accordionClasses.trigger, triggerClassName)}
                {...triggerRest}
              >
                {item.label}
                <span aria-hidden="true" className={accordionClasses.indicator} />
              </button>,
            )}
            {isOpen ? (
              <div
                role="region"
                id={panelId}
                aria-labelledby={triggerId}
                className={cx(accordionClasses.panel, panelClassName)}
                {...panelRest}
              >
                {item.content}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
});
