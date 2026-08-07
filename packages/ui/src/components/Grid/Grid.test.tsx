import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Grid, gridClasses } from './Grid';

const varOf = (el: HTMLElement, name: string) => el.style.getPropertyValue(name);

describe('Grid', () => {
  it('renders a div with children', () => {
    render(<Grid data-testid="grid">content</Grid>);
    const el = screen.getByTestId('grid');
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveClass(gridClasses.root);
    expect(el).toHaveTextContent('content');
  });

  it('emits column and gap vars', () => {
    render(<Grid data-testid="grid" columns={3} gap={4} />);
    const el = screen.getByTestId('grid');
    expect(varOf(el, '--ui-grid-columns-base')).toBe('3');
    expect(varOf(el, '--ui-grid-gap-base')).toBe('var(--ui-space-4)');
  });

  it('emits responsive column vars', () => {
    render(<Grid data-testid="grid" columns={{ base: 1, tablet: 2, desktop: 4 }} />);
    const el = screen.getByTestId('grid');
    expect(varOf(el, '--ui-grid-columns-base')).toBe('1');
    expect(varOf(el, '--ui-grid-columns-tablet')).toBe('2');
    expect(varOf(el, '--ui-grid-columns-desktop')).toBe('4');
    expect(varOf(el, '--ui-grid-columns-laptop')).toBe('');
  });

  it('emits axis gap overrides independently of gap', () => {
    render(<Grid data-testid="grid" gap={2} rowGap={6} columnGap={{ laptop: 8 }} />);
    const el = screen.getByTestId('grid');
    expect(varOf(el, '--ui-grid-gap-base')).toBe('var(--ui-space-2)');
    expect(varOf(el, '--ui-grid-row-gap-base')).toBe('var(--ui-space-6)');
    expect(varOf(el, '--ui-grid-column-gap-laptop')).toBe('var(--ui-space-8)');
  });

  it('honors theme default gap, explicit prop winning', () => {
    render(
      <ThemeProvider componentDefaults={{ Grid: { gap: 6 } }}>
        <Grid data-testid="themed" />
        <Grid data-testid="explicit" gap={2} />
      </ThemeProvider>,
    );
    expect(varOf(screen.getByTestId('themed'), '--ui-grid-gap-base')).toBe('var(--ui-space-6)');
    expect(varOf(screen.getByTestId('explicit'), '--ui-grid-gap-base')).toBe('var(--ui-space-2)');
  });

  it('merges className, spreads rest, forwards ref', () => {
    let node: HTMLDivElement | null = null;
    render(
      <Grid
        ref={(el) => {
          node = el;
        }}
        data-testid="grid"
        className="custom"
        role="list"
      />,
    );
    const el = screen.getByTestId('grid');
    expect(el).toHaveClass(gridClasses.root, 'custom');
    expect(el).toHaveAttribute('role', 'list');
    expect(node).toBeInstanceOf(HTMLDivElement);
  });

  // disabled: N/A — presentational, no interactive state.
});
