import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Flex, flexClasses } from './Flex';

const varOf = (el: HTMLElement, name: string) => el.style.getPropertyValue(name);

describe('Flex', () => {
  it('renders a div with children', () => {
    render(<Flex data-testid="flex">content</Flex>);
    const el = screen.getByTestId('flex');
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveClass(flexClasses.root);
    expect(el).toHaveTextContent('content');
  });

  it('emits container vars, mapping align/justify shorthands to CSS keywords', () => {
    render(
      <Flex
        data-testid="flex"
        direction="column"
        wrap="wrap"
        align="center"
        justify="between"
        gap={4}
      />,
    );
    const el = screen.getByTestId('flex');
    expect(varOf(el, '--ui-flex-direction-base')).toBe('column');
    expect(varOf(el, '--ui-flex-wrap-base')).toBe('wrap');
    expect(varOf(el, '--ui-flex-align-base')).toBe('center');
    expect(varOf(el, '--ui-flex-justify-base')).toBe('space-between');
    expect(varOf(el, '--ui-flex-gap-base')).toBe('var(--ui-space-4)');
  });

  it('emits per-breakpoint vars for responsive props', () => {
    render(<Flex data-testid="flex" direction={{ base: 'column', laptop: 'row' }} />);
    const el = screen.getByTestId('flex');
    expect(varOf(el, '--ui-flex-direction-base')).toBe('column');
    expect(varOf(el, '--ui-flex-direction-laptop')).toBe('row');
    expect(varOf(el, '--ui-flex-direction-tablet')).toBe('');
  });

  it('emits item vars for grow/shrink/basis', () => {
    render(<Flex data-testid="flex" grow={1} shrink={0} basis={10} />);
    const el = screen.getByTestId('flex');
    expect(varOf(el, '--ui-flex-grow')).toBe('1');
    expect(varOf(el, '--ui-flex-shrink')).toBe('0');
    expect(varOf(el, '--ui-flex-basis')).toBe('var(--ui-space-10)');
  });

  it("basis 'auto' stays a keyword", () => {
    render(<Flex data-testid="flex" basis="auto" />);
    expect(varOf(screen.getByTestId('flex'), '--ui-flex-basis')).toBe('auto');
  });

  it('honors theme default gap, explicit prop winning', () => {
    render(
      <ThemeProvider componentDefaults={{ Flex: { gap: 6 } }}>
        <Flex data-testid="themed" />
        <Flex data-testid="explicit" gap={2} />
      </ThemeProvider>,
    );
    expect(varOf(screen.getByTestId('themed'), '--ui-flex-gap-base')).toBe('var(--ui-space-6)');
    expect(varOf(screen.getByTestId('explicit'), '--ui-flex-gap-base')).toBe('var(--ui-space-2)');
  });

  it('merges className, spreads rest, forwards ref', () => {
    let node: HTMLDivElement | null = null;
    render(
      <Flex
        ref={(el) => {
          node = el;
        }}
        data-testid="flex"
        className="custom"
        aria-label="row"
      />,
    );
    const el = screen.getByTestId('flex');
    expect(el).toHaveClass(flexClasses.root, 'custom');
    expect(el).toHaveAttribute('aria-label', 'row');
    expect(node).toBeInstanceOf(HTMLDivElement);
  });

  // disabled: N/A — presentational, no interactive state.
});
