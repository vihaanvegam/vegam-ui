import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Badge, badgeClasses } from './Badge';
import type { BadgeTone } from './Badge.types';

// Badge is presentational: no interaction or disabled state (noted per recipe);
// variants, ref, className merge, prop spread, and theme defaults are covered.
describe('Badge', () => {
  it('renders its children in a span', () => {
    render(<Badge>New</Badge>);
    const badge = screen.getByText('New');
    expect(badge.tagName).toBe('SPAN');
    expect(badge).toHaveClass(badgeClasses.root);
  });

  it('defaults to the neutral tone', () => {
    render(<Badge>x</Badge>);
    expect(screen.getByText('x')).toHaveClass(badgeClasses.neutral);
  });

  it.each<BadgeTone>(['neutral', 'info', 'success', 'warning', 'danger'])(
    'applies the %s tone class',
    (tone) => {
      render(<Badge tone={tone}>x</Badge>);
      expect(screen.getByText('x')).toHaveClass(badgeClasses[tone]);
    },
  );

  it('merges className and spreads rest props', () => {
    render(
      <Badge className="custom" data-testid="badge" title="status">
        x
      </Badge>,
    );
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass(badgeClasses.root);
    expect(badge).toHaveClass('custom');
    expect(badge).toHaveAttribute('title', 'status');
  });

  it('forwards its ref to the span element', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Badge ref={ref}>x</Badge>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current).toBe(screen.getByText('x'));
  });

  it('reads its tone default from the theme, explicit prop winning', () => {
    render(
      <ThemeProvider componentDefaults={{ Badge: { tone: 'success' } }}>
        <Badge>themed</Badge>
        <Badge tone="danger">explicit</Badge>
      </ThemeProvider>,
    );
    expect(screen.getByText('themed')).toHaveClass(badgeClasses.success);
    expect(screen.getByText('explicit')).toHaveClass(badgeClasses.danger);
  });
});
