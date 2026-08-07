import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Skeleton, skeletonClasses } from './Skeleton';

describe('Skeleton', () => {
  it('renders a hidden text placeholder by default', () => {
    const { container } = render(<Skeleton />);
    const el = container.querySelector(`.${skeletonClasses.root}`) as HTMLElement;
    expect(el).toHaveClass(skeletonClasses.text);
    // Always decoration — placeholder boxes must never be announced.
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });

  it.each(['text', 'rect', 'circle'] as const)('applies the %s variant class', (variant) => {
    const { container } = render(<Skeleton variant={variant} />);
    expect(container.querySelector(`.${skeletonClasses.root}`)).toHaveClass(
      skeletonClasses[variant],
    );
  });

  it('maps size props to custom properties', () => {
    const { container } = render(
      <Skeleton variant="rect" width="10rem" height="4rem" radius="lg" />,
    );
    const el = container.querySelector(`.${skeletonClasses.root}`) as HTMLElement;
    expect(el.style.getPropertyValue('--ui-skeleton-width')).toBe('10rem');
    expect(el.style.getPropertyValue('--ui-skeleton-height')).toBe('4rem');
    expect(el.style.getPropertyValue('--ui-skeleton-radius')).toBe('var(--ui-radius-lg)');
  });

  it('renders a hidden group of lines for multi-line text', () => {
    const { container } = render(<Skeleton lines={3} />);
    const group = container.querySelector(`.${skeletonClasses.group}`) as HTMLElement;
    expect(group).toHaveAttribute('aria-hidden', 'true');
    expect(group.querySelectorAll(`.${skeletonClasses.root}`)).toHaveLength(3);
  });

  it('does not group a single line', () => {
    const { container } = render(<Skeleton lines={1} />);
    expect(container.querySelector(`.${skeletonClasses.group}`)).toBeNull();
  });

  it('lines only apply to the text variant', () => {
    const { container } = render(<Skeleton variant="rect" lines={3} />);
    expect(container.querySelector(`.${skeletonClasses.group}`)).toBeNull();
  });

  it('honors the theme default variant, explicit winning', () => {
    const { container } = render(
      <ThemeProvider componentDefaults={{ Skeleton: { variant: 'circle' } }}>
        <Skeleton data-testid="themed" />
        <Skeleton data-testid="explicit" variant="rect" />
      </ThemeProvider>,
    );
    const [themed, explicit] = container.querySelectorAll(`.${skeletonClasses.root}`);
    expect(themed).toHaveClass(skeletonClasses.circle);
    expect(explicit).toHaveClass(skeletonClasses.rect);
  });

  it('merges className and forwards ref', () => {
    let node: HTMLSpanElement | null = null;
    const { container } = render(
      <Skeleton
        ref={(el) => {
          node = el;
        }}
        className="custom"
      />,
    );
    expect(container.querySelector(`.${skeletonClasses.root}`)).toHaveClass('custom');
    expect(node).toBeInstanceOf(HTMLSpanElement);
  });

  // disabled: N/A — presentational, no interactive state.
});
