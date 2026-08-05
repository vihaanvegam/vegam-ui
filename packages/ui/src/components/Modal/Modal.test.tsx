import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Modal, modalClasses } from './Modal';
import type { ModalAppearance, ModalSize } from './Modal.types';

// The dialog panel itself has no disabled state (noted per recipe); the close
// button, Escape, blanket, and focus behavior are the interactive surface.
describe('Modal', () => {
  it('renders nothing while closed', () => {
    render(<Modal open={false} title="t" />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders an aria-modal dialog labelled by its title and described by its description', () => {
    render(
      <Modal open title="Delete batch?" description="This action cannot be undone.">
        Body copy
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('Delete batch?');
    expect(dialog).toHaveAccessibleDescription('This action cannot be undone.');
    expect(screen.getByText('Body copy')).toHaveClass(modalClasses.body);
  });

  it('defaults to the sm size and applies size classes', () => {
    render(<Modal open title="t" />);
    expect(screen.getByRole('dialog')).toHaveClass(modalClasses.sm);
  });

  it.each<ModalSize>(['sm', 'md', 'lg', 'xl', 'fullscreen'])(
    'applies the %s size class',
    (size) => {
      render(<Modal open size={size} title="t" />);
      expect(screen.getByRole('dialog')).toHaveClass(modalClasses[size]);
    },
  );

  it.each<[ModalAppearance, boolean]>([
    ['default', false],
    ['warning', true],
    ['danger', true],
  ])('appearance %s applies its panel class only when tinted', (appearance, hasClass) => {
    render(<Modal open appearance={appearance} title="t" />);
    const dialog = screen.getByRole('dialog');
    if (hasClass) {
      expect(dialog).toHaveClass(`ui-modal__panel--${appearance}`);
    } else {
      expect(dialog.className).not.toContain('--default');
    }
  });

  it('renders the icon slot aria-hidden and the footer content', () => {
    render(
      <Modal
        open
        title="t"
        icon={<svg data-testid="icon" />}
        footer={<button type="button">Confirm</button>}
      />,
    );
    const wrapper = screen.getByTestId('icon').parentElement;
    expect(wrapper).toHaveClass(modalClasses.icon);
    expect(wrapper).toHaveAttribute('aria-hidden', 'true');
    const action = screen.getByRole('button', { name: 'Confirm' });
    expect(action.parentElement).toHaveClass(modalClasses.footer);
  });

  it('renders the close button only when closeLabel and onClose are both given', () => {
    const { rerender } = render(<Modal open title="t" onClose={() => {}} />);
    expect(screen.queryByRole('button')).toBeNull();
    rerender(<Modal open title="t" onClose={() => {}} closeLabel="Close dialog" />);
    const close = screen.getByRole('button', { name: 'Close dialog' });
    expect(close).toHaveClass(modalClasses.close);
    expect(close).toHaveAttribute('type', 'button');
  });

  it('reports dismissal via close click, Escape, and blanket click — panel clicks stay put', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open title="t" onClose={onClose} closeLabel="Close">
        content
      </Modal>,
    );
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(2);
    fireEvent.click(document.querySelector('.ui-blanket') as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(3);
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it('moves focus into the dialog on open and back to the trigger on close', () => {
    const { rerender } = render(
      <>
        <button type="button">trigger</button>
        <Modal open={false} title="t" onClose={() => {}} closeLabel="Close" />
      </>,
    );
    const trigger = screen.getByRole('button', { name: 'trigger' });
    trigger.focus();
    rerender(
      <>
        <button type="button">trigger</button>
        <Modal open title="t" onClose={() => {}} closeLabel="Close" />
      </>,
    );
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close' }));
    rerender(
      <>
        <button type="button">trigger</button>
        <Modal open={false} title="t" onClose={() => {}} closeLabel="Close" />
      </>,
    );
    expect(document.activeElement).toBe(trigger);
  });

  it('focuses the panel itself when nothing inside is tabbable', () => {
    render(<Modal open title="t" />);
    expect(document.activeElement).toBe(screen.getByRole('dialog'));
  });

  it('traps Tab and Shift+Tab inside the panel', async () => {
    const user = userEvent.setup();
    render(
      <Modal
        open
        title="t"
        onClose={() => {}}
        closeLabel="Close"
        footer={<button type="button">Confirm</button>}
      />,
    );
    const close = screen.getByRole('button', { name: 'Close' });
    const confirm = screen.getByRole('button', { name: 'Confirm' });
    expect(document.activeElement).toBe(close);
    confirm.focus();
    await user.tab();
    expect(document.activeElement).toBe(close);
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(confirm);
  });

  it('locks body scroll while open and restores it on close', () => {
    const { rerender } = render(<Modal open title="t" />);
    expect(document.body.style.overflow).toBe('hidden');
    rerender(<Modal open={false} title="t" />);
    expect(document.body.style.overflow).toBe('');
  });

  it('merges className and slotProps and spreads rest props on the panel', () => {
    render(
      <Modal
        open
        title="t"
        className="custom"
        data-testid="panel"
        slotProps={{ title: { className: 'custom-title', id: 'my-title' } }}
      />,
    );
    const panel = screen.getByTestId('panel');
    expect(panel).toHaveClass(modalClasses.panel);
    expect(panel).toHaveClass('custom');
    const title = document.getElementById('my-title');
    expect(title).toHaveClass(modalClasses.title);
    expect(title).toHaveClass('custom-title');
  });

  it('forwards its ref to the dialog panel', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Modal open title="t" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(screen.getByRole('dialog'));
  });

  it('reads size and appearance defaults from the theme, explicit props winning', () => {
    render(
      <ThemeProvider componentDefaults={{ Modal: { size: 'lg', appearance: 'warning' } }}>
        <Modal open title="themed" data-testid="themed" />
      </ThemeProvider>,
    );
    const themed = screen.getByTestId('themed');
    expect(themed).toHaveClass(modalClasses.lg);
    expect(themed).toHaveClass(modalClasses.warning);
  });

  it('lets an explicit size beat the theme default', () => {
    render(
      <ThemeProvider componentDefaults={{ Modal: { size: 'lg' } }}>
        <Modal open title="explicit" size="xl" data-testid="explicit" />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('explicit')).toHaveClass(modalClasses.xl);
  });
});
