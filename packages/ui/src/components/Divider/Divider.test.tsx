import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Divider, dividerClasses } from './Divider';

describe('Divider', () => {
  it('renders an hr with the horizontal class by default', () => {
    render(<Divider data-testid="divider" />);
    const el = screen.getByTestId('divider');
    expect(el.tagName).toBe('HR');
    expect(el).toHaveClass(dividerClasses.root, dividerClasses.horizontal);
    // Native hr carries the implicit separator role.
    expect(screen.getByRole('separator')).toBe(el);
  });

  it('renders a vertical separator div with aria-orientation', () => {
    render(<Divider data-testid="divider" orientation="vertical" />);
    const el = screen.getByTestId('divider');
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveClass(dividerClasses.vertical);
    expect(el).toHaveAttribute('role', 'separator');
    expect(el).toHaveAttribute('aria-orientation', 'vertical');
  });

  it.each([
    ['subtle', dividerClasses.subtle],
    ['accent', dividerClasses.accent],
  ] as const)('applies the %s tone class', (tone, className) => {
    render(<Divider data-testid="divider" tone={tone} />);
    expect(screen.getByTestId('divider')).toHaveClass(className);
  });

  it("the 'default' tone adds no modifier class", () => {
    render(<Divider data-testid="divider" tone="default" />);
    const el = screen.getByTestId('divider');
    expect(el.className).not.toContain(dividerClasses.subtle);
    expect(el.className).not.toContain(dividerClasses.accent);
  });

  it('honors theme default tone, explicit prop winning', () => {
    render(
      <ThemeProvider componentDefaults={{ Divider: { tone: 'subtle' } }}>
        <Divider data-testid="themed" />
        <Divider data-testid="explicit" tone="accent" />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('themed')).toHaveClass(dividerClasses.subtle);
    expect(screen.getByTestId('explicit')).toHaveClass(dividerClasses.accent);
  });

  it('merges className, spreads rest, forwards ref', () => {
    let node: HTMLElement | null = null;
    render(
      <Divider
        ref={(el) => {
          node = el;
        }}
        data-testid="divider"
        className="custom"
        aria-hidden="true"
      />,
    );
    const el = screen.getByTestId('divider');
    expect(el).toHaveClass(dividerClasses.root, 'custom');
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(node).toBeInstanceOf(HTMLHRElement);
  });

  // disabled: N/A — presentational, no interactive state.
});
