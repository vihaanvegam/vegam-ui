import { createRef } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Blanket, blanketClasses } from './Blanket';

// Blanket is presentational: no variants, interaction, or disabled state
// (noted per recipe); render, ref, className merge, and prop spread covered.
describe('Blanket', () => {
  it('renders an aria-hidden div with the root class', () => {
    const { container } = render(<Blanket />);
    const blanket = container.firstElementChild as HTMLElement;
    expect(blanket.tagName).toBe('DIV');
    expect(blanket).toHaveClass(blanketClasses.root);
    expect(blanket).toHaveAttribute('aria-hidden', 'true');
  });

  it('merges className and spreads rest props', () => {
    const { container } = render(<Blanket className="custom" id="scrim" />);
    const blanket = container.firstElementChild as HTMLElement;
    expect(blanket).toHaveClass(blanketClasses.root);
    expect(blanket).toHaveClass('custom');
    expect(blanket).toHaveAttribute('id', 'scrim');
  });

  it('forwards its ref to the div element', () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<Blanket ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(container.firstElementChild);
  });
});
