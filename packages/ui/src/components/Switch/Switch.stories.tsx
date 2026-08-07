import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Switch } from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  args: { 'aria-label': 'Notifications' },
  argTypes: {
    disabled: { control: 'boolean' },
    defaultChecked: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof Switch>;

export const Off: Story = {};
export const On: Story = { args: { defaultChecked: true } };

export const WithLabel: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ui-space-3)',
        fontFamily: 'var(--ui-font-family-sans)',
        color: 'var(--ui-text-primary)',
      }}
    >
      <label htmlFor="notify">Email notifications</label>
      <Switch id="notify" defaultChecked />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ui-space-4)' }}>
      <Switch aria-label="Off disabled" disabled />
      <Switch aria-label="On disabled" disabled defaultChecked />
    </div>
  ),
};

export const DarkScheme: Story = {
  render: () => (
    <ThemeProvider colorScheme="dark">
      <div
        style={{
          background: 'var(--ui-color-surface-page)',
          padding: 'var(--ui-space-6)',
          display: 'flex',
          gap: 'var(--ui-space-4)',
        }}
      >
        <Switch aria-label="Off" />
        <Switch aria-label="On" defaultChecked />
      </div>
    </ThemeProvider>
  ),
};

export const Playground: Story = {};
