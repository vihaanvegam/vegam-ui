import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Badge } from '../Badge';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { Select } from './Select';
import type { SelectOption } from './Select.types';

const FRUIT: SelectOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
  { value: 'date', label: 'Date' },
  { value: 'elderberry', label: 'Elderberry' },
  { value: 'fig', label: 'Fig' },
  { value: 'grape', label: 'Grape' },
];

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  args: {
    'aria-label': 'Fruit',
    options: FRUIT,
    placeholder: 'Pick a fruitâ€¦',
  },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 280 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Select>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <Stack gap={4}>
      <Select {...args} aria-label="Small" size="sm" />
      <Select {...args} aria-label="Medium" size="md" />
      <Select {...args} aria-label="Large" size="lg" />
    </Stack>
  ),
};

export const Preselected: Story = {
  args: { defaultValue: 'banana' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Controlled: Story = {
  render: function ControlledExample(args) {
    const [value, setValue] = useState('apple');
    return (
      <Stack gap={3}>
        <Select {...args} aria-label="Fruit" value={value} onChange={setValue} />
        <Text size="sm" tone="muted">
          Selected value: {value}
        </Text>
      </Stack>
    );
  },
};

export const CustomOptionSlot: Story = {
  args: {
    defaultValue: 'date',
    slots: {
      option: ({ option, selected }) => (
        <Stack direction="row" gap={2} align="center" justify="between" style={{ width: '100%' }}>
          <span>{option.label}</span>
          {selected ? <Badge tone="info">selected</Badge> : null}
        </Stack>
      ),
    },
  },
};

export const DarkScheme: Story = {
  render: (args) => (
    <ThemeProvider colorScheme="dark">
      <div style={{ background: 'var(--ui-color-surface-page)', padding: 'var(--ui-space-6)' }}>
        <Select {...args} aria-label="Dark fruit" defaultValue="apple" />
      </div>
    </ThemeProvider>
  ),
};

export const Playground: Story = {};
