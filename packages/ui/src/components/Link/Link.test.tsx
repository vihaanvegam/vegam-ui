import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Link, linkClasses } from './Link';

describe('Link', () => {
  it('renders a real anchor with the default variant', () => {
    render(<Link href="/pricing">Pricing</Link>);
    const link = screen.getByRole('link', { name: 'Pricing' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/pricing');
    expect(link).toHaveClass(linkClasses.root, linkClasses.default);
  });

  it.each(['default', 'subtle', 'standalone'] as const)('applies the %s variant', (variant) => {
    render(
      <Link href="/x" variant={variant}>
        Go
      </Link>,
    );
    expect(screen.getByRole('link')).toHaveClass(linkClasses[variant]);
  });

  it('external sets a safe target/rel pair', () => {
    render(
      <Link href="https://example.test" external newTabLabel="opens in a new tab">
        Docs
      </Link>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('external announces the new tab in the accessible name', () => {
    render(
      <Link href="https://example.test" external newTabLabel="opens in a new tab">
        Docs
      </Link>,
    );
    expect(screen.getByRole('link')).toHaveAccessibleName('Docs opens in a new tab');
  });

  it('does not set target/rel without external', () => {
    render(<Link href="/x">Internal</Link>);
    const link = screen.getByRole('link');
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
  });

  it('explicit target/rel win over the external defaults', () => {
    render(
      <Link href="/x" external target="_self" rel="nofollow" newTabLabel="new tab">
        Custom
      </Link>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_self');
    expect(link).toHaveAttribute('rel', 'nofollow');
  });

  it('slots.anchor swaps the element and still receives href and className', () => {
    const RouterLink = ({ href, children, ...rest }: React.ComponentProps<'a'>) => (
      <a data-router="true" href={href} {...rest}>
        {children}
      </a>
    );
    render(
      <Link href="/dashboard" slots={{ anchor: RouterLink }}>
        Dashboard
      </Link>,
    );
    const link = screen.getByRole('link', { name: 'Dashboard' });
    expect(link).toHaveAttribute('data-router', 'true');
    expect(link).toHaveAttribute('href', '/dashboard');
    expect(link).toHaveClass(linkClasses.root);
  });

  it('honors the theme default variant, explicit winning', () => {
    render(
      <ThemeProvider componentDefaults={{ Link: { variant: 'subtle' } }}>
        <Link href="/a">themed</Link>
        <Link href="/b" variant="standalone">
          explicit
        </Link>
      </ThemeProvider>,
    );
    expect(screen.getByRole('link', { name: 'themed' })).toHaveClass(linkClasses.subtle);
    expect(screen.getByRole('link', { name: 'explicit' })).toHaveClass(linkClasses.standalone);
  });

  it('merges className, spreads rest, forwards ref', () => {
    let node: HTMLAnchorElement | null = null;
    render(
      <Link
        ref={(el) => {
          node = el;
        }}
        href="/x"
        className="custom"
        data-testid="link"
      >
        L
      </Link>,
    );
    expect(screen.getByTestId('link')).toHaveClass(linkClasses.root, 'custom');
    expect(node).toBeInstanceOf(HTMLAnchorElement);
  });
});
