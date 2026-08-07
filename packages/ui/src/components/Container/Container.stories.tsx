import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Container } from './Container';
import type { ContainerSize } from './Container.types';

const content: CSSProperties = {
  background: 'var(--ui-color-surface-subtle)',
  borderRadius: 'var(--ui-radius-md)',
  padding: 'var(--ui-space-4)',
  textAlign: 'center',
};

const meta: Meta<typeof Container> = {
  title: 'Components/Container',
  component: Container,
  parameters: { layout: 'fullscreen' },
  args: { size: 'desktop' },
  argTypes: {
    children: { control: false },
    as: { control: 'select', options: ['div', 'section', 'article', 'main'] },
    size: { control: 'radio', options: ['tablet', 'laptop', 'desktop', 'wide'] },
  },
  render: (args) => (
    <Container {...args}>
      <div style={content}>
        Capped at --ui-viewport-{args.size}-content-max, centered, page margins from the current
        breakpoint.
      </div>
    </Container>
  ),
};

export default meta;

type Story = StoryObj<typeof Container>;

export const Desktop: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--ui-space-4)' }}>
      {(['tablet', 'laptop', 'desktop', 'wide'] as ContainerSize[]).map((size) => (
        <Container key={size} size={size}>
          <div style={content}>{size}</div>
        </Container>
      ))}
    </div>
  ),
};

export const DarkScheme: Story = {
  render: () => (
    <ThemeProvider colorScheme="dark">
      <div
        style={{ background: 'var(--ui-color-surface-page)', paddingBlock: 'var(--ui-space-6)' }}
      >
        <Container size="laptop">
          <div style={content}>Dark scheme container</div>
        </Container>
      </div>
    </ThemeProvider>
  ),
};

export const Playground: Story = {};
