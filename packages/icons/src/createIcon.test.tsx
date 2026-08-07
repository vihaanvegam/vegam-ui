import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { createIcon } from './createIcon';
import { ICON_SIZES } from './sizes';

const TestIcon = createIcon(
  'TestIcon',
  '0 0 16 16',
  <path d="M0 0H16V16H0Z" fill="currentColor" />,
);

/** The rendered <svg>; it is aria-hidden by default, so query it structurally. */
const svgOf = (container: HTMLElement): SVGSVGElement => {
  const svg = container.querySelector('svg');
  if (svg === null) throw new Error('no <svg> rendered');
  return svg;
};

describe('createIcon', () => {
  it('renders an svg carrying the icon viewBox and the ui-icon class', () => {
    const { container } = render(<TestIcon />);
    const svg = svgOf(container);

    expect(svg).toHaveAttribute('viewBox', '0 0 16 16');
    expect(svg).toHaveClass('ui-icon');
  });

  it('names the component so it is legible in React devtools and stack traces', () => {
    expect(TestIcon.displayName).toBe('TestIcon');
  });

  describe('size', () => {
    it('defaults to 1em so it follows the surrounding text', () => {
      const { container } = render(<TestIcon />);
      const svg = svgOf(container);

      expect(svg.style.width).toBe('1em');
      expect(svg.style.height).toBe('1em');
    });

    it.each(Object.keys(ICON_SIZES) as (keyof typeof ICON_SIZES)[])(
      'resolves the %s step to its token var with a baked fallback',
      (step) => {
        const { container } = render(<TestIcon size={step} />);
        const svg = svgOf(container);

        expect(svg.getAttribute('style')).toContain(ICON_SIZES[step]);
        // The fallback is what makes the icon size correctly with no tokens CSS.
        expect(ICON_SIZES[step]).toMatch(/^var\(--ui-size-icon-[a-z]+, [\d.]+rem\)$/);
      },
    );

    it('treats a number as px', () => {
      const { container } = render(<TestIcon size={18} />);
      const svg = svgOf(container);

      expect(svg.style.width).toBe('18px');
      expect(svg.style.height).toBe('18px');
    });

    it('lets an explicit style width win over size', () => {
      const { container } = render(<TestIcon size="lg" style={{ width: '3rem' }} />);
      const svg = svgOf(container);

      expect(svg.style.width).toBe('3rem');
      // height still comes from `size` — only what the consumer set is overridden
      expect(svg.getAttribute('style')).toContain(ICON_SIZES.lg);
    });

    it('orders the ramp by value, not alphabetically — xxl sits between lg and xl', () => {
      const rem = (step: keyof typeof ICON_SIZES) =>
        parseFloat(/,\s*([\d.]+)rem/.exec(ICON_SIZES[step])?.[1] ?? '0');

      expect(rem('lg')).toBeLessThan(rem('xxl'));
      expect(rem('xxl')).toBeLessThan(rem('xl'));
    });
  });

  describe('accessibility', () => {
    it('is decorative by default — hidden from assistive tech, no role', () => {
      const { container } = render(<TestIcon />);
      const svg = svgOf(container);

      expect(svg).toHaveAttribute('aria-hidden', 'true');
      expect(svg).not.toHaveAttribute('role');
    });

    it('exposes a title as an image with that accessible name', () => {
      render(<TestIcon title="Search" />);

      const svg = screen.getByRole('img', { name: 'Search' });
      expect(svg).not.toHaveAttribute('aria-hidden');
      expect(svg.querySelector('title')).toHaveTextContent('Search');
    });

    it('puts the title first so it names the svg rather than a shape', () => {
      const { container } = render(<TestIcon title="Search" />);

      expect(svgOf(container).firstElementChild?.tagName.toLowerCase()).toBe('title');
    });

    it('honours a consumer aria-label instead of silently staying hidden', () => {
      render(<TestIcon aria-label="Find" />);

      const svg = screen.getByRole('img', { name: 'Find' });
      expect(svg).not.toHaveAttribute('aria-hidden');
    });

    it('honours a consumer aria-labelledby the same way', () => {
      render(
        <>
          <span id="lbl">Find</span>
          <TestIcon aria-labelledby="lbl" />
        </>,
      );

      expect(screen.getByRole('img', { name: 'Find' })).not.toHaveAttribute('aria-hidden');
    });

    it('has no axe violations when decorative', async () => {
      const { container } = render(
        <p>
          Results <TestIcon />
        </p>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations when titled', async () => {
      const { container } = render(<TestIcon title="Search" />);

      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('prop plumbing', () => {
    it('forwards a ref to the svg element', () => {
      const ref = createRef<SVGSVGElement>();
      render(<TestIcon ref={ref} />);

      expect(ref.current).toBeInstanceOf(SVGSVGElement);
      expect(ref.current).toHaveClass('ui-icon');
    });

    it('appends a consumer className rather than replacing ui-icon', () => {
      const { container } = render(<TestIcon className="custom" />);
      const svg = svgOf(container);

      expect(svg).toHaveClass('ui-icon', 'custom');
    });

    it('spreads arbitrary props onto the svg', async () => {
      const onClick = vi.fn();
      const { container } = render(<TestIcon data-testid="glyph" onClick={onClick} />);
      const svg = svgOf(container);

      expect(svg).toHaveAttribute('data-testid', 'glyph');
      svg.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(onClick).toHaveBeenCalledOnce();
    });

    it('lets a consumer override the defaulted svg attributes', () => {
      const { container } = render(<TestIcon fill="currentColor" viewBox="0 0 24 24" />);
      const svg = svgOf(container);

      expect(svg).toHaveAttribute('fill', 'currentColor');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });
  });
});
