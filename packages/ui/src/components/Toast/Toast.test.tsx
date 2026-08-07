import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Button } from '../Button';
import { ToastProvider } from './ToastProvider';
import { useToast } from './ToastContext';
import type { ToastOptions } from './Toast.types';

function Trigger({ options, label = 'show' }: { options: ToastOptions; label?: string }) {
  const { show } = useToast();
  return (
    <Button onClick={() => show(options)} data-testid={label}>
      {label}
    </Button>
  );
}

const renderWithProvider = (ui: React.ReactNode, providerProps = {}) =>
  render(<ToastProvider {...providerProps}>{ui}</ToastProvider>);

describe('useToast', () => {
  it('throws a helpful error outside a provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Trigger options={{ title: 'x' }} />)).toThrow(/ToastProvider/);
    spy.mockRestore();
  });
});

describe('ToastProvider', () => {
  it('always renders both live regions so a toast lands in an existing one', () => {
    renderWithProvider(null);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows a toast with title and description', async () => {
    const user = userEvent.setup();
    renderWithProvider(<Trigger options={{ title: 'Saved', description: 'All good' }} />);
    await user.click(screen.getByTestId('show'));
    expect(await screen.findByText('Saved')).toBeInTheDocument();
    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('routes info/success to the polite region', async () => {
    const user = userEvent.setup();
    renderWithProvider(<Trigger options={{ title: 'Saved', intent: 'success' }} />);
    await user.click(screen.getByTestId('show'));
    expect(await screen.findByText('Saved')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Saved');
    expect(screen.getByRole('alert')).not.toHaveTextContent('Saved');
  });

  it('routes warning/danger to the assertive region', async () => {
    const user = userEvent.setup();
    renderWithProvider(<Trigger options={{ title: 'Broke', intent: 'danger' }} />);
    await user.click(screen.getByTestId('show'));
    expect(await screen.findByText('Broke')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Broke');
    expect(screen.getByRole('status')).not.toHaveTextContent('Broke');
  });

  it('dismisses via the close button', async () => {
    const user = userEvent.setup();
    renderWithProvider(
      <Trigger options={{ title: 'Saved', duration: null, closeLabel: 'Dismiss' }} />,
    );
    await user.click(screen.getByTestId('show'));
    await screen.findByText('Saved');
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    await waitFor(() => expect(screen.queryByText('Saved')).toBeNull());
  });

  it('renders no close button without a closeLabel (no shipped copy)', async () => {
    const user = userEvent.setup();
    renderWithProvider(<Trigger options={{ title: 'Saved', duration: null }} />);
    await user.click(screen.getByTestId('show'));
    await screen.findByText('Saved');
    expect(screen.queryByRole('button', { name: /dismiss/i })).toBeNull();
  });

  it('caps the stack at max, dropping the oldest', async () => {
    const user = userEvent.setup();
    renderWithProvider(<Trigger options={{ title: 'T', duration: null }} />, { max: 2 });
    const button = screen.getByTestId('show');
    await user.click(button);
    await user.click(button);
    await user.click(button);
    await waitFor(() => expect(screen.getAllByText('T')).toHaveLength(2));
  });

  // Regression: both live regions received the same regionProps, spread
  // AFTER role/aria-live, so a consumer could silently break announcements.
  it('regionProps cannot override the live-region contract', () => {
    renderWithProvider(null, { regionProps: { role: 'log', 'aria-live': 'off' } });
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
  });

  // Regression: an atomic region re-announces every toast already in it
  // whenever a new one arrives.
  it('marks both regions non-atomic so only new toasts are announced', () => {
    renderWithProvider(null);
    expect(screen.getByRole('status')).toHaveAttribute('aria-atomic', 'false');
    expect(screen.getByRole('alert')).toHaveAttribute('aria-atomic', 'false');
  });

  it('renders an action element', async () => {
    const user = userEvent.setup();
    renderWithProvider(
      <Trigger options={{ title: 'Deleted', duration: null, action: <Button>Undo</Button> }} />,
    );
    await user.click(screen.getByTestId('show'));
    expect(await screen.findByRole('button', { name: 'Undo' })).toBeInTheDocument();
  });

  describe('auto-dismiss', () => {
    beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
    afterEach(() => vi.useRealTimers());

    it('dismisses after the duration', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithProvider(<Trigger options={{ title: 'Bye', duration: 1000 }} />);
      await user.click(screen.getByTestId('show'));
      expect(screen.getByText('Bye')).toBeInTheDocument();
      await act(async () => {
        vi.advanceTimersByTime(1100);
      });
      await waitFor(() => expect(screen.queryByText('Bye')).toBeNull());
    });

    it('never auto-dismisses with duration: null', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderWithProvider(<Trigger options={{ title: 'Stay', duration: null }} />);
      await user.click(screen.getByTestId('show'));
      await act(async () => {
        vi.advanceTimersByTime(60_000);
      });
      expect(screen.getByText('Stay')).toBeInTheDocument();
    });
  });
});
