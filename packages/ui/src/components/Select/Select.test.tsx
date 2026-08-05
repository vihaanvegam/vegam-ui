import { createRef, useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Select, selectClasses } from './Select';
import type { SelectOption } from './Select.types';

const FRUIT: SelectOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
  { value: 'date', label: 'Date' },
];

function getTrigger(name = 'Fruit') {
  return screen.getByRole('combobox', { name });
}

describe('Select', () => {
  it('renders a combobox trigger with the placeholder', () => {
    render(<Select aria-label="Fruit" options={FRUIT} placeholder="Pick one" />);
    const trigger = getTrigger();
    expect(trigger).toHaveTextContent('Pick one');
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveClass(selectClasses.root);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it.each(['sm', 'md', 'lg'] as const)('applies the %s size class', (size) => {
    render(<Select aria-label="Fruit" options={FRUIT} size={size} />);
    expect(getTrigger()).toHaveClass(selectClasses[size]);
  });

  it('opens on click and renders the listbox in a portal on document.body', async () => {
    const user = userEvent.setup();
    render(<Select aria-label="Fruit" options={FRUIT} />);
    await user.click(getTrigger());
    const listbox = screen.getByRole('listbox');
    expect(getTrigger()).toHaveAttribute('aria-expanded', 'true');
    expect(within(listbox).getAllByRole('option')).toHaveLength(4);
    expect(listbox.closest(`.${selectClasses.popup}`)?.parentElement).toBe(document.body);
  });

  it('selects an option by click, closes, and reports the value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select aria-label="Fruit" options={FRUIT} onChange={onChange} />);
    await user.click(getTrigger());
    await user.click(screen.getByRole('option', { name: 'Banana' }));
    expect(onChange).toHaveBeenCalledWith('banana');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(getTrigger()).toHaveTextContent('Banana');
  });

  it('opens with ArrowDown and moves the active option with the arrows', async () => {
    const user = userEvent.setup();
    render(<Select aria-label="Fruit" options={FRUIT} />);
    const trigger = getTrigger();
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    // No selection yet → active starts on the first enabled option.
    expect(trigger).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Apple' }).id,
    );
    await user.keyboard('{ArrowDown}');
    expect(trigger).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Banana' }).id,
    );
    // Cherry is disabled — ArrowDown skips straight to Date.
    await user.keyboard('{ArrowDown}');
    expect(trigger).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Date' }).id,
    );
    // No wrap past the end.
    await user.keyboard('{ArrowDown}');
    expect(trigger).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Date' }).id,
    );
  });

  it('commits the active option with Enter and returns focus state to the trigger', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select aria-label="Fruit" options={FRUIT} onChange={onChange} />);
    getTrigger().focus();
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalledWith('banana');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(getTrigger()).toHaveFocus();
    expect(getTrigger()).toHaveTextContent('Banana');
  });

  it('supports Home and End for first/last enabled option', async () => {
    const user = userEvent.setup();
    render(<Select aria-label="Fruit" options={FRUIT} defaultValue="banana" />);
    const trigger = getTrigger();
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{End}');
    expect(trigger).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Date' }).id,
    );
    await user.keyboard('{Home}');
    expect(trigger).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Apple' }).id,
    );
  });

  it('type-ahead moves to the matching label, skipping disabled options', async () => {
    const user = userEvent.setup();
    render(<Select aria-label="Fruit" options={FRUIT} />);
    getTrigger().focus();
    await user.keyboard('{ArrowDown}');
    await user.keyboard('d');
    expect(getTrigger()).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Date' }).id,
    );
    // 'c' only matches disabled Cherry — active option must not move to it.
    await user.keyboard('c');
    expect(getTrigger()).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Date' }).id,
    );
  });

  it('closes on Escape without selecting', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select aria-label="Fruit" options={FRUIT} onChange={onChange} />);
    getTrigger().focus();
    await user.keyboard('{ArrowDown}{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('closes when clicking outside', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Select aria-label="Fruit" options={FRUIT} />
        <button>elsewhere</button>
      </div>,
    );
    await user.click(getTrigger());
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'elsewhere' }));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('does not open when disabled', async () => {
    const user = userEvent.setup();
    render(<Select aria-label="Fruit" options={FRUIT} disabled />);
    expect(getTrigger()).toBeDisabled();
    await user.click(getTrigger());
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('does not commit a disabled option', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select aria-label="Fruit" options={FRUIT} onChange={onChange} />);
    await user.click(getTrigger());
    await user.click(screen.getByRole('option', { name: 'Cherry' }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('works uncontrolled via defaultValue', () => {
    render(<Select aria-label="Fruit" options={FRUIT} defaultValue="date" />);
    expect(getTrigger()).toHaveTextContent('Date');
  });

  it('works controlled: displays the value prop and stays put without updates', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [fruit, setFruit] = useState('apple');
      return <Select aria-label="Fruit" options={FRUIT} value={fruit} onChange={setFruit} />;
    }
    render(<Controlled />);
    expect(getTrigger()).toHaveTextContent('Apple');
    await user.click(getTrigger());
    await user.click(screen.getByRole('option', { name: 'Date' }));
    expect(getTrigger()).toHaveTextContent('Date');
  });

  it('marks the selected option with aria-selected', async () => {
    const user = userEvent.setup();
    render(<Select aria-label="Fruit" options={FRUIT} defaultValue="banana" />);
    await user.click(getTrigger());
    expect(screen.getByRole('option', { name: 'Banana', selected: true })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Apple', selected: false })).toBeInTheDocument();
  });

  it('renders a hidden form input when name is given', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Select aria-label="Fruit" options={FRUIT} name="fruit" defaultValue="apple" />,
    );
    const hidden = container.querySelector('input[type="hidden"][name="fruit"]');
    expect(hidden).toHaveValue('apple');
    await user.click(getTrigger());
    await user.click(screen.getByRole('option', { name: 'Date' }));
    expect(hidden).toHaveValue('date');
  });

  it('merges className and spreads rest props onto the trigger', () => {
    render(<Select aria-label="Fruit" options={FRUIT} className="custom" data-testid="sel" />);
    const trigger = screen.getByTestId('sel');
    expect(trigger).toHaveClass(selectClasses.root);
    expect(trigger).toHaveClass('custom');
  });

  it('forwards its ref to the trigger button', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Select aria-label="Fruit" options={FRUIT} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toBe(getTrigger());
  });

  it('renders a custom option slot with render props', async () => {
    const user = userEvent.setup();
    render(
      <Select
        aria-label="Fruit"
        options={FRUIT}
        defaultValue="apple"
        slots={{
          option: ({ option, selected }) => (
            <span data-testid={`slot-${option.value}`}>
              {option.label}
              {selected ? ' ✓' : ''}
            </span>
          ),
        }}
      />,
    );
    await user.click(getTrigger());
    expect(screen.getByTestId('slot-apple')).toHaveTextContent('Apple ✓');
    expect(screen.getByTestId('slot-banana')).toHaveTextContent('Banana');
  });

  it('merges slotProps onto popup, listbox, and options', async () => {
    const user = userEvent.setup();
    render(
      <Select
        aria-label="Fruit"
        options={FRUIT}
        slotProps={{
          popup: { className: 'popup-extra' },
          listbox: { className: 'listbox-extra' },
          option: { className: 'option-extra' },
        }}
      />,
    );
    await user.click(getTrigger());
    const popup = screen.getByRole('listbox').closest(`.${selectClasses.popup}`);
    expect(popup).toHaveClass('popup-extra');
    const listbox = screen.getByRole('listbox');
    expect(listbox).toHaveClass(selectClasses.listbox);
    expect(listbox).toHaveClass('listbox-extra');
    for (const option of screen.getAllByRole('option')) {
      expect(option).toHaveClass(selectClasses.option);
      expect(option).toHaveClass('option-extra');
    }
  });

  it('portals into the nearest [data-theme] wrapper when inside a ThemeProvider', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider colorScheme="dark" data-testid="theme">
        <Select aria-label="Fruit" options={FRUIT} />
      </ThemeProvider>,
    );
    await user.click(getTrigger());
    const popup = screen.getByRole('listbox').closest(`.${selectClasses.popup}`);
    expect(popup?.parentElement).toBe(screen.getByTestId('theme'));
  });

  it('reads its size default from the theme, explicit prop winning', () => {
    render(
      <ThemeProvider componentDefaults={{ Select: { size: 'lg' } }}>
        <Select aria-label="Themed" options={FRUIT} />
        <Select aria-label="Explicit" options={FRUIT} size="sm" />
      </ThemeProvider>,
    );
    expect(screen.getByRole('combobox', { name: 'Themed' })).toHaveClass(selectClasses.lg);
    expect(screen.getByRole('combobox', { name: 'Explicit' })).toHaveClass(selectClasses.sm);
  });
});
