import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Button } from '../Button';
import { Field } from '../Field';
import { Input } from '../Input';
import { Stack } from '../Stack';
import { Popover } from './Popover';

const meta: Meta<typeof Popover> = {
  title: 'Components/Popover',
  component: Popover,
  args: { label: 'Filters', content: 'Anything can live in here.' },
  argTypes: {
    children: { control: false },
    content: { control: false },
    label: { control: 'text' },
    side: { control: 'radio', options: ['top', 'right', 'bottom', 'left'] },
    align: { control: 'radio', options: ['start', 'center', 'end'] },
    initialFocus: { control: 'boolean' },
    slotProps: { control: false },
  },
  render: (args) => (
    <div style={{ padding: 'var(--ui-space-16)', display: 'flex', justifyContent: 'center' }}>
      <Popover {...args}>
        <Button>Open popover</Button>
      </Popover>
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof Popover>;

export const Basic: Story = {};

/** Unlike Tooltip, the surface may contain interactive content. */
export const WithForm: Story = {
  args: {
    label: 'Rename project',
    content: (
      <Stack gap={3}>
        <Field label="Project name">
          <Input defaultValue="Untitled" />
        </Field>
        <Button size="sm">Save</Button>
      </Stack>
    ),
  },
};

export const Sides: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, auto)',
        gap: 'var(--ui-space-4)',
        justifyContent: 'center',
        padding: 'var(--ui-space-16)',
      }}
    >
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Popover key={side} label={`Popover ${side}`} side={side} content={`Side: ${side}`}>
          <Button variant="secondary">{side}</Button>
        </Popover>
      ))}
    </div>
  ),
};

export const DarkScheme: Story = {
  render: () => (
    <ThemeProvider colorScheme="dark">
      <div
        style={{
          background: 'var(--ui-color-surface-page)',
          padding: 'var(--ui-space-16)',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Popover label="Filters" defaultOpen content="Dark scheme surface">
          <Button>Open</Button>
        </Popover>
      </div>
    </ThemeProvider>
  ),
};

export const Playground: Story = {};
