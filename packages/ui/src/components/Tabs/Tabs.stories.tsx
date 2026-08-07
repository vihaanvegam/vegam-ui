import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Tabs } from './Tabs';
import type { TabItem } from './Tabs.types';

const items: TabItem[] = [
  { value: 'account', label: 'Account', content: 'Your profile and sign-in details.' },
  { value: 'billing', label: 'Billing', content: 'Plan, invoices, and payment method.' },
  { value: 'locked', label: 'Locked', content: 'Unavailable.', disabled: true },
  { value: 'team', label: 'Team', content: 'Invite people and manage roles.' },
];

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  args: { items, label: 'Settings' },
  argTypes: {
    items: { control: false },
    slotProps: { control: false },
    label: { control: 'text' },
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    activation: { control: 'radio', options: ['automatic', 'manual'] },
  },
};

export default meta;

type Story = StoryObj<typeof Tabs>;

export const Horizontal: Story = {};

export const Vertical: Story = { args: { orientation: 'vertical' } };

/** Arrows move focus only; Enter or Space commits. Use when a panel is expensive. */
export const ManualActivation: Story = { args: { activation: 'manual' } };

export const DarkScheme: Story = {
  render: () => (
    <ThemeProvider colorScheme="dark">
      <div style={{ background: 'var(--ui-color-surface-page)', padding: 'var(--ui-space-6)' }}>
        <Tabs items={items} label="Settings" />
      </div>
    </ThemeProvider>
  ),
};

export const Playground: Story = {};
