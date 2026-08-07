import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Textarea } from './Textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  args: {
    'aria-label': 'Notes',
    placeholder: 'Write something…',
  },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    minRows: { control: { type: 'number', min: 1, max: 10 } },
    maxRows: { control: { type: 'number', min: 1, max: 20 } },
    rows: { control: { type: 'number', min: 1, max: 10 } },
    disabled: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof Textarea>;

export const Basic: Story = { args: { rows: 3 } };

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--ui-space-4)' }}>
      <Textarea aria-label="Small" size="sm" rows={2} placeholder="sm" />
      <Textarea aria-label="Medium" size="md" rows={2} placeholder="md" />
      <Textarea aria-label="Large" size="lg" rows={2} placeholder="lg" />
    </div>
  ),
};

export const Autosize: Story = {
  args: {
    minRows: 2,
    maxRows: 6,
    placeholder: 'Type — the height follows the content between 2 and 6 rows.',
  },
};

export const Invalid: Story = {
  args: { 'aria-invalid': true, defaultValue: 'Way too long…', rows: 3 },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'Read only content', rows: 3 },
};

export const DarkScheme: Story = {
  render: () => (
    <ThemeProvider colorScheme="dark">
      <div style={{ background: 'var(--ui-color-surface-page)', padding: 'var(--ui-space-6)' }}>
        <Textarea aria-label="Notes" rows={3} placeholder="Write something…" />
      </div>
    </ThemeProvider>
  ),
};

export const Playground: Story = {};
