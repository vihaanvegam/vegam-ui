import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Accordion } from './Accordion';
import type { AccordionItem } from './Accordion.types';

const items: AccordionItem[] = [
  { value: 'shipping', label: 'How long does shipping take?', content: 'Orders ship in 3 days.' },
  { value: 'returns', label: 'What is the return policy?', content: 'Returns within 30 days.' },
  { value: 'support', label: 'How do I contact support?', content: 'Email support@example.test.' },
];

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
  args: { items },
  argTypes: {
    items: { control: false },
    slotProps: { control: false },
    multiple: { control: 'boolean' },
    headingLevel: { control: 'select', options: [2, 3, 4, 5, 6] },
  },
};

export default meta;

type Story = StoryObj<typeof Accordion>;

export const Single: Story = { args: { defaultValue: 'shipping' } };

/** `multiple` also changes the shape of `value`/`onChange` to an array. */
export const Multiple: Story = { args: { multiple: true, defaultValue: ['shipping', 'returns'] } };

export const WithDisabled: Story = {
  args: {
    items: [
      ...items,
      { value: 'legal', label: 'Legal (unavailable)', content: '—', disabled: true },
    ],
  },
};

export const DarkScheme: Story = {
  render: () => (
    <ThemeProvider colorScheme="dark">
      <div style={{ background: 'var(--ui-color-surface-page)', padding: 'var(--ui-space-6)' }}>
        <Accordion items={items} defaultValue="shipping" />
      </div>
    </ThemeProvider>
  ),
};

export const Playground: Story = {};
