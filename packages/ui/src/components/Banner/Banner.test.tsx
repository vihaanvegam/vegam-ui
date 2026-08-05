import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Banner, bannerClasses } from './Banner';
import type { BannerIntent } from './Banner.types';

// The root is presentational (no disabled state — noted per recipe); the close
// button is the interactive part and is covered below.
describe('Banner', () => {
  it('renders a polite status region with its title', () => {
    render(<Banner title="Saved" />);
    const banner = screen.getByRole('status');
    expect(banner).toHaveClass(bannerClasses.root);
    expect(banner).toHaveTextContent('Saved');
  });

  it('defaults to the info intent', () => {
    render(<Banner title="t" />);
    expect(screen.getByRole('status')).toHaveClass(bannerClasses.info);
  });

  it.each<BannerIntent>(['info', 'success', 'warning', 'danger'])(
    'applies the %s intent class',
    (intent) => {
      render(<Banner intent={intent} title="t" data-testid="banner" />);
      expect(screen.getByTestId('banner')).toHaveClass(bannerClasses[intent]);
    },
  );

  it.each<[BannerIntent, string]>([
    ['info', 'status'],
    ['success', 'status'],
    ['warning', 'alert'],
    ['danger', 'alert'],
  ])('%s maps to role=%s, and an explicit role wins', (intent, role) => {
    render(<Banner intent={intent} title="t" />);
    expect(screen.getByRole(role)).toBeInTheDocument();
    render(<Banner intent={intent} title="override" role="note" />);
    expect(screen.getByRole('note')).toHaveTextContent('override');
  });

  it('renders children as the description, omitting the block otherwise', () => {
    const { rerender } = render(<Banner title="t">Details here</Banner>);
    expect(screen.getByText('Details here')).toHaveClass(bannerClasses.description);
    rerender(<Banner title="t" />);
    expect(document.querySelector(`.${bannerClasses.description}`)).toBeNull();
  });

  it('renders the icon slot aria-hidden', () => {
    render(<Banner title="t" icon={<svg data-testid="icon" />} />);
    const wrapper = screen.getByTestId('icon').parentElement;
    expect(wrapper).toHaveClass(bannerClasses.icon);
    expect(wrapper).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders consumer actions in the actions container', () => {
    render(<Banner title="t" actions={<button type="button">View details</button>} />);
    const action = screen.getByRole('button', { name: 'View details' });
    expect(action.parentElement).toHaveClass(bannerClasses.actions);
  });

  it('renders no close button without onClose', () => {
    render(<Banner title="t" />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('names the close button and calls onClose on click and keyboard', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Banner title="t" onClose={onClose} closeLabel="Dismiss" />);
    const close = screen.getByRole('button', { name: 'Dismiss' });
    expect(close).toHaveAttribute('type', 'button');
    await user.click(close);
    close.focus();
    await user.keyboard('{Enter}');
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('merges className and spreads rest props', () => {
    render(<Banner title="t" className="custom" data-testid="banner" id="sync" />);
    const banner = screen.getByTestId('banner');
    expect(banner).toHaveClass(bannerClasses.root);
    expect(banner).toHaveClass('custom');
    expect(banner).toHaveAttribute('id', 'sync');
  });

  it('merges slotProps onto internal parts', () => {
    render(
      <Banner
        title="t"
        onClose={() => {}}
        closeLabel="Dismiss"
        slotProps={{
          title: { className: 'custom-title', id: 'banner-title' },
          close: { id: 'banner-close' },
        }}
      >
        d
      </Banner>,
    );
    const title = document.getElementById('banner-title');
    expect(title).toHaveClass(bannerClasses.title);
    expect(title).toHaveClass('custom-title');
    expect(document.getElementById('banner-close')).toHaveClass(bannerClasses.close);
  });

  it('forwards its ref to the root div', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Banner ref={ref} title="t" data-testid="banner" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(screen.getByTestId('banner'));
  });

  it('reads its intent default from the theme, explicit prop winning', () => {
    render(
      <ThemeProvider componentDefaults={{ Banner: { intent: 'success' } }}>
        <Banner title="themed" data-testid="themed" />
        <Banner title="explicit" intent="danger" data-testid="explicit" />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('themed')).toHaveClass(bannerClasses.success);
    expect(screen.getByTestId('explicit')).toHaveClass(bannerClasses.danger);
  });
});
