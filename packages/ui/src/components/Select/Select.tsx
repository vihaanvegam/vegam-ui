'use client';

import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { CSSProperties, KeyboardEvent, MouseEvent } from 'react';
import { useComponentDefaults } from '../../theme/defaultProps';
import { cx } from '../../utils/cx';
import {
  firstEnabledIndex,
  lastEnabledIndex,
  nextEnabledIndex,
  typeAheadIndex,
} from '../../utils/listNavigation';
import { computePopupPlacement } from '../../utils/positioning';
import type { PopupPlacement } from '../../utils/positioning';
import { useIsomorphicLayoutEffect } from '../../utils/useIsomorphicLayoutEffect';
import type { SelectProps } from './Select.types';
import './Select.css';

/** Classes rendered by {@link Select} — the documented override surface. */
export const selectClasses = {
  root: 'ui-select',
  sm: 'ui-select--sm',
  md: 'ui-select--md',
  lg: 'ui-select--lg',
  value: 'ui-select__value',
  valuePlaceholder: 'ui-select__value--placeholder',
  caret: 'ui-select__caret',
  popup: 'ui-select__popup',
  listbox: 'ui-select__listbox',
  option: 'ui-select__option',
  optionActive: 'ui-select__option--active',
  optionSelected: 'ui-select__option--selected',
  optionDisabled: 'ui-select__option--disabled',
} as const;

const TYPE_AHEAD_RESET_MS = 500;
const POPUP_OFFSET_PX = 4;

/**
 * A single-select listbox popup (the APG "select-only combobox" pattern).
 *
 * Works controlled (`value` + `onChange`) and uncontrolled (`defaultValue`).
 * The popup renders in a portal — into the nearest `[data-theme]` wrapper so
 * scoped themes apply to it, falling back to `document.body` — and positions
 * itself below the trigger, flipping above when out of room.
 *
 * Accessibility: the trigger is a native `<button>` with `role="combobox"`,
 * `aria-expanded`, `aria-controls`, and `aria-activedescendant`; focus stays
 * on the trigger the whole time while arrows/Home/End move the active option,
 * printable characters type-ahead by label, Enter/Space commit, Escape and
 * Tab close (per WAI-ARIA APG). Options are `li[role="option"]` with
 * `aria-selected`/`aria-disabled`. Label the control with `aria-label` or
 * `aria-labelledby` via props. The focus ring is a `:focus-visible` outline
 * from the focus tokens; targets reach 44px on coarse pointers.
 */
export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(props, ref) {
  const defaults = useComponentDefaults('Select');
  const {
    options,
    value,
    defaultValue,
    onChange,
    placeholder,
    name,
    size = defaults.size ?? 'md',
    slots,
    slotProps,
    className,
    disabled,
    onKeyDown,
    onClick,
    ...rest
  } = props;

  const listboxId = useId();
  const optionId = (index: number) => `${listboxId}-option-${index}`;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => triggerRef.current as HTMLButtonElement);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [innerValue, setInnerValue] = useState(defaultValue);
  const [placement, setPlacement] = useState<PopupPlacement | null>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : innerValue;
  const selectedIndex = options.findIndex((option) => option.value === currentValue);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const typeAheadRef = useRef<{ buffer: string; timeout: ReturnType<typeof setTimeout> | null }>({
    buffer: '',
    timeout: null,
  });

  const openList = (initialIndex?: number) => {
    const initial =
      initialIndex ?? (selectedIndex >= 0 ? selectedIndex : firstEnabledIndex(options));
    setActiveIndex(initial);
    // Portal into the nearest themed wrapper so a scoped [data-theme] applies
    // to the popup; <html>-level theming falls through to body correctly.
    const themed = triggerRef.current?.closest('[data-theme]');
    setContainer(
      themed && themed !== document.documentElement && themed !== document.body
        ? (themed as HTMLElement)
        : document.body,
    );
    setOpen(true);
  };

  const closeList = () => {
    setOpen(false);
    setPlacement(null);
  };

  const commit = (index: number) => {
    const option = options[index];
    if (!option || option.disabled) return;
    if (!isControlled) setInnerValue(option.value);
    onChange?.(option.value);
    closeList();
  };

  // Position on open and keep tracking while open; the popup exists in the
  // portal by the time this layout effect runs, so its height is measurable.
  useIsomorphicLayoutEffect(() => {
    if (!open) return undefined;
    const update = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      setPlacement(
        computePopupPlacement({
          trigger: rect,
          viewport: { width: window.innerWidth, height: window.innerHeight },
          popupHeight: popupRef.current?.offsetHeight ?? 0,
          offset: POPUP_OFFSET_PX,
        }),
      );
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, options.length]);

  // Dismiss on pointer interaction outside both the trigger and the popup.
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (triggerRef.current?.contains(target) || popupRef.current?.contains(target)) return;
      closeList();
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  // Clear any pending type-ahead reset timer on unmount.
  useEffect(() => {
    const state = typeAheadRef.current;
    return () => {
      if (state.timeout) clearTimeout(state.timeout);
    };
  }, []);

  const typeAhead = (character: string) => {
    const state = typeAheadRef.current;
    state.buffer += character.toLowerCase();
    if (state.timeout) clearTimeout(state.timeout);
    state.timeout = setTimeout(() => {
      state.buffer = '';
    }, TYPE_AHEAD_RESET_MS);
    const from = open ? activeIndex : selectedIndex;
    const match = typeAheadIndex(options, state.buffer, from);
    if (match >= 0) {
      if (open) {
        setActiveIndex(match);
      } else {
        openList(match);
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled) return;

    if (!open) {
      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowUp':
          event.preventDefault();
          openList();
          return;
        case 'Home':
          event.preventDefault();
          openList(firstEnabledIndex(options));
          return;
        case 'End':
          event.preventDefault();
          openList(lastEnabledIndex(options));
          return;
        default:
          break;
      }
      // Enter/Space fall through to the native click, which toggles open.
    } else {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setActiveIndex((index) => nextEnabledIndex(options, index, 1));
          return;
        case 'ArrowUp':
          event.preventDefault();
          setActiveIndex((index) => nextEnabledIndex(options, index, -1));
          return;
        case 'Home':
          event.preventDefault();
          setActiveIndex(firstEnabledIndex(options));
          return;
        case 'End':
          event.preventDefault();
          setActiveIndex(lastEnabledIndex(options));
          return;
        case 'Enter':
        case ' ':
          // preventDefault also suppresses the button's synthetic click.
          event.preventDefault();
          commit(activeIndex);
          return;
        case 'Escape':
          event.preventDefault();
          closeList();
          return;
        case 'Tab':
          closeList();
          return;
        default:
          break;
      }
    }

    // Printable, non-space characters drive label type-ahead (space commits).
    if (event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      typeAhead(event.key);
    }
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || disabled) return;
    if (open) {
      closeList();
    } else {
      openList();
    }
  };

  const OptionSlot = slots?.option;
  const { className: popupClassName, style: popupStyle, ...popupRest } = slotProps?.popup ?? {};
  const { className: listboxClassName, ...listboxRest } = slotProps?.listbox ?? {};
  const { className: optionClassName, ...optionRest } = slotProps?.option ?? {};

  const popupPositionStyle: CSSProperties = placement
    ? {
        top: placement.top,
        left: placement.left,
        minWidth: placement.minWidth,
        maxHeight: placement.maxHeight,
        visibility: 'visible',
      }
    : { top: 0, left: 0, visibility: 'hidden' };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={open && activeIndex >= 0 ? optionId(activeIndex) : undefined}
        disabled={disabled}
        className={cx(selectClasses.root, selectClasses[size], className)}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        {...rest}
      >
        <span
          className={cx(
            selectClasses.value,
            selectedOption === undefined && selectClasses.valuePlaceholder,
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className={selectClasses.caret} aria-hidden="true" />
      </button>
      {name !== undefined ? <input type="hidden" name={name} value={currentValue ?? ''} /> : null}
      {open && container && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={popupRef}
              className={cx(selectClasses.popup, popupClassName)}
              style={{ ...popupPositionStyle, ...popupStyle }}
              {...popupRest}
            >
              <ul
                role="listbox"
                id={listboxId}
                tabIndex={-1}
                className={cx(selectClasses.listbox, listboxClassName)}
                {...listboxRest}
              >
                {options.map((option, index) => (
                  // eslint-disable-next-line jsx-a11y/click-events-have-key-events -- keyboard interaction lives on the combobox trigger (aria-activedescendant pattern per APG); options are never focused
                  <li
                    key={option.value}
                    id={optionId(index)}
                    role="option"
                    aria-selected={option.value === currentValue}
                    aria-disabled={option.disabled || undefined}
                    className={cx(
                      selectClasses.option,
                      index === activeIndex && selectClasses.optionActive,
                      option.value === currentValue && selectClasses.optionSelected,
                      option.disabled && selectClasses.optionDisabled,
                      optionClassName,
                    )}
                    // Keep focus on the combobox trigger (activedescendant pattern).
                    onPointerDown={(event) => event.preventDefault()}
                    onClick={() => commit(index)}
                    onMouseEnter={() => {
                      if (!option.disabled) setActiveIndex(index);
                    }}
                    {...optionRest}
                  >
                    {OptionSlot ? (
                      <OptionSlot
                        option={option}
                        selected={option.value === currentValue}
                        active={index === activeIndex}
                      />
                    ) : (
                      option.label
                    )}
                  </li>
                ))}
              </ul>
            </div>,
            container,
          )
        : null}
    </>
  );
});
