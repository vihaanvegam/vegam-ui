import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Tabs, tabsClasses } from './Tabs';
import type { TabItem } from './Tabs.types';

const items: TabItem[] = [
  { value: 'a', label: 'Account', content: 'Account panel' },
  { value: 'b', label: 'Billing', content: 'Billing panel' },
  { value: 'c', label: 'Locked', content: 'Locked panel', disabled: true },
  { value: 'd', label: 'Team', content: 'Team panel' },
];

const setup = (props: Partial<React.ComponentProps<typeof Tabs>> = {}) => {
  const onChange = vi.fn();
  const view = render(<Tabs items={items} label="Settings" onChange={onChange} {...props} />);
  return { onChange, ...view };
};

describe('Tabs', () => {
  it('renders a named tablist with one panel', () => {
    setup();
    expect(screen.getByRole('tablist', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(4);
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
  });

  it('selects the first enabled tab by default', () => {
    setup();
    expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Account panel');
  });

  it('honors defaultValue', () => {
    setup({ defaultValue: 'b' });
    expect(screen.getByRole('tab', { name: 'Billing' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Billing panel');
  });

  it('wires the tab and panel to each other', () => {
    setup();
    const tab = screen.getByRole('tab', { name: 'Account' });
    const panel = screen.getByRole('tabpanel');
    expect(tab).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', tab.id);
  });

  it('only the selected tab is in the tab order', () => {
    setup();
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('tabindex', '0');
    expect(tabs.slice(1).every((t) => t.getAttribute('tabindex') === '-1')).toBe(true);
  });

  it('clicking a tab selects it', async () => {
    const user = userEvent.setup();
    const { onChange } = setup();
    await user.click(screen.getByRole('tab', { name: 'Billing' }));
    expect(onChange).toHaveBeenCalledWith('b');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Billing panel');
  });

  it('a disabled tab cannot be selected', async () => {
    const user = userEvent.setup();
    const { onChange } = setup();
    await user.click(screen.getByRole('tab', { name: 'Locked' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('automatic activation: arrows move focus AND selection, skipping disabled', async () => {
    const user = userEvent.setup();
    setup();
    screen.getByRole('tab', { name: 'Account' }).focus();
    await user.keyboard('{ArrowRight}');
    await waitFor(() => expect(screen.getByRole('tab', { name: 'Billing' })).toHaveFocus());
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Billing panel');
    // Locked is disabled — arrowing steps over it.
    await user.keyboard('{ArrowRight}');
    await waitFor(() => expect(screen.getByRole('tab', { name: 'Team' })).toHaveFocus());
  });

  it('arrows wrap at the ends (the APG tabs behaviour)', async () => {
    const user = userEvent.setup();
    setup();
    screen.getByRole('tab', { name: 'Account' }).focus();
    await user.keyboard('{ArrowLeft}');
    await waitFor(() => expect(screen.getByRole('tab', { name: 'Team' })).toHaveFocus());
  });

  it('Home and End jump to the ends', async () => {
    const user = userEvent.setup();
    setup();
    screen.getByRole('tab', { name: 'Account' }).focus();
    await user.keyboard('{End}');
    await waitFor(() => expect(screen.getByRole('tab', { name: 'Team' })).toHaveFocus());
    await user.keyboard('{Home}');
    await waitFor(() => expect(screen.getByRole('tab', { name: 'Account' })).toHaveFocus());
  });

  it('manual activation: arrows move focus only; Enter selects', async () => {
    const user = userEvent.setup();
    const { onChange } = setup({ activation: 'manual' });
    screen.getByRole('tab', { name: 'Account' }).focus();
    await user.keyboard('{ArrowRight}');
    await waitFor(() => expect(screen.getByRole('tab', { name: 'Billing' })).toHaveFocus());
    // Focus moved, selection did not.
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Account panel');

    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('controlled: value wins until the owner updates it', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <Tabs items={items} label="Settings" value="a" onChange={onChange} />,
    );
    await user.click(screen.getByRole('tab', { name: 'Billing' }));
    expect(onChange).toHaveBeenCalledWith('b');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Account panel');
    rerender(<Tabs items={items} label="Settings" value="b" onChange={onChange} />);
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Billing panel');
  });

  it('vertical orientation uses up/down and reports itself', async () => {
    const user = userEvent.setup();
    setup({ orientation: 'vertical' });
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
    screen.getByRole('tab', { name: 'Account' }).focus();
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(screen.getByRole('tab', { name: 'Billing' })).toHaveFocus());
  });

  it('honors theme defaults, explicit winning', () => {
    render(
      <ThemeProvider componentDefaults={{ Tabs: { orientation: 'vertical' } }}>
        <Tabs items={items} label="Themed" />
      </ThemeProvider>,
    );
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
  });

  // Regression: the uncontrolled default is captured on the first render, so
  // items arriving later left NOTHING selected and no panel rendered.
  it('selects the first tab when items arrive asynchronously', () => {
    const { rerender } = render(<Tabs items={[]} label="Settings" />);
    expect(screen.queryByRole('tabpanel')).toBeNull();

    rerender(<Tabs items={items} label="Settings" />);
    expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Account panel');
  });

  it('falls back when the selected tab is removed', () => {
    const { rerender } = render(<Tabs items={items} label="Settings" defaultValue="b" />);
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Billing panel');

    rerender(<Tabs items={items.filter((i) => i.value !== 'b')} label="Settings" />);
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Account panel');
  });

  // Regression: a selection resolving to a DISABLED tab put the only
  // tabIndex=0 on a tab the browser refuses to focus, so the widget had no
  // reachable tab stop at all.
  it('never puts the tab stop on a disabled tab', () => {
    render(<Tabs items={items} label="Settings" defaultValue="c" />);
    const tabs = screen.getAllByRole('tab');
    const tabbable = tabs.filter((t) => t.getAttribute('tabindex') === '0');
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toBeEnabled();
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Account panel');
  });

  // Regression: the automatic-activation effect re-fired onChange on every
  // render when a controlled owner declined the change — an unbounded loop,
  // because its deps include the per-render-fresh `items` and `onChange`.
  it('fires onChange once per move even when a controlled owner declines it', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    function Frozen() {
      // Deliberately ignores onChange and keeps value pinned, with inline
      // props so identities change every render.
      return <Tabs items={[...items]} label="Settings" value="a" onChange={(v) => onChange(v)} />;
    }
    render(<Frozen />);
    screen.getByRole('tab', { name: 'Account' }).focus();
    await user.keyboard('{ArrowRight}');
    await waitFor(() => expect(onChange).toHaveBeenCalledWith('b'));
    const callsAfterMove = onChange.mock.calls.length;
    // Give any runaway effect several render opportunities to pile up.
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(onChange.mock.calls.length).toBe(callsAfterMove);
  });

  it('renders no panel when there are no items at all', () => {
    render(<Tabs items={[]} label="Empty" />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.queryByRole('tabpanel')).toBeNull();
  });

  it('merges className, spreads rest, forwards ref', () => {
    let node: HTMLDivElement | null = null;
    render(
      <Tabs
        ref={(el) => {
          node = el;
        }}
        items={items}
        label="t"
        className="custom"
        data-testid="tabs"
      />,
    );
    expect(screen.getByTestId('tabs')).toHaveClass(tabsClasses.root, 'custom');
    expect(node).toBeInstanceOf(HTMLDivElement);
  });
});
