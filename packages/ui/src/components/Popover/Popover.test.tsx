import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../Button';
import { Popover } from './Popover';

const setup = (props: Partial<React.ComponentProps<typeof Popover>> = {}) =>
  render(
    <Popover label="Filters" content={<Button>Apply</Button>} {...props}>
      <Button>Open</Button>
    </Popover>,
  );

describe('Popover', () => {
  it('is closed initially, trigger reports collapsed', () => {
    setup();
    expect(screen.getByRole('button', { name: 'Open' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens on click and is a named dialog', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const surface = await screen.findByRole('dialog');
    expect(surface).toHaveAccessibleName('Filters');
    expect(screen.getByRole('button', { name: 'Open' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('advertises the popup type on the trigger', () => {
    setup();
    expect(screen.getByRole('button', { name: 'Open' })).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('moves focus into the surface on open', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Apply' })).toHaveFocus());
  });

  it('leaves focus alone when initialFocus is off', async () => {
    const user = userEvent.setup();
    setup({ initialFocus: false });
    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);
    await screen.findByRole('dialog');
    expect(trigger).toHaveFocus();
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    setup();
    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(trigger).toHaveFocus();
  });

  it('closes on an outside pointer press', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Popover label="Filters" content={<Button>Apply</Button>}>
          <Button>Open</Button>
        </Popover>
        <button type="button">outside</button>
      </div>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: 'outside' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('stays open when clicking inside the surface', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  // Regression: closing restored focus to the trigger unconditionally,
  // yanking it away from wherever the user had actually moved.
  it('does not steal focus back when focus has moved elsewhere', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Popover label="Filters" content={<button type="button">Apply</button>}>
          <button type="button">Open</button>
        </Popover>
        <button type="button">elsewhere</button>
      </div>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await screen.findByRole('dialog');

    // Move focus out of the surface, then close from outside.
    const elsewhere = screen.getByRole('button', { name: 'elsewhere' });
    elsewhere.focus();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(elsewhere).toHaveFocus();
  });

  it('supports controlled open', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    setup({ open: false, onOpenChange });
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    // Stays closed until the owner flips the prop.
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
