import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Accordion, accordionClasses } from './Accordion';
import type { AccordionItem } from './Accordion.types';

const items: AccordionItem[] = [
  { value: 'a', label: 'Shipping', content: 'Ships in 3 days.' },
  { value: 'b', label: 'Returns', content: 'Within 30 days.' },
  { value: 'c', label: 'Locked', content: 'Hidden.', disabled: true },
];

describe('Accordion', () => {
  it('renders headings wrapping real buttons, all collapsed', () => {
    render(<Accordion items={items} />);
    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(screen.getByRole('heading', { name: 'Shipping', level: 3 })).toBeInTheDocument();
    expect(screen.queryByRole('region')).toBeNull();
  });

  it('renders at the requested heading level', () => {
    render(<Accordion items={items} headingLevel={2} />);
    expect(screen.getByRole('heading', { name: 'Shipping', level: 2 })).toBeInTheDocument();
  });

  it('expands on click and wires the panel to its trigger', async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} />);
    const trigger = screen.getByRole('button', { name: 'Shipping' });
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const panel = screen.getByRole('region');
    expect(panel).toHaveTextContent('Ships in 3 days.');
    expect(panel).toHaveAttribute('aria-labelledby', trigger.id);
    expect(trigger).toHaveAttribute('aria-controls', panel.id);
  });

  it('single mode: opening one closes the other', async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} />);
    await user.click(screen.getByRole('button', { name: 'Shipping' }));
    await user.click(screen.getByRole('button', { name: 'Returns' }));
    expect(screen.getAllByRole('region')).toHaveLength(1);
    expect(screen.getByRole('region')).toHaveTextContent('Within 30 days.');
  });

  it('clicking an open section closes it', async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} defaultValue="a" />);
    expect(screen.getByRole('region')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Shipping' }));
    expect(screen.queryByRole('region')).toBeNull();
  });

  it('multiple mode: several stay open and onChange reports an array', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Accordion items={items} multiple onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Shipping' }));
    await user.click(screen.getByRole('button', { name: 'Returns' }));
    expect(screen.getAllByRole('region')).toHaveLength(2);
    expect(onChange).toHaveBeenLastCalledWith(['a', 'b']);
  });

  it('single mode reports a string', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Accordion items={items} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Shipping' }));
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('a disabled section cannot be expanded', async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} />);
    const locked = screen.getByRole('button', { name: 'Locked' });
    expect(locked).toBeDisabled();
    await user.click(locked);
    expect(screen.queryByRole('region')).toBeNull();
  });

  it('controlled: value wins until the owner updates it', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<Accordion items={items} value="a" onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Returns' }));
    expect(onChange).toHaveBeenCalledWith('b');
    expect(screen.getByRole('region')).toHaveTextContent('Ships in 3 days.');
    rerender(<Accordion items={items} value="b" onChange={onChange} />);
    expect(screen.getByRole('region')).toHaveTextContent('Within 30 days.');
  });

  it('collapsed content is unmounted, so it is out of the tab order', () => {
    render(
      <Accordion
        items={[{ value: 'a', label: 'S', content: <button type="button">Inside</button> }]}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Inside' })).toBeNull();
  });

  it('merges className, spreads rest, forwards ref', () => {
    let node: HTMLDivElement | null = null;
    render(
      <Accordion
        ref={(el) => {
          node = el;
        }}
        items={items}
        className="custom"
        data-testid="acc"
      />,
    );
    expect(screen.getByTestId('acc')).toHaveClass(accordionClasses.root, 'custom');
    expect(node).toBeInstanceOf(HTMLDivElement);
  });
});
