import { createRef, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Input, inputClasses } from './Input';
import type { InputSize } from './Input.types';

describe('Input', () => {
  it('renders a native textbox', () => {
    render(<Input aria-label="Name" />);
    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass(inputClasses.root);
  });

  it('defaults to size md', () => {
    render(<Input aria-label="Name" />);
    expect(screen.getByRole('textbox')).toHaveClass(inputClasses.md);
  });

  it.each<InputSize>(['sm', 'md', 'lg'])('applies the %s size class', (size) => {
    render(<Input aria-label="Name" size={size} />);
    expect(screen.getByRole('textbox')).toHaveClass(inputClasses[size]);
  });

  it('works uncontrolled with defaultValue', async () => {
    const user = userEvent.setup();
    render(<Input aria-label="Name" defaultValue="Ada" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('Ada');
    await user.clear(input);
    await user.type(input, 'Grace');
    expect(input).toHaveValue('Grace');
  });

  it('works controlled with value + onChange', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = useState('a');
      return <Input aria-label="Name" value={value} onChange={(e) => setValue(e.target.value)} />;
    }
    render(<Controlled />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'bc');
    expect(input).toHaveValue('abc');
  });

  it('stays fixed when controlled without state updates', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input aria-label="Name" value="locked" onChange={onChange} />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'x');
    expect(onChange).toHaveBeenCalled();
    expect(input).toHaveValue('locked');
  });

  it('accepts no typing when disabled', async () => {
    const user = userEvent.setup();
    render(<Input aria-label="Name" disabled defaultValue="keep" />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    await user.type(input, 'nope');
    expect(input).toHaveValue('keep');
  });

  it('passes aria-invalid through for the danger styling to key off', () => {
    render(<Input aria-label="Name" aria-invalid="true" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('merges className and spreads rest props onto the input', () => {
    render(<Input aria-label="Name" className="custom" data-testid="field" placeholder="Type…" />);
    const input = screen.getByTestId('field');
    expect(input).toHaveClass(inputClasses.root);
    expect(input).toHaveClass('custom');
    expect(input).toHaveAttribute('placeholder', 'Type…');
  });

  it('forwards its ref to the input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input aria-label="Name" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current).toBe(screen.getByRole('textbox'));
  });

  it('reads its size default from the theme, explicit prop winning', () => {
    render(
      <ThemeProvider componentDefaults={{ Input: { size: 'lg' } }}>
        <Input aria-label="Themed" />
        <Input aria-label="Explicit" size="sm" />
      </ThemeProvider>,
    );
    expect(screen.getByRole('textbox', { name: 'Themed' })).toHaveClass(inputClasses.lg);
    expect(screen.getByRole('textbox', { name: 'Explicit' })).toHaveClass(inputClasses.sm);
  });
});
