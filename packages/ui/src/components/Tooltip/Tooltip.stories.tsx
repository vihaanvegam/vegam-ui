import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { Tooltip } from './Tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  args: { content: 'Saves your work' },
  argTypes: {
    children: { control: false },
    content: { control: 'text' },
    side: { control: 'radio', options: ['top', 'right', 'bottom', 'left'] },
    align: { control: 'radio', options: ['start', 'center', 'end'] },
    delay: { control: { type: 'number', min: 0, max: 1000, step: 50 } },
    disabled: { control: 'boolean' },
    slotProps: { control: false },
  },
  render: (args) => (
    <div style={{ padding: 'var(--ui-space-16)', display: 'flex', justifyContent: 'center' }}>
      <Tooltip {...args}>
        <Button>Hover or focus me</Button>
      </Tooltip>
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Basic: Story = {};

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
        <Tooltip key={side} content={`Side: ${side}`} side={side}>
          <Button variant="secondary">{side}</Button>
        </Tooltip>
      ))}
    </div>
  ),
};

/** The canonical use: naming an icon-only control's purpose. */
export const OnIconButton: Story = {
  render: () => (
    <div style={{ padding: 'var(--ui-space-16)', display: 'flex', justifyContent: 'center' }}>
      <Tooltip content="Close this panel">
        <IconButton aria-label="Close">
          <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" fill="none">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </IconButton>
      </Tooltip>
    </div>
  ),
};

export const AlwaysOpen: Story = {
  name: 'Controlled (always open)',
  args: { open: true },
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
        <Tooltip content="Saves your work" open>
          <Button>Save</Button>
        </Tooltip>
      </div>
    </ThemeProvider>
  ),
};

export const Playground: Story = {};
