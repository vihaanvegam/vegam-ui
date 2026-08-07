import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Field } from '../Field';
import { Radio, radioClasses } from './Radio';
import { RadioGroup } from './RadioGroup';

const options = (
  <>
    <label>
      <Radio value="a" data-testid="a" /> Alpha
    </label>
    <label>
      <Radio value="b" data-testid="b" /> Beta
    </label>
  </>
);

describe('Radio', () => {
  it('renders a native radio with the drawn classes', () => {
    render(<Radio aria-label="solo" />);
    const el = screen.getByRole('radio');
    expect(el).toBeInstanceOf(HTMLInputElement);
    expect(el).toHaveAttribute('type', 'radio');
    expect(el).toHaveClass(radioClasses.root, radioClasses.md);
  });

  it.each(['sm', 'md', 'lg'] as const)('applies the %s size class', (size) => {
    render(<Radio aria-label="r" size={size} />);
    expect(screen.getByRole('radio')).toHaveClass(radioClasses[size]);
  });

  it('honors theme default size, explicit winning', () => {
    render(
      <ThemeProvider componentDefaults={{ Radio: { size: 'lg' } }}>
        <Radio aria-label="themed" />
        <Radio aria-label="explicit" size="sm" />
      </ThemeProvider>,
    );
    expect(screen.getByLabelText('themed')).toHaveClass(radioClasses.lg);
    expect(screen.getByLabelText('explicit')).toHaveClass(radioClasses.sm);
  });

  it('forwards ref and merges className', () => {
    let node: HTMLInputElement | null = null;
    render(
      <Radio
        ref={(el) => {
          node = el;
        }}
        aria-label="r"
        className="custom"
      />,
    );
    expect(screen.getByRole('radio')).toHaveClass(radioClasses.root, 'custom');
    expect(node).toBeInstanceOf(HTMLInputElement);
  });
});

describe('RadioGroup', () => {
  it('shares a generated name and reflects defaultValue', () => {
    render(<RadioGroup defaultValue="b">{options}</RadioGroup>);
    const a = screen.getByTestId('a');
    const b = screen.getByTestId('b');
    expect(a).toHaveAttribute('name');
    expect(a.getAttribute('name')).toBe(b.getAttribute('name'));
    expect(b).toBeChecked();
    expect(a).not.toBeChecked();
  });

  it('uncontrolled: clicking selects and reports the value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <RadioGroup defaultValue="a" onChange={onChange}>
        {options}
      </RadioGroup>,
    );
    await user.click(screen.getByTestId('b'));
    expect(onChange).toHaveBeenCalledWith('b');
    expect(screen.getByTestId('b')).toBeChecked();
    expect(screen.getByTestId('a')).not.toBeChecked();
  });

  it('controlled: value prop wins and updates follow it', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <RadioGroup value="a" onChange={onChange}>
        {options}
      </RadioGroup>,
    );
    await user.click(screen.getByTestId('b'));
    expect(onChange).toHaveBeenCalledWith('b');
    // Still 'a' until the owner re-renders with the new value.
    expect(screen.getByTestId('a')).toBeChecked();
    rerender(
      <RadioGroup value="b" onChange={onChange}>
        {options}
      </RadioGroup>,
    );
    expect(screen.getByTestId('b')).toBeChecked();
  });

  it('disables every radio in the group', () => {
    render(<RadioGroup disabled>{options}</RadioGroup>);
    expect(screen.getByTestId('a')).toBeDisabled();
    expect(screen.getByTestId('b')).toBeDisabled();
  });

  it('passes size down; explicit radio size wins', () => {
    render(
      <RadioGroup size="lg">
        <Radio value="a" data-testid="inherits" />
        <Radio value="b" data-testid="explicit" size="sm" />
      </RadioGroup>,
    );
    expect(screen.getByTestId('inherits')).toHaveClass(radioClasses.lg);
    expect(screen.getByTestId('explicit')).toHaveClass(radioClasses.sm);
  });

  it('wires up inside a Field via aria attributes on the group', () => {
    render(
      <Field label="Plan" description="Pick one" error="Required" required>
        <RadioGroup defaultValue="a">{options}</RadioGroup>
      </Field>,
    );
    const group = screen.getByRole('radiogroup', { name: 'Plan' });
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(group).toHaveAttribute('aria-required', 'true');
    expect(group.getAttribute('aria-describedby')?.split(' ')).toHaveLength(2);
  });

  it('spreads rest and forwards ref', () => {
    let node: HTMLDivElement | null = null;
    render(
      <RadioGroup
        ref={(el) => {
          node = el;
        }}
        aria-label="g"
        data-testid="group"
        className="custom"
      >
        {options}
      </RadioGroup>,
    );
    expect(screen.getByTestId('group')).toHaveClass('custom');
    expect(node).toBeInstanceOf(HTMLDivElement);
  });
});
