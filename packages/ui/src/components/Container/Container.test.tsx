import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Container, containerClasses } from './Container';
import type { ContainerSize } from './Container.types';

describe('Container', () => {
  it('renders a div with children and the desktop cap by default', () => {
    render(<Container data-testid="container">content</Container>);
    const el = screen.getByTestId('container');
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveClass(containerClasses.root, containerClasses.desktop);
    expect(el).toHaveTextContent('content');
  });

  it('renders the element given by as', () => {
    render(
      <Container as="main" data-testid="container">
        x
      </Container>,
    );
    expect(screen.getByTestId('container').tagName).toBe('MAIN');
  });

  it.each(['tablet', 'laptop', 'desktop', 'wide'] as ContainerSize[])(
    'applies the %s size class',
    (size) => {
      render(<Container data-testid="container" size={size} />);
      expect(screen.getByTestId('container')).toHaveClass(containerClasses[size]);
    },
  );

  it('honors theme default size, explicit prop winning', () => {
    render(
      <ThemeProvider componentDefaults={{ Container: { size: 'laptop' } }}>
        <Container data-testid="themed" />
        <Container data-testid="explicit" size="wide" />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('themed')).toHaveClass(containerClasses.laptop);
    expect(screen.getByTestId('explicit')).toHaveClass(containerClasses.wide);
  });

  it('merges className, spreads rest, forwards ref', () => {
    let node: HTMLElement | null = null;
    render(
      <Container
        ref={(el) => {
          node = el;
        }}
        data-testid="container"
        className="custom"
        aria-label="page"
      />,
    );
    const el = screen.getByTestId('container');
    expect(el).toHaveClass(containerClasses.root, 'custom');
    expect(el).toHaveAttribute('aria-label', 'page');
    expect(node).toBeInstanceOf(HTMLDivElement);
  });

  // disabled: N/A — presentational, no interactive state.
});
