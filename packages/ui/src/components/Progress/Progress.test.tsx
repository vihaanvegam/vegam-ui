import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Progress, progressClasses } from './Progress';

describe('Progress', () => {
  it('determinate: reports the value and fills proportionally', () => {
    const { container } = render(<Progress aria-label="Upload" value={40} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    const fill = container.querySelector(`.${progressClasses.fill}`) as HTMLElement;
    expect(fill.style.inlineSize).toBe('40%');
  });

  it('scales the fill to a custom min/max', () => {
    const { container } = render(<Progress aria-label="p" min={10} max={20} value={15} />);
    const fill = container.querySelector(`.${progressClasses.fill}`) as HTMLElement;
    expect(fill.style.inlineSize).toBe('50%');
  });

  it('clamps values outside the bounds', () => {
    render(<Progress aria-label="p" value={150} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('indeterminate: omits aria-valuenow — that is how AT is told it is unknown', () => {
    render(<Progress aria-label="p" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).not.toHaveAttribute('aria-valuenow');
    expect(bar).toHaveClass(progressClasses.indeterminate);
  });

  it('uses valueText when determinate', () => {
    render(<Progress aria-label="p" value={3} max={10} valueText="3 of 10 files" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '3 of 10 files');
  });

  it.each(['primary', 'success', 'warning', 'danger'] as const)('applies the %s tone', (tone) => {
    render(<Progress aria-label="p" value={1} tone={tone} />);
    expect(screen.getByRole('progressbar')).toHaveClass(progressClasses[tone]);
  });

  it('honors theme defaults, explicit winning', () => {
    render(
      <ThemeProvider componentDefaults={{ Progress: { size: 'sm', tone: 'success' } }}>
        <Progress aria-label="themed" value={1} />
        <Progress aria-label="explicit" value={1} size="md" tone="danger" />
      </ThemeProvider>,
    );
    expect(screen.getByLabelText('themed')).toHaveClass(
      progressClasses.sm,
      progressClasses.success,
    );
    expect(screen.getByLabelText('explicit')).toHaveClass(
      progressClasses.md,
      progressClasses.danger,
    );
  });

  it('merges className, spreads rest, forwards ref', () => {
    let node: HTMLDivElement | null = null;
    render(
      <Progress
        ref={(el) => {
          node = el;
        }}
        aria-label="p"
        className="custom"
        data-testid="pr"
      />,
    );
    expect(screen.getByTestId('pr')).toHaveClass(progressClasses.root, 'custom');
    expect(node).toBeInstanceOf(HTMLDivElement);
  });

  // disabled: N/A — presentational, no interactive state.
});
