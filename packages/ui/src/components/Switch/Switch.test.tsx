import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Field } from '../Field';
import { Switch, switchClasses } from './Switch';

describe('Switch', () => {
  it('renders a native checkbox with role switch', () => {
    render(<Switch aria-label="Notifications" />);
    const el = screen.getByRole('switch');
    expect(el).toBeInstanceOf(HTMLInputElement);
    expect(el).toHaveAttribute('type', 'checkbox');
    expect(el).toHaveClass(switchClasses.root);
    expect(el).not.toBeChecked();
  });

  it('toggles uncontrolled from defaultChecked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Switch aria-label="n" defaultChecked onChange={onChange} />);
    const el = screen.getByRole('switch');
    expect(el).toBeChecked();
    await user.click(el);
    expect(el).not.toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('controlled: checked follows the prop', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<Switch aria-label="n" checked={false} onChange={onChange} />);
    const el = screen.getByRole('switch');
    await user.click(el);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(el).not.toBeChecked();
    rerender(<Switch aria-label="n" checked onChange={onChange} />);
    expect(el).toBeChecked();
  });

  it('space toggles via the keyboard', async () => {
    const user = userEvent.setup();
    render(<Switch aria-label="n" />);
    const el = screen.getByRole('switch');
    el.focus();
    await user.keyboard(' ');
    expect(el).toBeChecked();
  });

  it('disabled is inert', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Switch aria-label="n" disabled onChange={onChange} />);
    const el = screen.getByRole('switch');
    expect(el).toBeDisabled();
    await user.click(el);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('wires up inside a Field, explicit props winning', () => {
    render(
      <Field label="Notifications" description="Email me" disabled>
        <Switch />
      </Field>,
    );
    const el = screen.getByLabelText('Notifications');
    expect(el).toBeDisabled();
    expect(el).toHaveAttribute('aria-describedby');
  });

  it('merges className, spreads rest, forwards ref', () => {
    let node: HTMLInputElement | null = null;
    render(
      <Switch
        ref={(el) => {
          node = el;
        }}
        aria-label="n"
        className="custom"
        data-testid="sw"
      />,
    );
    expect(screen.getByTestId('sw')).toHaveClass(switchClasses.root, 'custom');
    expect(node).toBeInstanceOf(HTMLInputElement);
  });
});
