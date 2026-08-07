import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Progress } from './Progress';

const meta: Meta<typeof Progress> = {
  title: 'Components/Progress',
  component: Progress,
  args: { 'aria-label': 'Upload', value: 60 },
  argTypes: {
    value: { control: { type: 'number', min: 0, max: 100 } },
    size: { control: 'radio', options: ['sm', 'md'] },
    tone: { control: 'radio', options: ['primary', 'success', 'warning', 'danger'] },
  },
};

export default meta;

type Story = StoryObj<typeof Progress>;

export const Determinate: Story = {};

export const Indeterminate: Story = {
  args: { value: undefined, 'aria-label': 'Working' },
};

export const Tones: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--ui-space-4)' }}>
      <Progress aria-label="Primary" value={40} tone="primary" />
      <Progress aria-label="Success" value={100} tone="success" />
      <Progress aria-label="Warning" value={70} tone="warning" />
      <Progress aria-label="Danger" value={25} tone="danger" />
    </div>
  ),
};

export const WithValueText: Story = {
  args: { value: 3, max: 10, valueText: '3 of 10 files', 'aria-label': 'Uploading files' },
};

export const DarkScheme: Story = {
  render: () => (
    <ThemeProvider colorScheme="dark">
      <div style={{ background: 'var(--ui-color-surface-page)', padding: 'var(--ui-space-6)' }}>
        <Progress aria-label="Upload" value={60} />
      </div>
    </ThemeProvider>
  ),
};

export const Playground: Story = {};
