import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Pagination, paginationRange } from './Pagination';

const labels = {
  label: 'Pagination',
  previousLabel: 'Previous page',
  nextLabel: 'Next page',
};

describe('paginationRange', () => {
  it('lists every page when they all fit', () => {
    expect(paginationRange(5, 1, 1)).toEqual([1, 2, 3, 4, 5]);
  });

  it('gaps both sides when the current page is in the middle', () => {
    expect(paginationRange(20, 10, 1)).toEqual([1, 'gap', 9, 10, 11, 'gap', 20]);
  });

  it('does not gap a single skipped page — it shows it', () => {
    // 1 … 3 would hide exactly one page behind a wider control.
    expect(paginationRange(5, 4, 1)).toEqual([1, 2, 3, 4, 5]);
  });

  it('widens the window with siblingCount', () => {
    expect(paginationRange(20, 10, 2)).toEqual([1, 'gap', 8, 9, 10, 11, 12, 'gap', 20]);
  });

  it('clamps a page outside the range', () => {
    expect(paginationRange(3, 99, 1)).toEqual([1, 2, 3]);
  });

  it('handles a single page and a zero count', () => {
    expect(paginationRange(1, 1, 1)).toEqual([1]);
    expect(paginationRange(0, 1, 1)).toEqual([]);
  });
});

describe('Pagination', () => {
  it('is a named navigation landmark', () => {
    render(<Pagination count={5} {...labels} />);
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
  });

  it('marks the current page with aria-current', () => {
    render(<Pagination count={5} defaultPage={3} {...labels} />);
    expect(screen.getByRole('button', { name: '3' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: '2' })).not.toHaveAttribute('aria-current');
  });

  it('changes page on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Pagination count={5} onChange={onChange} {...labels} />);
    await user.click(screen.getByRole('button', { name: '3' }));
    expect(onChange).toHaveBeenCalledWith(3);
    expect(screen.getByRole('button', { name: '3' })).toHaveAttribute('aria-current', 'page');
  });

  it('steps with previous/next', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Pagination count={5} defaultPage={2} onChange={onChange} {...labels} />);
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onChange).toHaveBeenLastCalledWith(3);
    await user.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(onChange).toHaveBeenLastCalledWith(2);
  });

  it('disables the step buttons at the boundaries rather than wrapping', () => {
    const { rerender } = render(<Pagination count={5} defaultPage={1} {...labels} />);
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled();
    rerender(<Pagination count={5} page={5} {...labels} />);
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('the ellipsis is inert, never a focusable control', () => {
    render(<Pagination count={20} defaultPage={10} {...labels} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.some((b) => b.textContent?.includes('…'))).toBe(false);
  });

  it('uses pageLabel for accessible names when given', () => {
    render(<Pagination count={3} pageLabel={(p) => `Page ${p}`} {...labels} />);
    expect(screen.getByRole('button', { name: 'Page 2' })).toBeInTheDocument();
  });

  it('controlled: page wins until the owner updates it', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<Pagination count={5} page={1} onChange={onChange} {...labels} />);
    await user.click(screen.getByRole('button', { name: '2' }));
    expect(onChange).toHaveBeenCalledWith(2);
    expect(screen.getByRole('button', { name: '1' })).toHaveAttribute('aria-current', 'page');
    rerender(<Pagination count={5} page={2} onChange={onChange} {...labels} />);
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page');
  });

  it('disabled turns every control off', () => {
    render(<Pagination count={5} disabled {...labels} />);
    expect(screen.getAllByRole('button').every((b) => (b as HTMLButtonElement).disabled)).toBe(
      true,
    );
  });

  it('merges className and forwards ref', () => {
    let node: HTMLElement | null = null;
    render(
      <Pagination
        ref={(el) => {
          node = el;
        }}
        count={3}
        className="custom"
        {...labels}
      />,
    );
    expect(screen.getByRole('navigation')).toHaveClass('custom');
    expect(node).toBeInstanceOf(HTMLElement);
  });
});
