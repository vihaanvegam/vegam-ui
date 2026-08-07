import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Grid } from './Grid';

const cell: CSSProperties = {
  background: 'var(--ui-color-surface-subtle)',
  borderRadius: 'var(--ui-radius-sm)',
  padding: 'var(--ui-space-3)',
  textAlign: 'center',
};

const cells = (count: number) =>
  Array.from({ length: count }, (_, i) => (
    <div key={i} style={cell}>
      {i + 1}
    </div>
  ));

const meta: Meta<typeof Grid> = {
  title: 'Components/Grid',
  component: Grid,
  args: { columns: 3, gap: 4 },
  argTypes: {
    children: { control: false },
    columns: { control: { type: 'number', min: 1, max: 12 } },
    gap: { control: 'select', options: [0, 1, 2, 3, 4, 6, 8] },
    rowGap: { control: 'select', options: [0, 1, 2, 3, 4, 6, 8] },
    columnGap: { control: 'select', options: [0, 1, 2, 3, 4, 6, 8] },
  },
  render: (args) => <Grid {...args}>{cells(6)}</Grid>,
};

export default meta;

type Story = StoryObj<typeof Grid>;

export const Columns: Story = {};

export const ResponsiveColumns: Story = {
  render: () => (
    <Grid columns={{ base: 1, tablet: 2, desktop: 4 }} gap={4}>
      {cells(8)}
    </Grid>
  ),
};

export const AxisGaps: Story = {
  render: () => (
    <Grid columns={3} gap={2} rowGap={8}>
      {cells(6)}
    </Grid>
  ),
};

export const DarkScheme: Story = {
  render: () => (
    <ThemeProvider colorScheme="dark">
      <div style={{ background: 'var(--ui-color-surface-page)', padding: 'var(--ui-space-6)' }}>
        <Grid columns={3} gap={4}>
          {cells(6)}
        </Grid>
      </div>
    </ThemeProvider>
  ),
};

export const Playground: Story = {};
