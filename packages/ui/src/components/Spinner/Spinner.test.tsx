import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Spinner, spinnerClasses } from './Spinner';

describe('Spinner', () => {
  it('is a labelled status region when given a label', () => {
    render(<Spinner label="Loading" />);
    const el = screen.getByRole('status');
    expect(el).toHaveClass(spinnerClasses.root, spinnerClasses.md);
    expect(el).toHaveTextContent('Loading');
  });

  it('is hidden decoration without a label', () => {
    const { container } = render(<Spinner />);
    const el = container.querySelector(`.${spinnerClasses.root}`);
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('treats an empty label as unlabelled', () => {
    render(<Spinner label="" />);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it.each(['sm', 'md', 'lg'] as const)('applies the %s size class', (size) => {
    render(<Spinner label="x" size={size} />);
    expect(screen.getByRole('status')).toHaveClass(spinnerClasses[size]);
  });

  it('honors the theme default size, explicit winning', () => {
    render(
      <ThemeProvider componentDefaults={{ Spinner: { size: 'lg' } }}>
        <Spinner label="themed" />
        <Spinner label="explicit" size="sm" />
      </ThemeProvider>,
    );
    expect(screen.getByText('themed').parentElement).toHaveClass(spinnerClasses.lg);
    expect(screen.getByText('explicit').parentElement).toHaveClass(spinnerClasses.sm);
  });

  it('merges className, spreads rest, forwards ref', () => {
    let node: HTMLSpanElement | null = null;
    render(
      <Spinner
        ref={(el) => {
          node = el;
        }}
        label="x"
        className="custom"
        data-testid="sp"
      />,
    );
    expect(screen.getByTestId('sp')).toHaveClass(spinnerClasses.root, 'custom');
    expect(node).toBeInstanceOf(HTMLSpanElement);
  });

  // disabled: N/A — presentational, no interactive state.
});
