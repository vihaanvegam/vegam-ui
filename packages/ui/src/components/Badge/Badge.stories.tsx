import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  args: {
    children: 'Badge',
  },
  argTypes: {
    tone: {
      control: 'select',
      options: ['neutral', 'info', 'success', 'warning', 'danger'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const Neutral: Story = { args: { tone: 'neutral', children: 'Neutral' } };
export const Info: Story = { args: { tone: 'info', children: 'Info' } };
export const Success: Story = { args: { tone: 'success', children: 'Success' } };
export const Warning: Story = { args: { tone: 'warning', children: 'Warning' } };
export const Danger: Story = { args: { tone: 'danger', children: 'Danger' } };

export const AllTones: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ui-space-3)' }}>
      <Badge tone="neutral">Neutral</Badge>
      <Badge tone="info">Info</Badge>
      <Badge tone="success">Success</Badge>
      <Badge tone="warning">Warning</Badge>
      <Badge tone="danger">Danger</Badge>
    </div>
  ),
};

export const DarkScheme: Story = {
  render: () => (
    <ThemeProvider colorScheme="dark">
      <div
        style={{
          background: 'var(--ui-color-bg-canvas)',
          padding: 'var(--ui-space-6)',
          display: 'flex',
          gap: 'var(--ui-space-3)',
        }}
      >
        <Badge tone="neutral">Neutral</Badge>
        <Badge tone="info">Info</Badge>
        <Badge tone="success">Success</Badge>
        <Badge tone="warning">Warning</Badge>
        <Badge tone="danger">Danger</Badge>
      </div>
    </ThemeProvider>
  ),
};

export const Playground: Story = {};
