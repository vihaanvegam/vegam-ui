import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Field } from '../Field';
import { Radio } from './Radio';
import { RadioGroup } from './RadioGroup';

const row: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--ui-space-2)',
  fontFamily: 'var(--ui-font-family-sans)',
  color: 'var(--ui-text-primary)',
};

const plans = (
  <>
    <label style={row}>
      <Radio value="basic" /> Basic
    </label>
    <label style={row}>
      <Radio value="pro" /> Pro
    </label>
    <label style={row}>
      <Radio value="team" /> Team
    </label>
  </>
);

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/Radio',
  component: RadioGroup,
  args: { defaultValue: 'pro', 'aria-label': 'Plan' },
  argTypes: {
    children: { control: false },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  render: (args) => <RadioGroup {...args}>{plans}</RadioGroup>,
};

export default meta;

type Story = StoryObj<typeof RadioGroup>;

export const Basic: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ui-space-8)' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <RadioGroup key={size} aria-label={`Plan ${size}`} size={size} defaultValue="basic">
          {plans}
        </RadioGroup>
      ))}
    </div>
  ),
};

export const Disabled: Story = { args: { disabled: true } };

export const InField: Story = {
  render: () => (
    <Field label="Plan" description="You can change this later." error="Pick a plan." required>
      <RadioGroup>{plans}</RadioGroup>
    </Field>
  ),
};

export const DarkScheme: Story = {
  render: () => (
    <ThemeProvider colorScheme="dark">
      <div style={{ background: 'var(--ui-color-surface-page)', padding: 'var(--ui-space-6)' }}>
        <RadioGroup aria-label="Plan" defaultValue="pro">
          {plans}
        </RadioGroup>
      </div>
    </ThemeProvider>
  ),
};

export const Playground: Story = {};
