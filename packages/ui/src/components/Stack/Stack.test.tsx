import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Stack, stackClasses } from './Stack';
import type { StackGap } from './Stack.types';

// Stack is presentational layout: no interaction or disabled state (noted per
// recipe); variants, ref, className merge, prop spread, theme defaults covered.
describe('Stack', () => {
  it('renders children in a column with gap 4 by default', () => {
    render(
      <Stack data-testid="stack">
        <span>a</span>
        <span>b</span>
      </Stack>,
    );
    const stack = screen.getByTestId('stack');
    expect(stack).toHaveClass(stackClasses.root);
    expect(stack).toHaveClass(stackClasses.column);
    expect(stack).toHaveClass(stackClasses.gap4);
    expect(stack).toHaveTextContent('ab');
  });

  it('applies the row direction class', () => {
    render(<Stack data-testid="stack" direction="row" />);
    expect(screen.getByTestId('stack')).toHaveClass(stackClasses.row);
  });

  it.each<StackGap>([0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16])('applies the gap-%s class', (gap) => {
    render(<Stack data-testid="stack" gap={gap} />);
    expect(screen.getByTestId('stack')).toHaveClass(stackClasses[`gap${gap}`]);
  });

  it('applies align and justify classes only when given', () => {
    render(<Stack data-testid="plain" />);
    const plain = screen.getByTestId('plain');
    expect(plain.className).not.toMatch(/align|justify/);

    render(<Stack data-testid="styled" align="center" justify="between" />);
    const styled = screen.getByTestId('styled');
    expect(styled).toHaveClass(stackClasses.alignCenter);
    expect(styled).toHaveClass(stackClasses.justifyBetween);
  });

  it('merges className and spreads rest props', () => {
    render(<Stack data-testid="stack" className="custom" role="list" />);
    const stack = screen.getByRole('list');
    expect(stack).toHaveClass(stackClasses.root);
    expect(stack).toHaveClass('custom');
  });

  it('forwards its ref to the div element', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Stack ref={ref} data-testid="stack" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(screen.getByTestId('stack'));
  });

  it('reads its gap default from the theme, explicit prop winning', () => {
    render(
      <ThemeProvider componentDefaults={{ Stack: { gap: 8 } }}>
        <Stack data-testid="themed" />
        <Stack data-testid="explicit" gap={1} />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('themed')).toHaveClass(stackClasses.gap8);
    expect(screen.getByTestId('explicit')).toHaveClass(stackClasses.gap1);
  });
});
