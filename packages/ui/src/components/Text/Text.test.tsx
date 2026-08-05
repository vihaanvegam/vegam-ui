import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Text, textClasses } from './Text';
import type { TextTone, TextWeight } from './Text.types';

// Text is presentational: it has no interaction or disabled state, so the
// DoD's interaction/disabled cases do not apply; variants, ref, className
// merging, prop spreading, and theme defaults are covered below.
describe('Text', () => {
  it('renders a paragraph by default', () => {
    render(<Text>hello</Text>);
    const el = screen.getByText('hello');
    expect(el.tagName).toBe('P');
    expect(el).toHaveClass(textClasses.root);
  });

  it('renders the element given via as', () => {
    render(<Text as="h2">Heading</Text>);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Heading');
  });

  it('inherits when size, weight, and tone are omitted', () => {
    render(<Text>plain</Text>);
    const el = screen.getByText('plain');
    expect(el.className.trim()).toBe(textClasses.root);
  });

  it.each([
    ['xxs', textClasses.sizeXxs],
    ['xs', textClasses.sizeXs],
    ['sm', textClasses.sizeSm],
    ['md', textClasses.sizeMd],
    ['lg', textClasses.sizeLg],
    ['xl', textClasses.sizeXl],
    ['xxl', textClasses.sizeXxl],
    ['xxxl', textClasses.sizeXxxl],
    ['display', textClasses.sizeDisplay],
  ] as const)('applies the %s size class', (size, className) => {
    render(<Text size={size}>x</Text>);
    expect(screen.getByText('x')).toHaveClass(className);
  });

  it.each<TextWeight>(['regular', 'medium', 'semibold', 'bold'])(
    'applies the %s weight class',
    (weight) => {
      render(<Text weight={weight}>x</Text>);
      expect(screen.getByText('x')).toHaveClass(textClasses[weight]);
    },
  );

  it.each<TextTone>(['primary', 'muted', 'disabled', 'danger', 'success', 'warning'])(
    'applies the %s tone class',
    (tone) => {
      render(<Text tone={tone}>x</Text>);
      expect(screen.getByText('x')).toHaveClass(textClasses[tone]);
    },
  );

  it('merges className and spreads rest props onto the element', () => {
    render(
      <Text className="custom" id="intro">
        x
      </Text>,
    );
    const el = screen.getByText('x');
    expect(el).toHaveClass(textClasses.root);
    expect(el).toHaveClass('custom');
    expect(el).toHaveAttribute('id', 'intro');
  });

  it('forwards its ref to the rendered element', () => {
    const ref = createRef<HTMLElement>();
    render(
      <Text as="span" ref={ref}>
        x
      </Text>,
    );
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current).toBe(screen.getByText('x'));
  });

  it('reads defaults from the theme, explicit props winning', () => {
    render(
      <ThemeProvider componentDefaults={{ Text: { size: 'sm', tone: 'muted' } }}>
        <Text>themed</Text>
        <Text size="xxxl">explicit</Text>
      </ThemeProvider>,
    );
    const themed = screen.getByText('themed');
    expect(themed).toHaveClass(textClasses.sizeSm);
    expect(themed).toHaveClass(textClasses.muted);
    const explicit = screen.getByText('explicit');
    expect(explicit).toHaveClass(textClasses.sizeXxxl);
    expect(explicit).toHaveClass(textClasses.muted);
  });
});
