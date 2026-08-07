import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Input } from '../Input';
import { Select } from '../Select';
import { Textarea } from '../Textarea';
import { Field } from './Field';

const meta: Meta<typeof Field> = {
  title: 'Components/Field',
  component: Field,
  args: {
    label: 'Email address',
    description: 'We only use this for receipts.',
  },
  argTypes: {
    children: { control: false },
    label: { control: 'text' },
    description: { control: 'text' },
    error: { control: 'text' },
    requiredMarker: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    slotProps: { control: false },
  },
  render: (args) => (
    <Field {...args}>
      <Input type="email" placeholder="you@example.com" />
    </Field>
  ),
};

export default meta;

type Story = StoryObj<typeof Field>;

export const Basic: Story = {};

export const WithError: Story = {
  args: { error: 'Enter a valid email address.' },
};

export const Required: Story = {
  args: { required: true, requiredMarker: '*' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const WithSelect: Story = {
  args: { label: 'Fruit', description: 'Pick your favourite.' },
  render: (args) => (
    <Field {...args}>
      <Select
        placeholder="Choose…"
        options={[
          { value: 'apple', label: 'Apple' },
          { value: 'pear', label: 'Pear' },
        ]}
      />
    </Field>
  ),
};

export const WithTextarea: Story = {
  args: { label: 'Notes', description: undefined },
  render: (args) => (
    <Field {...args}>
      <Textarea minRows={2} maxRows={5} placeholder="Anything else?" />
    </Field>
  ),
};

export const DarkScheme: Story = {
  render: () => (
    <ThemeProvider colorScheme="dark">
      <div style={{ background: 'var(--ui-color-surface-page)', padding: 'var(--ui-space-6)' }}>
        <Field label="Email address" description="We only use this for receipts." error="Required">
          <Input type="email" />
        </Field>
      </div>
    </ThemeProvider>
  ),
};

export const Playground: Story = {};
