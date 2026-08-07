import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Components/Spinner',
  component: Spinner,
  args: { label: 'Loading' },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof Spinner>;

export const Basic: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ui-space-6)', alignItems: 'center' }}>
      <Spinner size="sm" label="Small" />
      <Spinner size="md" label="Medium" />
      <Spinner size="lg" label="Large" />
    </div>
  ),
};

export const Decorative: Story = {
  name: 'Decorative (no label)',
  args: { label: undefined },
};

export const InlineWithText: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ui-space-2)',
        fontFamily: 'var(--ui-font-family-sans)',
        color: 'var(--ui-text-primary)',
      }}
    >
      <Spinner size="sm" />
      <span>Loading your projects…</span>
    </div>
  ),
};

export const DarkScheme: Story = {
  render: () => (
    <ThemeProvider colorScheme="dark">
      <div style={{ background: 'var(--ui-color-surface-page)', padding: 'var(--ui-space-6)' }}>
        <Spinner label="Loading" />
      </div>
    </ThemeProvider>
  ),
};

export const Playground: Story = {};
