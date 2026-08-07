import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Link } from './Link';

const meta: Meta<typeof Link> = {
  title: 'Components/Link',
  component: Link,
  args: { href: '#', children: 'Pricing' },
  argTypes: {
    slots: { control: false },
    variant: { control: 'radio', options: ['default', 'subtle', 'standalone'] },
    external: { control: 'boolean' },
    newTabLabel: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof Link>;

/** In flowing text the underline is the non-colour cue (WCAG 1.4.1). */
export const InProse: Story = {
  render: () => (
    <p
      style={{
        fontFamily: 'var(--ui-font-family-sans)',
        color: 'var(--ui-text-primary)',
        maxInlineSize: '32rem',
      }}
    >
      Usage is metered per seat. See <Link href="#">our pricing</Link> for the current rates, or
      read the{' '}
      <Link href="https://example.test" external newTabLabel="opens in a new tab">
        billing documentation
      </Link>
      .
    </p>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ui-space-6)', alignItems: 'center' }}>
      <Link href="#">default</Link>
      <Link href="#" variant="subtle">
        subtle
      </Link>
      <Link href="#" variant="standalone">
        standalone
      </Link>
    </div>
  ),
};

export const External: Story = {
  args: { external: true, newTabLabel: 'opens in a new tab', children: 'Documentation' },
};

/** `slots.anchor` is the router integration point. */
export const RouterLink: Story = {
  render: () => (
    <Link
      href="/dashboard"
      slots={{
        anchor: ({ href, children, ...rest }) => (
          <a data-router-link="true" href={href} {...rest}>
            {children}
          </a>
        ),
      }}
    >
      Dashboard (via a router link)
    </Link>
  ),
};

export const DarkScheme: Story = {
  render: () => (
    <ThemeProvider colorScheme="dark">
      <div style={{ background: 'var(--ui-color-surface-page)', padding: 'var(--ui-space-6)' }}>
        <Link href="#">Pricing</Link>
      </div>
    </ThemeProvider>
  ),
};

export const Playground: Story = {};
