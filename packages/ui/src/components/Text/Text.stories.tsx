import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from './Text';

const meta: Meta<typeof Text> = {
  title: 'Components/Text',
  component: Text,
  args: {
    children: 'The quick brown fox jumps over the lazy dog.',
  },
  argTypes: {
    as: {
      control: 'select',
      options: ['p', 'span', 'div', 'label', 'strong', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    },
    size: {
      control: 'select',
      options: ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl', 'display'],
    },
    weight: { control: 'radio', options: ['regular', 'medium', 'semibold', 'bold'] },
    tone: {
      control: 'select',
      options: ['primary', 'muted', 'disabled', 'danger', 'success', 'warning'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Text>;

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--ui-space-3)' }}>
      {(['display', 'xxxl', 'xxl', 'xl', 'lg', 'md', 'sm', 'xs', 'xxs'] as const).map((size) => (
        <Text key={size} size={size}>
          Size {size} on the type scale
        </Text>
      ))}
    </div>
  ),
};

export const Weights: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--ui-space-3)' }}>
      <Text weight="regular">Regular weight</Text>
      <Text weight="medium">Medium weight</Text>
      <Text weight="semibold">Semibold weight</Text>
      <Text weight="bold">Bold weight</Text>
    </div>
  ),
};

export const Tones: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--ui-space-3)' }}>
      <Text tone="primary">Primary tone</Text>
      <Text tone="muted">Muted tone</Text>
      <Text tone="disabled">Disabled tone</Text>
      <Text tone="danger">Danger tone</Text>
      <Text tone="success">Success tone</Text>
      <Text tone="warning">Warning tone</Text>
    </div>
  ),
};

export const SemanticHeadings: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--ui-space-3)' }}>
      <Text as="h1" size="display">
        An h1 rendered at the display size
      </Text>
      <Text as="h2" size="xxxl">
        An h2 rendered at xxxl
      </Text>
      <Text as="h3" size="xl">
        An h3 rendered at xl
      </Text>
      <Text size="md" tone="muted">
        Body copy stays a paragraph — the outline is real, the sizes are free.
      </Text>
    </div>
  ),
};

export const Playground: Story = {};
