import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../Button';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Drawer, drawerClasses } from './Drawer';

const setup = (props: Partial<React.ComponentProps<typeof Drawer>> = {}) => {
  const onClose = vi.fn();
  const view = render(
    <Drawer open onClose={onClose} title="Settings" {...props}>
      <Button>Inside</Button>
    </Drawer>,
  );
  return { onClose, ...view };
};

describe('Drawer', () => {
  it('renders nothing while closed', () => {
    render(
      <Drawer open={false} title="Settings">
        content
      </Drawer>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('is a modal dialog named by its title', () => {
    setup();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('Settings');
  });

  it('describes itself when given a description', () => {
    setup({ description: 'Manage your preferences' });
    expect(screen.getByRole('dialog')).toHaveAccessibleDescription('Manage your preferences');
  });

  it.each(['left', 'right', 'top', 'bottom'] as const)('applies the %s placement', (placement) => {
    setup({ placement });
    expect(screen.getByRole('dialog')).toHaveClass(drawerClasses[placement]);
  });

  it.each(['sm', 'md', 'lg', 'full'] as const)('applies the %s size', (size) => {
    setup({ size });
    expect(screen.getByRole('dialog')).toHaveClass(drawerClasses[size]);
  });

  it('moves focus inside on open', async () => {
    setup();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Inside' })).toHaveFocus());
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    const { onClose } = setup();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('closes when the scrim is clicked', async () => {
    const user = userEvent.setup();
    const { onClose, container } = setup();
    const blanket = container.ownerDocument.querySelector('.ui-blanket') as HTMLElement;
    await user.click(blanket);
    expect(onClose).toHaveBeenCalled();
  });

  it('renders a close button only with both onClose and closeLabel', () => {
    const { rerender } = setup();
    expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull();
    rerender(
      <Drawer open onClose={vi.fn()} title="Settings" closeLabel="Dismiss">
        <Button>Inside</Button>
      </Drawer>,
    );
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });

  it('traps Tab inside the panel', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">outside</button>
        <Drawer open onClose={vi.fn()} title="Settings" closeLabel="Dismiss">
          <Button>First</Button>
          <Button>Second</Button>
        </Drawer>
      </>,
    );
    await waitFor(() => expect(screen.getByRole('button', { name: 'Dismiss' })).toHaveFocus());
    await user.tab();
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Second' })).toHaveFocus();
    // Wraps back into the panel rather than reaching the outside button.
    await user.tab();
    expect(screen.getByRole('button', { name: 'outside' })).not.toHaveFocus();
  });

  it('renders footer content', () => {
    setup({ footer: <Button>Save</Button> });
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('honors theme defaults, explicit winning', () => {
    render(
      <ThemeProvider componentDefaults={{ Drawer: { placement: 'left', size: 'lg' } }}>
        <Drawer open title="Themed">
          x
        </Drawer>
      </ThemeProvider>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass(drawerClasses.left, drawerClasses.lg);
  });

  it('merges className and forwards ref to the panel', () => {
    let node: HTMLDivElement | null = null;
    render(
      <Drawer
        ref={(el) => {
          node = el;
        }}
        open
        title="t"
        className="custom"
      >
        x
      </Drawer>,
    );
    expect(screen.getByRole('dialog')).toHaveClass('custom');
    expect(node).toBe(screen.getByRole('dialog'));
  });
});
