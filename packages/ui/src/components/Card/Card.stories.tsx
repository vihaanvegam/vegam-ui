import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Text } from '../Text';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  argTypes: {
    variant: { control: 'radio', options: ['outlined', 'elevated'] },
    padding: { control: 'radio', options: ['none', 'sm', 'md', 'lg'] },
  },
};

export default meta;

type Story = StoryObj<typeof Card>;

function SampleContent() {
  return (
    <div style={{ display: 'grid', gap: 'var(--ui-space-2)' }}>
      <Text as="h3" size="xl" weight="semibold">
        Card title
      </Text>
      <Text size="sm" tone="muted">
        Supporting copy that lives inside the card surface.
      </Text>
    </div>
  );
}

export const Outlined: Story = {
  args: { variant: 'outlined', children: <SampleContent /> },
};

export const Elevated: Story = {
  args: { variant: 'elevated', children: <SampleContent /> },
};

export const PaddingSteps: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--ui-space-4)', maxWidth: 420 }}>
      {(['none', 'sm', 'md', 'lg'] as const).map((padding) => (
        <Card key={padding} padding={padding}>
          <Text size="sm">padding=&quot;{padding}&quot;</Text>
        </Card>
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
          padding: 'var(--ui-space-6)',
          display: 'grid',
          gap: 'var(--ui-space-4)',
          maxWidth: 420,
        }}
      >
        <Card variant="outlined">
          <SampleContent />
        </Card>
        <Card variant="elevated">
          <SampleContent />
        </Card>
      </div>
    </ThemeProvider>
  ),
};

export const Playground: Story = {
  args: { children: <SampleContent /> },
};
