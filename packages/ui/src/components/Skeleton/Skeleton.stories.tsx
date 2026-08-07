import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Skeleton } from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  argTypes: {
    variant: { control: 'radio', options: ['text', 'rect', 'circle'] },
    width: { control: 'text' },
    height: { control: 'text' },
    lines: { control: { type: 'number', min: 1, max: 6 } },
    radius: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl', 'full'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Skeleton>;

export const Text: Story = { args: { lines: 3 } };

export const Shapes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ui-space-4)', alignItems: 'center' }}>
      <Skeleton variant="circle" width="3rem" />
      <Skeleton variant="rect" width="8rem" height="3rem" radius="md" />
      <Skeleton variant="text" width="10rem" />
    </div>
  ),
};

/** The shape-of-what-is-coming pattern: a card placeholder. */
export const CardPlaceholder: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: 'var(--ui-space-3)',
        padding: 'var(--ui-space-4)',
        border: 'var(--ui-border-width-hairline) solid var(--ui-color-border-default)',
        borderRadius: 'var(--ui-radius-lg)',
        maxInlineSize: '22rem',
      }}
    >
      <Skeleton variant="circle" width="2.5rem" />
      <div style={{ flex: 1 }}>
        <Skeleton width="60%" />
        <Skeleton lines={2} />
      </div>
    </div>
  ),
};

export const DarkScheme: Story = {
  render: () => (
    <ThemeProvider colorScheme="dark">
      <div style={{ background: 'var(--ui-color-surface-page)', padding: 'var(--ui-space-6)' }}>
        <Skeleton lines={3} />
      </div>
    </ThemeProvider>
  ),
};

export const Playground: Story = {};
