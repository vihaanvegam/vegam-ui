import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Chip, chipClasses } from './Chip';

describe('Chip', () => {
  it('is a plain span with no role when static', () => {
    const { container } = render(<Chip>React</Chip>);
    const chip = container.querySelector(`.${chipClasses.root}`) as HTMLElement;
    expect(chip.tagName).toBe('SPAN');
    expect(chip).not.toHaveAttribute('role');
    expect(chip).toHaveTextContent('React');
  });

  it.each(['neutral', 'info', 'success', 'warning', 'danger', 'tag'] as const)(
    'applies the %s tone',
    (tone) => {
      const { container } = render(<Chip tone={tone}>x</Chip>);
      expect(container.querySelector(`.${chipClasses.root}`)).toHaveClass(chipClasses[tone]);
    },
  );

  it.each(['sm', 'md'] as const)('applies the %s size', (size) => {
    const { container } = render(<Chip size={size}>x</Chip>);
    expect(container.querySelector(`.${chipClasses.root}`)).toHaveClass(chipClasses[size]);
  });

  it('becomes a real button when activatable', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Chip onClick={onClick}>Filter</Chip>);
    const button = screen.getByRole('button', { name: 'Filter' });
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('activatable chips are keyboard operable (native button semantics)', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Chip onClick={onClick}>Filter</Chip>);
    screen.getByRole('button').focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('exposes selection as aria-pressed', () => {
    render(
      <Chip onClick={vi.fn()} selected>
        Filter
      </Chip>,
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders a labelled remove button and fires onRemove', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <Chip onRemove={onRemove} removeLabel="Remove React">
        React
      </Chip>,
    );
    await user.click(screen.getByRole('button', { name: 'Remove React' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('renders no remove button without removeLabel (no shipped copy)', () => {
    render(<Chip onRemove={vi.fn()}>React</Chip>);
    expect(screen.queryByRole('button')).toBeNull();
  });

  // Nesting a button inside a button is invalid HTML and unreachable, so the
  // pair renders as siblings.
  it('activatable + removable renders two sibling buttons, not nested ones', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onRemove = vi.fn();
    render(
      <Chip onClick={onClick} onRemove={onRemove} removeLabel="Remove React">
        React
      </Chip>,
    );
    const label = screen.getByRole('button', { name: 'React' });
    const remove = screen.getByRole('button', { name: 'Remove React' });
    expect(label.contains(remove)).toBe(false);

    await user.click(remove);
    expect(onRemove).toHaveBeenCalledTimes(1);
    // Removal must not also activate the chip.
    expect(onClick).not.toHaveBeenCalled();

    await user.click(label);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disabled blocks activation and removal', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onRemove = vi.fn();
    render(
      <Chip onClick={onClick} onRemove={onRemove} removeLabel="Remove" disabled>
        React
      </Chip>,
    );
    await user.click(screen.getByRole('button', { name: 'React' }));
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    expect(onClick).not.toHaveBeenCalled();
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('honors theme defaults, explicit winning', () => {
    const { container } = render(
      <ThemeProvider componentDefaults={{ Chip: { tone: 'success', size: 'sm' } }}>
        <Chip>themed</Chip>
        <Chip tone="danger">explicit</Chip>
      </ThemeProvider>,
    );
    const [themed, explicit] = container.querySelectorAll(`.${chipClasses.root}`);
    expect(themed).toHaveClass(chipClasses.success, chipClasses.sm);
    expect(explicit).toHaveClass(chipClasses.danger);
  });

  it('merges className and forwards ref', () => {
    let node: HTMLElement | null = null;
    const { container } = render(
      <Chip
        ref={(el) => {
          node = el;
        }}
        className="custom"
      >
        x
      </Chip>,
    );
    expect(container.querySelector(`.${chipClasses.root}`)).toHaveClass('custom');
    expect(node).toBeInstanceOf(HTMLSpanElement);
  });
});
