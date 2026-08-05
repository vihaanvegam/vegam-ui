import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Button, buttonClasses } from './Button';
import type { ButtonSize, ButtonVariant } from './Button.types';

describe('Button', () => {
  it('renders its children in a native button', () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass(buttonClasses.root);
  });

  it('defaults to variant primary, size md, type button', () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass(buttonClasses.primary);
    expect(button).toHaveClass(buttonClasses.md);
    expect(button).toHaveAttribute('type', 'button');
  });

  it.each<ButtonVariant>(['primary', 'secondary', 'danger', 'ghost'])(
    'applies the %s variant class',
    (variant) => {
      render(<Button variant={variant}>x</Button>);
      expect(screen.getByRole('button')).toHaveClass(buttonClasses[variant]);
    },
  );

  it.each<ButtonSize>(['sm', 'md', 'lg'])('applies the %s size class', (size) => {
    render(<Button size={size}>x</Button>);
    expect(screen.getByRole('button')).toHaveClass(buttonClasses[size]);
  });

  it('fires onClick on activation', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('supports keyboard activation via the native element', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Go
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('merges className and spreads rest props onto the root element', () => {
    render(
      <Button className="custom" data-testid="btn">
        x
      </Button>,
    );
    const button = screen.getByTestId('btn');
    expect(button).toHaveClass(buttonClasses.root);
    expect(button).toHaveClass('custom');
  });

  it('forwards its ref to the button element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>x</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toBe(screen.getByRole('button'));
  });

  it('allows overriding type for form submission', () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('reads variant and size defaults from the theme', () => {
    render(
      <ThemeProvider componentDefaults={{ Button: { variant: 'danger', size: 'lg' } }}>
        <Button>x</Button>
      </ThemeProvider>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass(buttonClasses.danger);
    expect(button).toHaveClass(buttonClasses.lg);
  });

  it('lets explicit props beat theme defaults', () => {
    render(
      <ThemeProvider componentDefaults={{ Button: { variant: 'danger' } }}>
        <Button variant="ghost">x</Button>
      </ThemeProvider>,
    );
    expect(screen.getByRole('button')).toHaveClass(buttonClasses.ghost);
  });
});
