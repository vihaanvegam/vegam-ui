import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Card, cardClasses } from './Card';
import type { CardVariant } from './Card.types';

// Card is presentational: no interaction or disabled state (noted per recipe);
// variants, ref, className merge, prop spread, and theme defaults are covered.
describe('Card', () => {
  it('renders its children', () => {
    render(<Card data-testid="card">content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveTextContent('content');
    expect(card).toHaveClass(cardClasses.root);
  });

  it('defaults to outlined variant with md padding', () => {
    render(<Card data-testid="card">x</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass(cardClasses.outlined);
    expect(card).toHaveClass(cardClasses.paddingMd);
  });

  it.each<CardVariant>(['outlined', 'elevated'])('applies the %s variant class', (variant) => {
    render(
      <Card data-testid="card" variant={variant}>
        x
      </Card>,
    );
    expect(screen.getByTestId('card')).toHaveClass(cardClasses[variant]);
  });

  it.each([
    ['none', cardClasses.paddingNone],
    ['sm', cardClasses.paddingSm],
    ['md', cardClasses.paddingMd],
    ['lg', cardClasses.paddingLg],
  ] as const)('applies the %s padding class', (padding, className) => {
    render(
      <Card data-testid="card" padding={padding}>
        x
      </Card>,
    );
    expect(screen.getByTestId('card')).toHaveClass(className);
  });

  it('merges className and spreads rest props', () => {
    render(
      <Card data-testid="card" className="custom" role="region" aria-label="Panel">
        x
      </Card>,
    );
    const card = screen.getByRole('region', { name: 'Panel' });
    expect(card).toHaveClass(cardClasses.root);
    expect(card).toHaveClass('custom');
  });

  it('forwards its ref to the div element', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Card ref={ref} data-testid="card">
        x
      </Card>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(screen.getByTestId('card'));
  });

  it('reads defaults from the theme, explicit props winning', () => {
    render(
      <ThemeProvider componentDefaults={{ Card: { variant: 'elevated', padding: 'lg' } }}>
        <Card data-testid="themed">x</Card>
        <Card data-testid="explicit" variant="outlined">
          x
        </Card>
      </ThemeProvider>,
    );
    const themed = screen.getByTestId('themed');
    expect(themed).toHaveClass(cardClasses.elevated);
    expect(themed).toHaveClass(cardClasses.paddingLg);
    expect(screen.getByTestId('explicit')).toHaveClass(cardClasses.outlined);
  });
});
