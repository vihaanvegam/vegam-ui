import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Card } from '../Card';
import { Text } from '../Text';
import { Stack } from './Stack';

const meta: Meta<typeof Stack> = {
  title: 'Components/Stack',
  component: Stack,
  argTypes: {
    direction: { control: 'radio', options: ['column', 'row'] },
    gap: { control: 'select', options: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16] },
    align: { control: 'select', options: ['start', 'center', 'end', 'stretch'] },
    justify: { control: 'select', options: ['start', 'center', 'end', 'between'] },
  },
};

export default meta;

type Story = StoryObj<typeof Stack>;

const boxes = (
  <>
    <Card padding="sm">
      <Text size="sm">one</Text>
    </Card>
    <Card padding="sm">
      <Text size="sm">two</Text>
    </Card>
    <Card padding="sm">
      <Text size="sm">three</Text>
    </Card>
  </>
);

export const Column: Story = {
  args: { direction: 'column', gap: 8, children: boxes },
};

export const Row: Story = {
  args: { direction: 'row', gap: 4, children: boxes },
};

export const GapSteps: Story = {
  render: () => (
    <Stack gap={6}>
      {([1, 2, 4, 8] as const).map((gap) => (
        <Stack key={gap} direction="row" gap={gap} align="center">
          <Badge>gap={gap}</Badge>
          {boxes}
        </Stack>
      ))}
    </Stack>
  ),
};

export const Toolbar: Story = {
  render: () => (
    <Stack direction="row" gap={3} align="center" justify="between">
      <Text weight="semibold">Documents</Text>
      <Stack direction="row" gap={2}>
        <Button variant="secondary" size="sm">
          Import
        </Button>
        <Button size="sm">New</Button>
      </Stack>
    </Stack>
  ),
};

export const Playground: Story = {
  args: { children: boxes },
};
