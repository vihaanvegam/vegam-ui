'use client';

import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useComponentDefaults } from '../../theme/defaultProps';
import { useControlled } from '../../hooks/useControlled';
import { useRovingFocus } from '../../hooks/useRovingFocus';
import { cx } from '../../utils/cx';
import { firstEnabledIndex } from '../../utils/listNavigation';
import type { TabsProps } from './Tabs.types';
import './Tabs.css';

/** Classes rendered by {@link Tabs} — the documented override surface. */
export const tabsClasses = {
  root: 'ui-tabs',
  vertical: 'ui-tabs--vertical',
  list: 'ui-tabs__list',
  tab: 'ui-tabs__tab',
  tabSelected: 'ui-tabs__tab--selected',
  panel: 'ui-tabs__panel',
} as const;

/**
 * Tabbed panels (the WAI-ARIA APG tabs pattern). Items are data — each
 * carries its label and its panel content, and only the selected panel is
 * rendered.
 *
 * Works controlled (`value` + `onChange`) and uncontrolled (`defaultValue`,
 * falling back to the first enabled tab).
 *
 * Accessibility: `role="tablist"` (named by `label`) containing
 * `role="tab"` buttons wired to their `role="tabpanel"` via `aria-controls`
 * / `aria-labelledby`, with `aria-selected` on the selected tab. Focus uses
 * **roving tabindex** — only the selected/active tab is tabbable, so Tab
 * enters the tablist once and then moves on to the panel. Arrows move along
 * the orientation and WRAP (the APG tabs behaviour, unlike Menu/Select which
 * deliberately stop at the ends); Home/End jump. With `activation="automatic"`
 * (the default) arrowing selects as it moves; `manual` moves focus only and
 * Enter/Space selects — use it when rendering a panel is expensive. The
 * panel is `tabIndex={0}` so keyboard users can reach its content directly.
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(props, ref) {
  const defaults = useComponentDefaults('Tabs');
  const {
    items,
    value,
    defaultValue,
    onChange,
    orientation = defaults.orientation ?? 'horizontal',
    activation = defaults.activation ?? 'automatic',
    label,
    slotProps,
    className,
    'aria-labelledby': ariaLabelledBy,
    ...rest
  } = props;

  const baseId = useId();
  const [list, setList] = useState<HTMLDivElement | null>(null);

  const firstEnabled = items[firstEnabledIndex(items)]?.value;
  const [selected, setUncontrolled, isControlled] = useControlled(
    value,
    defaultValue ?? firstEnabled,
  );

  // Fall back to the first ENABLED tab whenever the stored value matches no
  // item, or matches a disabled one. That covers items arriving
  // ASYNCHRONOUSLY (the uncontrolled default is captured on the first render,
  // when the list is still empty), a selected tab being removed, and a
  // `defaultValue` pointing at a disabled tab — each of which would otherwise
  // leave the widget with no tabbable tab and no panel, stranding keyboard
  // users. Display-only: it never calls onChange, so a controlled owner is
  // never fought.
  const storedIndex = items.findIndex((item) => item.value === selected);
  const selectedIndex =
    storedIndex >= 0 && !items[storedIndex]?.disabled ? storedIndex : firstEnabledIndex(items);

  const { activeIndex, setActiveIndex, handleNavigationKey } = useRovingFocus({
    items,
    // Safe to leave on: with no active item (the initial state) the hook
    // focuses nothing, so mounting a Tabs never rips focus from the page —
    // `focusContainerWhenInactive` stays off, unlike Menu.
    active: true,
    container: list,
    itemSelector: '[role="tab"]',
    orientation: orientation === 'vertical' ? 'vertical' : 'horizontal',
    // The APG tabs pattern wraps at the ends.
    loop: true,
  });

  // In automatic mode, moving the active tab selects it.
  //
  // The ref is load-bearing: the effect's deps include `items` and `onChange`,
  // which are fresh identities on every render for the usual inline usage. If
  // a CONTROLLED owner declines or defers the change, `item.value === selected`
  // never becomes true, so without this guard the effect would re-fire
  // onChange on every subsequent render — an unbounded loop. Selection is a
  // user action, so it must fire exactly once per active-tab move.
  const lastActivatedRef = useRef(-1);
  useEffect(() => {
    if (activation !== 'automatic') return;
    if (activeIndex < 0 || activeIndex === lastActivatedRef.current) return;
    lastActivatedRef.current = activeIndex;
    const item = items[activeIndex];
    if (!item || item.disabled || item.value === selected) return;
    if (!isControlled) setUncontrolled(item.value);
    onChange?.(item.value);
  }, [activation, activeIndex, items, selected, isControlled, setUncontrolled, onChange]);

  const select = (index: number) => {
    const item = items[index];
    if (!item || item.disabled) return;
    setActiveIndex(index);
    if (item.value === selected) return;
    if (!isControlled) setUncontrolled(item.value);
    onChange?.(item.value);
  };

  const onListKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (handleNavigationKey(event)) return;
    if (activation === 'manual' && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      select(activeIndex);
    }
  };

  const { className: listClassName, ...listRest } = slotProps?.list ?? {};
  const { className: tabClassName, ...tabRest } = slotProps?.tab ?? {};
  const { className: panelClassName, ...panelRest } = slotProps?.panel ?? {};

  const tabId = (index: number) => `${baseId}-tab-${index}`;
  const panelId = (index: number) => `${baseId}-panel-${index}`;
  const current = selectedIndex >= 0 ? items[selectedIndex] : undefined;

  return (
    <div
      ref={ref}
      className={cx(
        tabsClasses.root,
        orientation === 'vertical' && tabsClasses.vertical,
        className,
      )}
      {...rest}
    >
      <div
        ref={setList}
        role="tablist"
        aria-label={ariaLabelledBy ? undefined : label}
        aria-labelledby={ariaLabelledBy}
        aria-orientation={orientation}
        // Programmatically focusable, never tabbable: the keyboard contract
        // lives on the tabs (roving tabindex), and events bubble from them
        // to this handler. Matches Menu's surface.
        tabIndex={-1}
        onKeyDown={onListKeyDown}
        className={cx(tabsClasses.list, listClassName)}
        {...listRest}
      >
        {items.map((item, index) => {
          const isSelected = index === selectedIndex;
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              id={tabId(index)}
              aria-selected={isSelected}
              aria-controls={isSelected ? panelId(index) : undefined}
              // Roving tabindex: exactly one tab is in the tab order, and it
              // is the selected one until the user arrows elsewhere.
              tabIndex={(activeIndex >= 0 ? index === activeIndex : isSelected) ? 0 : -1}
              disabled={item.disabled}
              onClick={() => select(index)}
              onFocus={() => setActiveIndex(index)}
              className={cx(tabsClasses.tab, isSelected && tabsClasses.tabSelected, tabClassName)}
              {...tabRest}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {current ? (
        <div
          role="tabpanel"
          id={panelId(selectedIndex)}
          aria-labelledby={tabId(selectedIndex)}
          tabIndex={0}
          className={cx(tabsClasses.panel, panelClassName)}
          {...panelRest}
        >
          {current.content}
        </div>
      ) : null}
    </div>
  );
});
