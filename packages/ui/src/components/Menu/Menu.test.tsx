import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../Button';
import { Menu } from './Menu';
import type { MenuItem } from './Menu.types';

const items: MenuItem[] = [
  { value: 'edit', label: 'Edit' },
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'archive', label: 'Archive', disabled: true },
  { value: 'delete', label: 'Delete' },
];

const setup = (props: Partial<React.ComponentProps<typeof Menu>> = {}) => {
  const onSelect = vi.fn();
  const view = render(
    <Menu label="Actions" items={items} onSelect={onSelect} {...props}>
      <Button>Open</Button>
    </Menu>,
  );
  return { onSelect, ...view };
};

const trigger = () => screen.getByRole('button', { name: 'Open' });

describe('Menu', () => {
  it('is closed initially with the right trigger semantics', () => {
    setup();
    expect(trigger()).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('opens on click with no item focused (the pointer path)', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(trigger());
    const menu = await screen.findByRole('menu');
    expect(menu).toHaveAccessibleName('Actions');
    expect(screen.getAllByRole('menuitem')).toHaveLength(4);
    // Nothing focused yet: every item is out of the tab order.
    expect(screen.getAllByRole('menuitem').every((i) => i.tabIndex === -1)).toBe(true);
  });

  // Regression: a pointer-opened menu left focus on the trigger, while the
  // only key handler lives on the portalled surface — a React SIBLING of the
  // trigger, so nothing reached it. Arrows, Enter, type-ahead AND Escape
  // were all dead, contradicting the documented contract.
  describe('pointer-opened menu is still fully operable by keyboard', () => {
    it('moves focus into the surface so keys are handled', async () => {
      const user = userEvent.setup();
      setup();
      await user.click(trigger());
      const menu = await screen.findByRole('menu');
      await waitFor(() => expect(menu).toHaveFocus());
    });

    it('ArrowDown then moves to the first item', async () => {
      const user = userEvent.setup();
      setup();
      await user.click(trigger());
      await screen.findByRole('menu');
      await user.keyboard('{ArrowDown}');
      await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus());
    });

    it('Escape closes it', async () => {
      const user = userEvent.setup();
      setup();
      await user.click(trigger());
      await screen.findByRole('menu');
      await user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
      expect(trigger()).toHaveFocus();
    });

    it('closes when every item is disabled and focus still lands in the menu', async () => {
      const user = userEvent.setup();
      render(
        <Menu label="Actions" items={[{ value: 'a', label: 'Only', disabled: true }]}>
          <Button>Open</Button>
        </Menu>,
      );
      trigger().focus();
      await user.keyboard('{ArrowDown}');
      const menu = await screen.findByRole('menu');
      await waitFor(() => expect(menu).toHaveFocus());
      await user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    });
  });

  // Regression: the type-ahead buffer was only cleared by its 500ms timer,
  // so a query from a previous session concatenated onto the next one.
  it('clears the type-ahead buffer when the menu closes', async () => {
    const user = userEvent.setup();
    setup();
    trigger().focus();
    await user.keyboard('{ArrowDown}');
    await user.keyboard('d'); // -> Duplicate
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus());
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());

    // Reopen and type 'e'. With a leaked buffer this would be "de" -> Delete.
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('menu');
    await user.keyboard('e');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus());
  });

  it('ArrowDown on the trigger opens and focuses the first item', async () => {
    const user = userEvent.setup();
    setup();
    trigger().focus();
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus());
  });

  it('ArrowUp on the trigger opens and focuses the last item', async () => {
    const user = userEvent.setup();
    setup();
    trigger().focus();
    await user.keyboard('{ArrowUp}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus());
  });

  it('arrows move focus and skip disabled items', async () => {
    const user = userEvent.setup();
    setup();
    trigger().focus();
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus());
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus());
    // Archive is disabled — it is stepped over.
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus());
  });

  it('Home and End jump to the ends', async () => {
    const user = userEvent.setup();
    setup();
    trigger().focus();
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{End}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus());
    await user.keyboard('{Home}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus());
  });

  it('type-ahead moves to a matching label', async () => {
    const user = userEvent.setup();
    setup();
    trigger().focus();
    await user.keyboard('{ArrowDown}');
    await user.keyboard('du');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus());
  });

  it('Enter selects and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    const { onSelect } = setup();
    trigger().focus();
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith('edit');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    expect(trigger()).toHaveFocus();
  });

  it('clicking an item selects it', async () => {
    const user = userEvent.setup();
    const { onSelect } = setup();
    await user.click(trigger());
    await user.click(await screen.findByRole('menuitem', { name: 'Duplicate' }));
    expect(onSelect).toHaveBeenCalledWith('duplicate');
  });

  it('a disabled item is marked and never selects', async () => {
    const user = userEvent.setup();
    const { onSelect } = setup();
    await user.click(trigger());
    const archive = await screen.findByRole('menuitem', { name: 'Archive' });
    expect(archive).toHaveAttribute('aria-disabled', 'true');
    await user.click(archive);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('Escape closes and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    setup();
    trigger().focus();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('menu');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    expect(trigger()).toHaveFocus();
  });

  it('closes on an outside pointer press', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Menu label="Actions" items={items}>
          <Button>Open</Button>
        </Menu>
        <button type="button">outside</button>
      </div>,
    );
    await user.click(trigger());
    await screen.findByRole('menu');
    await user.click(screen.getByRole('button', { name: 'outside' }));
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });

  it('renders slots.item and keeps it in the roving order', async () => {
    const user = userEvent.setup();
    render(
      <Menu
        label="Actions"
        items={items}
        slots={{
          item: ({ item, className, itemProps, children }) => (
            <a href={`#${item.value}`} className={className} {...itemProps}>
              {children}
            </a>
          ),
        }}
      >
        <Button>Open</Button>
      </Menu>,
    );
    trigger().focus();
    await user.keyboard('{ArrowDown}');
    const first = await screen.findByRole('menuitem', { name: 'Edit' });
    expect(first.tagName).toBe('A');
    // Focus still moves, even though the slot forwards no ref.
    await waitFor(() => expect(first).toHaveFocus());
  });
});
