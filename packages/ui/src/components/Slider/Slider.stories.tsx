import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Field } from '../Field';
import { Slider } from './Slider';

const meta: Meta<typeof Slider> = {
  title: 'Components/Slider',
  component: Slider,
  args: { 'aria-label': 'Volume', defaultValue: 30 },
  argTypes: {
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    disabled: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof Slider>;

export const Basic: Story = {};

export const Steps: Story = {
  args: { min: 0, max: 10, step: 2, defaultValue: 4, 'aria-label': 'Rating' },
};

// When the number is not what the user should hear, aria-valuetext carries
// the real value — it is forwarded to the thumb.
export const ValueText: Story = {
  args: {
    min: 0,
    max: 4,
    step: 1,
    defaultValue: 2,
    'aria-label': 'Size',
    'aria-valuetext': 'Medium',
  },
};

export const Disabled: Story = { args: { disabled: true, defaultValue: 60 } };

export const InField: Story = {
  render: () => (
    <Field label="Volume" description="Arrow keys step, Page keys jump.">
      <Slider defaultValue={45} />
    </Field>
  ),
};

export const DarkScheme: Story = {
  render: () => (
    <ThemeProvider colorScheme="dark">
      <div style={{ background: 'var(--ui-color-surface-page)', padding: 'var(--ui-space-6)' }}>
        <Slider aria-label="Volume" defaultValue={70} />
      </div>
    </ThemeProvider>
  ),
};

export const Playground: Story = {};
