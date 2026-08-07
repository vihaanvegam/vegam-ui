import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  args: { name: 'Ada Lovelace' },
  argTypes: {
    children: { control: false },
    size: { control: 'radio', options: ['sm', 'md', 'lg', 'xl'] },
    shape: { control: 'radio', options: ['circle', 'square'] },
    name: { control: 'text' },
    initials: { control: 'text' },
    src: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof Avatar>;

export const Initials: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ui-space-3)', alignItems: 'center' }}>
      <Avatar name="Ada Lovelace" size="sm" />
      <Avatar name="Ada Lovelace" size="md" />
      <Avatar name="Ada Lovelace" size="lg" />
      <Avatar name="Ada Lovelace" size="xl" />
    </div>
  ),
};

export const Shapes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ui-space-3)', alignItems: 'center' }}>
      <Avatar name="Ada Lovelace" size="lg" shape="circle" />
      <Avatar name="Ada Lovelace" size="lg" shape="square" />
    </div>
  ),
};

/** A broken image falls back to initials, so identity survives. */
export const BrokenImageFallsBack: Story = {
  args: { src: '/this-image-does-not-exist.png', size: 'lg' },
};

export const Group: Story = {
  render: () => (
    <div style={{ display: 'flex' }}>
      {['Ada Lovelace', 'Grace Hopper', 'Alan Turing'].map((name, index) => (
        <Avatar
          key={name}
          name={name}
          size="lg"
          style={{
            marginInlineStart: index === 0 ? 0 : 'calc(-1 * var(--ui-space-2))',
            boxShadow: '0 0 0 2px var(--ui-color-surface-page)',
          }}
        />
      ))}
    </div>
  ),
};

export const DarkScheme: Story = {
  render: () => (
    <ThemeProvider colorScheme="dark">
      <div style={{ background: 'var(--ui-color-surface-page)', padding: 'var(--ui-space-6)' }}>
        <Avatar name="Ada Lovelace" size="lg" />
      </div>
    </ThemeProvider>
  ),
};

export const Playground: Story = {};
