import { createRef, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Checkbox, checkboxClasses } from './Checkbox';
import type { CheckboxSize } from './Checkbox.types';

describe('Checkbox', () => {
  it('renders a native checkbox', () => {
    render(<Checkbox aria-label="Accept" />);
    const checkbox = screen.getByRole('checkbox', { name: 'Accept' });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveClass(checkboxClasses.root);
    expect(checkbox).toHaveAttribute('type', 'checkbox');
  });

  it('defaults to size md', () => {
    render(<Checkbox aria-label="Accept" />);
    expect(screen.getByRole('checkbox')).toHaveClass(checkboxClasses.md);
  });

  it.each<CheckboxSize>(['sm', 'md', 'lg'])('applies the %s size class', (size) => {
    render(<Checkbox aria-label="Accept" size={size} />);
    expect(screen.getByRole('checkbox')).toHaveClass(checkboxClasses[size]);
  });

  it('toggles uncontrolled from defaultChecked', async () => {
    const user = userEvent.setup();
    render(<Checkbox aria-label="Accept" defaultChecked />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('toggles with the keyboard (Space)', async () => {
    const user = userEvent.setup();
    render(<Checkbox aria-label="Accept" />);
    const checkbox = screen.getByRole('checkbox');
    await user.tab();
    expect(checkbox).toHaveFocus();
    await user.keyboard(' ');
    expect(checkbox).toBeChecked();
  });

  it('works controlled with checked + onChange', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [checked, setChecked] = useState(false);
      return (
        <Checkbox
          aria-label="Accept"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
      );
    }
    render(<Controlled />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('stays fixed when controlled without state updates', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox aria-label="Accept" checked={false} onChange={onChange} />);
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    expect(onChange).toHaveBeenCalled();
    expect(checkbox).not.toBeChecked();
  });

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup();
    render(<Checkbox aria-label="Accept" disabled />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('applies and clears the indeterminate DOM property', () => {
    const { rerender } = render(<Checkbox aria-label="Accept" indeterminate />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBePartiallyChecked();
    rerender(<Checkbox aria-label="Accept" />);
    expect(checkbox).not.toBePartiallyChecked();
  });

  it('merges className and spreads rest props', () => {
    render(<Checkbox aria-label="Accept" className="custom" data-testid="cb" name="tos" />);
    const checkbox = screen.getByTestId('cb');
    expect(checkbox).toHaveClass(checkboxClasses.root);
    expect(checkbox).toHaveClass('custom');
    expect(checkbox).toHaveAttribute('name', 'tos');
  });

  it('forwards its ref to the input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox aria-label="Accept" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current).toBe(screen.getByRole('checkbox'));
  });

  it('reads its size default from the theme, explicit prop winning', () => {
    render(
      <ThemeProvider componentDefaults={{ Checkbox: { size: 'lg' } }}>
        <Checkbox aria-label="Themed" />
        <Checkbox aria-label="Explicit" size="sm" />
      </ThemeProvider>,
    );
    expect(screen.getByRole('checkbox', { name: 'Themed' })).toHaveClass(checkboxClasses.lg);
    expect(screen.getByRole('checkbox', { name: 'Explicit' })).toHaveClass(checkboxClasses.sm);
  });
});
