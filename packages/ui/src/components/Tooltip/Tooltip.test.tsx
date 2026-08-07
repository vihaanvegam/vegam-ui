import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Button } from '../Button';
import { Tooltip } from './Tooltip';

const setup = (props: Partial<React.ComponentProps<typeof Tooltip>> = {}) =>
  render(
    <Tooltip content="Saves your work" {...props}>
      <Button>Save</Button>
    </Tooltip>,
  );

describe('Tooltip', () => {
  it('is closed initially and renders the trigger untouched', () => {
    setup();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('opens immediately on focus (no delay for keyboard users)', async () => {
    setup();
    act(() => screen.getByRole('button').focus());
    await waitFor(() => expect(screen.getByRole('tooltip')).toHaveTextContent('Saves your work'));
  });

  it('describes the trigger while open — it names nothing', async () => {
    setup();
    const trigger = screen.getByRole('button');
    act(() => trigger.focus());
    const tip = await screen.findByRole('tooltip');
    expect(trigger).toHaveAttribute('aria-describedby', tip.id);
    // The accessible NAME still comes from the trigger's own content.
    expect(trigger).toHaveAccessibleName('Save');
  });

  it('closes on blur', async () => {
    setup();
    const trigger = screen.getByRole('button');
    act(() => trigger.focus());
    await screen.findByRole('tooltip');
    act(() => trigger.blur());
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
  });

  it('closes on Escape while the trigger keeps focus', async () => {
    const user = userEvent.setup();
    setup();
    const trigger = screen.getByRole('button');
    act(() => trigger.focus());
    await screen.findByRole('tooltip');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
    expect(trigger).toHaveFocus();
  });

  it('does nothing when disabled', async () => {
    setup({ disabled: true });
    act(() => screen.getByRole('button').focus());
    await new Promise((r) => setTimeout(r, 20));
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('supports controlled open', async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Tooltip content="Hi" open={false} onOpenChange={onOpenChange}>
        <Button>Save</Button>
      </Tooltip>,
    );
    expect(screen.queryByRole('tooltip')).toBeNull();
    rerender(
      <Tooltip content="Hi" open onOpenChange={onOpenChange}>
        <Button>Save</Button>
      </Tooltip>,
    );
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
  });

  it('preserves the trigger own handlers', async () => {
    const onFocus = vi.fn();
    render(
      <Tooltip content="Hi">
        <Button onFocus={onFocus}>Save</Button>
      </Tooltip>,
    );
    act(() => screen.getByRole('button').focus());
    expect(onFocus).toHaveBeenCalled();
  });

  // React derives onPointerEnter/Leave from pointerover/pointerout, so these
  // must go through userEvent — a hand-dispatched `pointerenter` never
  // reaches the handler and the test would pass vacuously.
  describe('hover delay', () => {
    beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
    afterEach(() => vi.useRealTimers());

    it('waits for the delay before opening on hover', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(
        <Tooltip content="Hi" delay={300}>
          <Button>Save</Button>
        </Tooltip>,
      );
      await user.hover(screen.getByRole('button'));
      expect(screen.queryByRole('tooltip')).toBeNull();
      await act(async () => {
        vi.advanceTimersByTime(350);
      });
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('cancels a pending open when the pointer leaves first', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(
        <Tooltip content="Hi" delay={300}>
          <Button>Save</Button>
        </Tooltip>,
      );
      const trigger = screen.getByRole('button');
      await user.hover(trigger);
      await act(async () => {
        vi.advanceTimersByTime(100);
      });
      await user.unhover(trigger);
      await act(async () => {
        vi.advanceTimersByTime(500);
      });
      expect(screen.queryByRole('tooltip')).toBeNull();
    });
  });
});
