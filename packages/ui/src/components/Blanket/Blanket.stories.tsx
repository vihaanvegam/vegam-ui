import type { Meta, StoryObj } from '@storybook/react-vite';
import { Blanket } from './Blanket';

const meta: Meta<typeof Blanket> = {
  title: 'Components/Blanket',
  component: Blanket,
};

export default meta;

type Story = StoryObj<typeof Blanket>;

// The blanket is a fixed-position scrim; the story gives it something to dim.
export const Default: Story = {
  render: () => (
    <div style={{ minHeight: '12rem', position: 'relative' }}>
      <p style={{ fontFamily: 'var(--ui-font-family-sans)' }}>
        Page content behind the blanket. The scrim dims and blurs everything beneath it; Modal
        composes it automatically.
      </p>
      <Blanket style={{ position: 'absolute' }} />
    </div>
  ),
};

export const Playground: Story = {
  render: () => <Blanket style={{ position: 'absolute', inset: 0 }} />,
};
