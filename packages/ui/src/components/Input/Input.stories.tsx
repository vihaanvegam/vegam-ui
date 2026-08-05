import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  args: {
    'aria-label': 'Example input',
    placeholder: 'Type here…',
  },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--ui-space-4)', maxWidth: 320 }}>
      <Input aria-label="Small" size="sm" placeholder="Small" />
      <Input aria-label="Medium" size="md" placeholder="Medium" />
      <Input aria-label="Large" size="lg" placeholder="Large" />
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'Read only value' },
};

export const Invalid: Story = {
  args: { 'aria-invalid': true, defaultValue: 'not-an-email' },
};

export const DarkScheme: Story = {
  render: () => (
    <ThemeProvider colorScheme="dark">
      <div
        style={{
          background: 'var(--ui-color-bg-canvas)',
          padding: 'var(--ui-space-6)',
          display: 'grid',
          gap: 'var(--ui-space-4)',
          maxWidth: 320,
        }}
      >
        <Input aria-label="Dark default" placeholder="Dark scheme" />
        <Input aria-label="Dark invalid" aria-invalid="true" defaultValue="invalid value" />
        <Input aria-label="Dark disabled" disabled defaultValue="disabled" />
      </div>
    </ThemeProvider>
  ),
};

export const Playground: Story = {};
