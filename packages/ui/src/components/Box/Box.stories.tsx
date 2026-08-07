import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Box } from './Box';

const meta: Meta<typeof Box> = {
  title: 'Components/Box',
  component: Box,
  args: {
    children: 'Box content',
    p: 4,
    bg: 'subtle',
    radius: 'md',
  },
  argTypes: {
    children: { control: false },
    as: { control: 'select', options: ['div', 'section', 'article', 'aside', 'span'] },
    p: { control: 'select', options: [0, 0.5, 1, 2, 3, 4, 6, 8, 12] },
    px: { control: 'select', options: [0, 1, 2, 4, 6, 8] },
    py: { control: 'select', options: [0, 1, 2, 4, 6, 8] },
    m: { control: 'select', options: [0, 1, 2, 4, 6, 8] },
    bg: { control: 'radio', options: ['page', 'subtle', 'disabled'] },
    radius: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl', 'full'],
    },
    borderColor: { control: 'radio', options: ['default', 'hover', 'error', 'focus'] },
    shadow: { control: 'radio', options: ['sm', 'md', 'lg', 'xl'] },
    // Side props stay code-only in the playground to keep the control panel scannable.
    pt: { control: false },
    pr: { control: false },
    pb: { control: false },
    pl: { control: false },
    mx: { control: false },
    my: { control: false },
    mt: { control: false },
    mr: { control: false },
    mb: { control: false },
    ml: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof Box>;

export const Padding: Story = {
  render: () => (
    <Box bg="subtle" radius="md" p={{ base: 2, laptop: 6 }}>
      Responsive padding: space-2 below laptop, space-6 from laptop up.
    </Box>
  ),
};

export const SidePrecedence: Story = {
  render: () => (
    <Box bg="subtle" radius="md" p={6} pt={1}>
      p=6 everywhere, pt=1 wins on the block-start side.
    </Box>
  ),
};

export const Surfaces: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ui-space-4)' }}>
      <Box p={4} bg="page" borderColor="default" radius="md">
        page + border
      </Box>
      <Box p={4} bg="subtle" radius="md">
        subtle
      </Box>
      <Box p={4} bg="disabled" radius="md">
        disabled
      </Box>
    </div>
  ),
};

export const Elevation: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ui-space-8)', padding: 'var(--ui-space-4)' }}>
      {(['sm', 'md', 'lg', 'xl'] as const).map((step) => (
        <Box key={step} p={4} bg="page" radius="lg" shadow={step}>
          {step}
        </Box>
      ))}
    </div>
  ),
};

export const DarkScheme: Story = {
  render: () => (
    <ThemeProvider colorScheme="dark">
      <Box p={6} bg="page">
        <Box p={4} bg="subtle" radius="md" borderColor="default" shadow="md">
          Dark surfaces via the same semantic tokens.
        </Box>
      </Box>
    </ThemeProvider>
  ),
};

export const Playground: Story = {};
