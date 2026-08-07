import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { buttonClasses } from '../Button/Button';
import { IconButton, iconButtonClasses } from './IconButton';

const glyph = <svg aria-hidden="true" viewBox="0 0 16 16" data-testid="glyph" />;

describe('IconButton', () => {
  it('renders a named button with the composed Button classes', () => {
    render(<IconButton aria-label="Close">{glyph}</IconButton>);
    const button = screen.getByRole('button', { name: 'Close' });
    expect(button).toHaveClass(
      buttonClasses.root,
      buttonClasses.ghost,
      buttonClasses.md,
      iconButtonClasses.root,
      iconButtonClasses.md,
    );
    expect(screen.getByTestId('glyph')).toBeInTheDocument();
  });

  it('defaults type to button', () => {
    render(<IconButton aria-label="x">{glyph}</IconButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it.each(['primary', 'secondary', 'danger', 'ghost'] as const)(
    'applies the %s variant class',
    (variant) => {
      render(
        <IconButton aria-label="x" variant={variant}>
          {glyph}
        </IconButton>,
      );
      expect(screen.getByRole('button')).toHaveClass(buttonClasses[variant]);
    },
  );

  it.each(['sm', 'md', 'lg'] as const)('applies the %s size classes', (size) => {
    render(
      <IconButton aria-label="x" size={size}>
        {glyph}
      </IconButton>,
    );
    expect(screen.getByRole('button')).toHaveClass(buttonClasses[size], iconButtonClasses[size]);
  });

  it('fires click, stays inert when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(
      <IconButton aria-label="x" onClick={onClick}>
        {glyph}
      </IconButton>,
    );
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(
      <IconButton aria-label="x" onClick={onClick} disabled>
        {glyph}
      </IconButton>,
    );
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('honors theme defaults, explicit props winning', () => {
    render(
      <ThemeProvider componentDefaults={{ IconButton: { variant: 'primary', size: 'lg' } }}>
        <IconButton aria-label="themed">{glyph}</IconButton>
        <IconButton aria-label="explicit" variant="danger" size="sm">
          {glyph}
        </IconButton>
      </ThemeProvider>,
    );
    expect(screen.getByRole('button', { name: 'themed' })).toHaveClass(
      buttonClasses.primary,
      buttonClasses.lg,
    );
    expect(screen.getByRole('button', { name: 'explicit' })).toHaveClass(
      buttonClasses.danger,
      buttonClasses.sm,
    );
  });

  it('merges className, spreads rest, forwards ref', () => {
    let node: HTMLButtonElement | null = null;
    render(
      <IconButton
        ref={(el) => {
          node = el;
        }}
        aria-label="x"
        className="custom"
        data-testid="ib"
      >
        {glyph}
      </IconButton>,
    );
    expect(screen.getByTestId('ib')).toHaveClass('custom');
    expect(node).toBeInstanceOf(HTMLButtonElement);
  });
});
