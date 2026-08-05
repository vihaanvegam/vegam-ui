import { useId, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: {
    'aria-label': 'Example checkbox',
  },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof Checkbox>;

function LabeledCheckbox(props: { label: string; size?: 'sm' | 'md' | 'lg'; disabled?: boolean }) {
  const id = useId();
  return (
    <Stack direction="row" gap={2} align="center">
      <Checkbox id={id} size={props.size} disabled={props.disabled} />
      <label htmlFor={id}>
        <Text as="span" size="sm">
          {props.label}
        </Text>
      </label>
    </Stack>
  );
}

export const Default: Story = {};

export const WithLabels: Story = {
  render: () => (
    <Stack gap={3}>
      <LabeledCheckbox label="Small" size="sm" />
      <LabeledCheckbox label="Medium" size="md" />
      <LabeledCheckbox label="Large" size="lg" />
      <LabeledCheckbox label="Disabled" disabled />
    </Stack>
  ),
};

export const Indeterminate: Story = {
  render: function IndeterminateExample() {
    const [items, setItems] = useState([true, false, true]);
    const allChecked = items.every(Boolean);
    const someChecked = items.some(Boolean);
    return (
      <Stack gap={2}>
        <Stack direction="row" gap={2} align="center">
          <Checkbox
            aria-label="Select all"
            checked={allChecked}
            indeterminate={!allChecked && someChecked}
            onChange={(e) => setItems(items.map(() => e.target.checked))}
          />
          <Text size="sm" weight="semibold">
            Select all
          </Text>
        </Stack>
        {items.map((checked, index) => (
          <Stack key={index} direction="row" gap={2} align="center" style={{ paddingLeft: 24 }}>
            <Checkbox
              aria-label={`Item ${index + 1}`}
              checked={checked}
              onChange={(e) =>
                setItems(items.map((value, i) => (i === index ? e.target.checked : value)))
              }
            />
            <Text size="sm">Item {index + 1}</Text>
          </Stack>
        ))}
      </Stack>
    );
  },
};

export const DarkScheme: Story = {
  render: () => (
    <ThemeProvider colorScheme="dark">
      <Stack
        gap={3}
        style={{ background: 'var(--ui-color-bg-canvas)', padding: 'var(--ui-space-6)' }}
      >
        <LabeledCheckbox label="Dark scheme checkbox" />
        <LabeledCheckbox label="Disabled" disabled />
      </Stack>
    </ThemeProvider>
  ),
};

export const Playground: Story = {};
