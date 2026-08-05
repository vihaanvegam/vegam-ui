import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider, themeClasses } from './ThemeProvider';
import { useComponentDefaults } from './defaultProps';
import type { ThemeComponentDefaults } from './defaultProps';

function ShowDefaults({ component }: { component: keyof ThemeComponentDefaults }) {
  const defaults = useComponentDefaults(component);
  return <span data-testid={`defaults-${component}`}>{JSON.stringify(defaults)}</span>;
}

describe('ThemeProvider', () => {
  it('renders its children', () => {
    render(
      <ThemeProvider>
        <button>child</button>
      </ThemeProvider>,
    );
    expect(screen.getByRole('button', { name: 'child' })).toBeInTheDocument();
  });

  it('renders no data-theme attribute when colorScheme is omitted', () => {
    render(<ThemeProvider data-testid="theme">x</ThemeProvider>);
    expect(screen.getByTestId('theme')).not.toHaveAttribute('data-theme');
  });

  it('renders data-theme for the chosen color scheme', () => {
    render(
      <ThemeProvider colorScheme="dark" data-testid="theme">
        x
      </ThemeProvider>,
    );
    const wrapper = screen.getByTestId('theme');
    expect(wrapper).toHaveAttribute('data-theme', 'dark');
    expect(wrapper).toHaveClass(themeClasses.root);
  });

  it('merges className instead of replacing it', () => {
    render(
      <ThemeProvider className="custom" data-testid="theme">
        x
      </ThemeProvider>,
    );
    const wrapper = screen.getByTestId('theme');
    expect(wrapper).toHaveClass(themeClasses.root);
    expect(wrapper).toHaveClass('custom');
  });

  it('spreads remaining props onto the wrapper element', () => {
    render(
      <ThemeProvider data-testid="theme" lang="en">
        x
      </ThemeProvider>,
    );
    expect(screen.getByTestId('theme')).toHaveAttribute('lang', 'en');
  });

  it('forwards its ref to the wrapper element', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ThemeProvider ref={ref} data-testid="theme">
        x
      </ThemeProvider>,
    );
    expect(ref.current).toBe(screen.getByTestId('theme'));
  });
});

describe('useComponentDefaults', () => {
  it('returns empty defaults without a provider', () => {
    render(<ShowDefaults component="Button" />);
    expect(screen.getByTestId('defaults-Button')).toHaveTextContent('{}');
  });

  it('returns the defaults configured for the component', () => {
    render(
      <ThemeProvider componentDefaults={{ Button: { size: 'lg' } }}>
        <ShowDefaults component="Button" />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('defaults-Button')).toHaveTextContent('{"size":"lg"}');
  });

  it('shallow-merges nested providers per component, innermost winning', () => {
    render(
      <ThemeProvider componentDefaults={{ Button: { size: 'lg', variant: 'primary' } }}>
        <ThemeProvider componentDefaults={{ Button: { size: 'sm' } }}>
          <ShowDefaults component="Button" />
        </ThemeProvider>
      </ThemeProvider>,
    );
    expect(screen.getByTestId('defaults-Button')).toHaveTextContent(
      '{"size":"sm","variant":"primary"}',
    );
  });

  it('keeps outer-provider components the inner provider does not mention', () => {
    render(
      <ThemeProvider componentDefaults={{ Input: { size: 'sm' } }}>
        <ThemeProvider componentDefaults={{ Button: { size: 'lg' } }}>
          <ShowDefaults component="Input" />
          <ShowDefaults component="Button" />
        </ThemeProvider>
      </ThemeProvider>,
    );
    expect(screen.getByTestId('defaults-Input')).toHaveTextContent('{"size":"sm"}');
    expect(screen.getByTestId('defaults-Button')).toHaveTextContent('{"size":"lg"}');
  });
});
