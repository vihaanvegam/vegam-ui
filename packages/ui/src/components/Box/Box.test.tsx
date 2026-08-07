import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Box, boxClasses } from './Box';

const varOf = (el: HTMLElement, name: string) => el.style.getPropertyValue(name);

describe('Box', () => {
  it('renders a div with children by default', () => {
    render(<Box data-testid="box">content</Box>);
    const el = screen.getByTestId('box');
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveTextContent('content');
    expect(el).toHaveClass(boxClasses.root);
  });

  it('renders the element given by as', () => {
    render(
      <Box as="section" data-testid="box">
        x
      </Box>,
    );
    expect(screen.getByTestId('box').tagName).toBe('SECTION');
  });

  it('emits base custom properties for scalar props', () => {
    render(<Box data-testid="box" p={4} bg="subtle" radius="md" shadow="sm" />);
    const el = screen.getByTestId('box');
    expect(varOf(el, '--ui-box-pt-base')).toBe('var(--ui-space-4)');
    expect(varOf(el, '--ui-box-pb-base')).toBe('var(--ui-space-4)');
    expect(varOf(el, '--ui-box-pl-base')).toBe('var(--ui-space-4)');
    expect(varOf(el, '--ui-box-pr-base')).toBe('var(--ui-space-4)');
    expect(varOf(el, '--ui-box-bg-base')).toBe('var(--ui-color-surface-subtle)');
    expect(varOf(el, '--ui-box-radius-base')).toBe('var(--ui-radius-md)');
    expect(varOf(el, '--ui-box-shadow-base')).toBe('var(--ui-elevation-sm)');
  });

  it('maps the sub-grid steps to dashed var names', () => {
    render(<Box data-testid="box" p={0.5} />);
    expect(varOf(screen.getByTestId('box'), '--ui-box-pt-base')).toBe('var(--ui-space-0-5)');
  });

  it('resolves side > axis > all precedence per side', () => {
    render(<Box data-testid="box" p={4} py={2} pt={1} />);
    const el = screen.getByTestId('box');
    expect(varOf(el, '--ui-box-pt-base')).toBe('var(--ui-space-1)');
    expect(varOf(el, '--ui-box-pb-base')).toBe('var(--ui-space-2)');
    expect(varOf(el, '--ui-box-pl-base')).toBe('var(--ui-space-4)');
    expect(varOf(el, '--ui-box-pr-base')).toBe('var(--ui-space-4)');
  });

  it('emits per-breakpoint vars for responsive values, deduping inherited steps', () => {
    render(<Box data-testid="box" m={{ base: 2, laptop: 8 }} pt={{ tablet: 4 }} />);
    const el = screen.getByTestId('box');
    expect(varOf(el, '--ui-box-mt-base')).toBe('var(--ui-space-2)');
    expect(varOf(el, '--ui-box-mt-tablet')).toBe('');
    expect(varOf(el, '--ui-box-mt-laptop')).toBe('var(--ui-space-8)');
    expect(varOf(el, '--ui-box-mt-desktop')).toBe('');
    expect(varOf(el, '--ui-box-pt-base')).toBe('');
    expect(varOf(el, '--ui-box-pt-tablet')).toBe('var(--ui-space-4)');
  });

  it('mixes precedence with responsiveness per breakpoint', () => {
    render(<Box data-testid="box" p={{ base: 4 }} pt={{ laptop: 1 }} />);
    const el = screen.getByTestId('box');
    expect(varOf(el, '--ui-box-pt-base')).toBe('var(--ui-space-4)');
    expect(varOf(el, '--ui-box-pt-laptop')).toBe('var(--ui-space-1)');
    expect(varOf(el, '--ui-box-pb-base')).toBe('var(--ui-space-4)');
    expect(varOf(el, '--ui-box-pb-laptop')).toBe('');
  });

  it('draws a border only when borderColor is set', () => {
    const { rerender } = render(<Box data-testid="box" />);
    expect(screen.getByTestId('box')).not.toHaveClass(boxClasses.bordered);
    rerender(<Box data-testid="box" borderColor="default" />);
    const el = screen.getByTestId('box');
    expect(el).toHaveClass(boxClasses.bordered);
    expect(varOf(el, '--ui-box-border-color-base')).toBe('var(--ui-color-border-default)');
  });

  it('merges className and keeps consumer style entries', () => {
    render(<Box data-testid="box" p={2} className="custom" style={{ color: 'red' }} />);
    const el = screen.getByTestId('box');
    expect(el).toHaveClass(boxClasses.root, 'custom');
    expect(el.style.color).toBe('red');
    expect(varOf(el, '--ui-box-pt-base')).toBe('var(--ui-space-2)');
  });

  it('spreads rest props and forwards the ref', () => {
    let node: HTMLElement | null = null;
    render(
      <Box
        ref={(el) => {
          node = el;
        }}
        data-testid="box"
        aria-label="panel"
      />,
    );
    expect(screen.getByTestId('box')).toHaveAttribute('aria-label', 'panel');
    expect(node).toBeInstanceOf(HTMLDivElement);
  });

  // disabled: N/A — presentational, no interactive state.
});
