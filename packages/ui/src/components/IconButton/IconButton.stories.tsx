import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { IconButton } from './IconButton';

// Placeholder glyph — the library ships no icons; consumers pass their own
// (or @vegam-ui/icons once Phase 5 lands).
const glyph = (
  <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" fill="none">
    <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const meta: Meta<typeof IconButton> = {
  title: 'Components/IconButton',
  component: IconButton,
  args: {
    'aria-label': 'Close',
    children: glyph,
  },
  argTypes: {
    children: { control: false },
    variant: { control: 'radio', options: ['primary', 'secondary', 'danger', 'ghost'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof IconButton>;

export const Ghost: Story = {};
export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Danger: Story = { args: { variant: 'danger' } };

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ui-space-4)', alignItems: 'center' }}>
      <IconButton aria-label="Close" size="sm">
        {glyph}
      </IconButton>
      <IconButton aria-label="Close" size="md">
        {glyph}
      </IconButton>
      <IconButton aria-label="Close" size="lg">
        {glyph}
      </IconButton>
    </div>
  ),
};

export const Disabled: Story = { args: { disabled: true, variant: 'primary' } };

export const DarkScheme: Story = {
  render: () => (
    <ThemeProvider colorScheme="dark">
      <div
        style={{
          background: 'var(--ui-color-surface-page)',
          padding: 'var(--ui-space-6)',
          display: 'flex',
          gap: 'var(--ui-space-4)',
        }}
      >
        <IconButton aria-label="Close" variant="primary">
          {glyph}
        </IconButton>
        <IconButton aria-label="Close" variant="secondary">
          {glyph}
        </IconButton>
        <IconButton aria-label="Close" variant="ghost">
          {glyph}
        </IconButton>
      </div>
    </ThemeProvider>
  ),
};

export const Playground: Story = {};
