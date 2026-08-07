import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Flex } from '../Flex';
import { Divider } from './Divider';

const meta: Meta<typeof Divider> = {
  title: 'Components/Divider',
  component: Divider,
  argTypes: {
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    tone: { control: 'radio', options: ['subtle', 'default', 'accent'] },
  },
};

export default meta;

type Story = StoryObj<typeof Divider>;

export const Horizontal: Story = {
  render: () => (
    <div>
      <p>Above the rule</p>
      <Divider />
      <p>Below the rule</p>
    </div>
  ),
};

export const Tones: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--ui-space-4)' }}>
      <Divider tone="subtle" />
      <Divider tone="default" />
      <Divider tone="accent" />
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <Flex gap={4} align="center">
      <span>Left</span>
      <Divider orientation="vertical" />
      <span>Right</span>
    </Flex>
  ),
};

export const DarkScheme: Story = {
  render: () => (
    <ThemeProvider colorScheme="dark">
      <div
        style={{
          background: 'var(--ui-color-surface-page)',
          color: 'var(--ui-text-primary)',
          padding: 'var(--ui-space-6)',
          display: 'grid',
          gap: 'var(--ui-space-4)',
        }}
      >
        <Divider tone="subtle" />
        <Divider tone="default" />
        <Divider tone="accent" />
      </div>
    </ThemeProvider>
  ),
};

export const Playground: Story = {
  render: (args) =>
    args.orientation === 'vertical' ? (
      <Flex gap={4} align="center">
        <span>Left</span>
        <Divider {...args} />
        <span>Right</span>
      </Flex>
    ) : (
      <div>
        <p>Above</p>
        <Divider {...args} />
        <p>Below</p>
      </div>
    ),
};
