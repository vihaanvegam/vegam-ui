import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Flex } from './Flex';

const item: CSSProperties = {
  background: 'var(--ui-color-surface-subtle)',
  borderRadius: 'var(--ui-radius-sm)',
  padding: 'var(--ui-space-3)',
};

const meta: Meta<typeof Flex> = {
  title: 'Components/Flex',
  component: Flex,
  args: { gap: 4 },
  argTypes: {
    children: { control: false },
    direction: { control: 'radio', options: ['row', 'column', 'row-reverse', 'column-reverse'] },
    wrap: { control: 'radio', options: ['nowrap', 'wrap', 'wrap-reverse'] },
    align: { control: 'radio', options: ['start', 'center', 'end', 'stretch', 'baseline'] },
    justify: {
      control: 'radio',
      options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
    },
    gap: { control: 'select', options: [0, 1, 2, 3, 4, 6, 8, 12] },
  },
  render: (args) => (
    <Flex {...args}>
      <div style={item}>One</div>
      <div style={{ ...item, paddingBlock: 'var(--ui-space-6)' }}>Two (taller)</div>
      <div style={item}>Three</div>
    </Flex>
  ),
};

export default meta;

type Story = StoryObj<typeof Flex>;

export const Row: Story = { args: { align: 'center' } };

export const Column: Story = { args: { direction: 'column' } };

export const SpaceBetween: Story = { args: { justify: 'between', align: 'center' } };

export const Wrapping: Story = {
  render: () => (
    <Flex gap={2} wrap="wrap" style={{ maxInlineSize: '16rem' }}>
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} style={item}>
          Item {i + 1}
        </div>
      ))}
    </Flex>
  ),
};

export const ResponsiveDirection: Story = {
  render: () => (
    <Flex gap={4} direction={{ base: 'column', laptop: 'row' }}>
      <div style={item}>Stacks below laptop</div>
      <div style={item}>Rows from laptop up</div>
    </Flex>
  ),
};

export const DarkScheme: Story = {
  render: () => (
    <ThemeProvider colorScheme="dark">
      <Flex
        gap={4}
        style={{ background: 'var(--ui-color-surface-page)', padding: 'var(--ui-space-6)' }}
      >
        <div style={item}>One</div>
        <div style={item}>Two</div>
      </Flex>
    </ThemeProvider>
  ),
};

export const Playground: Story = {};
