import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Breadcrumbs, breadcrumbsClasses } from './Breadcrumbs';
import type { BreadcrumbsItem, BreadcrumbsLinkRenderProps } from './Breadcrumbs.types';

const ITEMS: BreadcrumbsItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Operations', href: '/operations' },
  { label: 'Dispatch', href: '/dispatch' },
  { label: 'BTH-20241201' },
];

describe('Breadcrumbs', () => {
  it('renders a nav landmark holding an ordered list of crumbs', () => {
    render(<Breadcrumbs aria-label="Breadcrumb" items={ITEMS} />);
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(nav).toHaveClass(breadcrumbsClasses.root);
    expect(screen.getByRole('list')).toHaveClass(breadcrumbsClasses.list);
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });

  it('renders anchors for linked crumbs and marks the last as the current page', () => {
    render(<Breadcrumbs items={ITEMS} />);
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard');
    const current = screen.getByText('BTH-20241201').closest('span[aria-current]');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current).toHaveClass(breadcrumbsClasses.current);
    expect(screen.queryByRole('link', { name: 'BTH-20241201' })).toBeNull();
  });

  it('renders a button when an item has onClick but no href, and fires it', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Breadcrumbs items={[{ label: 'Ops', onClick }, { label: 'Current' }]} />);
    const crumb = screen.getByRole('button', { name: 'Ops' });
    expect(crumb).toHaveAttribute('type', 'button');
    await user.click(crumb);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders one aria-hidden separator per non-current crumb', () => {
    const { container } = render(<Breadcrumbs items={ITEMS} />);
    const separators = container.querySelectorAll(`.${breadcrumbsClasses.separator}`);
    expect(separators).toHaveLength(3);
    separators.forEach((el) => expect(el).toHaveAttribute('aria-hidden', 'true'));
  });

  it('renders per-item icons in aria-hidden wrappers', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/', iconBefore: <svg data-testid="before" /> },
          { label: 'Current', iconAfter: <svg data-testid="after" /> },
        ]}
      />,
    );
    expect(screen.getByTestId('before').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('after').parentElement).toHaveClass(breadcrumbsClasses.icon);
  });

  it('collapses to first crumb, overflow trigger, and current page', () => {
    render(<Breadcrumbs items={ITEMS} defaultCollapsed overflowLabel="Show full path" />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.queryByText('Operations')).toBeNull();
    expect(screen.queryByText('Dispatch')).toBeNull();
    expect(screen.getByText('BTH-20241201')).toBeInTheDocument();
    const trigger = screen.getByRole('button', { name: 'Show full path' });
    expect(trigger).toHaveClass(breadcrumbsClasses.overflow);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('expands the full trail when the overflow trigger is activated', async () => {
    const user = userEvent.setup();
    const onCollapsedChange = vi.fn();
    render(
      <Breadcrumbs
        items={ITEMS}
        defaultCollapsed
        overflowLabel="Show full path"
        onCollapsedChange={onCollapsedChange}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Show full path' }));
    expect(onCollapsedChange).toHaveBeenCalledWith(false);
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(screen.getByText('Operations')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Show full path' })).toBeNull();
  });

  it('keeps a controlled collapse collapsed and only reports the change', async () => {
    const user = userEvent.setup();
    const onCollapsedChange = vi.fn();
    render(
      <Breadcrumbs
        items={ITEMS}
        collapsed
        overflowLabel="Show full path"
        onCollapsedChange={onCollapsedChange}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Show full path' }));
    expect(onCollapsedChange).toHaveBeenCalledWith(false);
    // Still collapsed: the consumer owns the state.
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('never collapses a two-item trail', () => {
    render(
      <Breadcrumbs
        items={[{ label: 'Home', href: '/' }, { label: 'Current' }]}
        defaultCollapsed
        overflowLabel="Show full path"
      />,
    );
    expect(screen.queryByRole('button', { name: 'Show full path' })).toBeNull();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('sets the truncation width variable when truncateWidth is given', () => {
    render(<Breadcrumbs items={ITEMS} truncateWidth="7.5rem" data-testid="nav" />);
    expect(
      screen.getByTestId('nav').style.getPropertyValue('--ui-breadcrumbs-truncate-width'),
    ).toBe('7.5rem');
  });

  it('renders non-current crumbs through a custom link slot', () => {
    const LinkSlot = ({ item, className, children }: BreadcrumbsLinkRenderProps) => (
      <a data-testid={`slot-${item.label}`} href={item.href} className={className}>
        {children}
      </a>
    );
    render(<Breadcrumbs items={ITEMS} slots={{ link: LinkSlot }} />);
    expect(screen.getByTestId('slot-Dashboard')).toHaveClass(breadcrumbsClasses.link);
    // The current page never goes through the slot.
    expect(screen.queryByTestId('slot-BTH-20241201')).toBeNull();
  });

  it('merges className and slotProps and spreads rest props', () => {
    render(
      <Breadcrumbs
        items={ITEMS}
        className="custom"
        data-testid="nav"
        slotProps={{ list: { className: 'custom-list', id: 'crumb-list' } }}
      />,
    );
    const nav = screen.getByTestId('nav');
    expect(nav).toHaveClass(breadcrumbsClasses.root);
    expect(nav).toHaveClass('custom');
    const list = document.getElementById('crumb-list');
    expect(list).toHaveClass(breadcrumbsClasses.list);
    expect(list).toHaveClass('custom-list');
  });

  it('forwards its ref to the nav element', () => {
    const ref = createRef<HTMLElement>();
    render(<Breadcrumbs ref={ref} items={ITEMS} data-testid="nav" />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('NAV');
    expect(ref.current).toBe(screen.getByTestId('nav'));
  });
});
