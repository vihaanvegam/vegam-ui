import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Pagination } from './Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'Components/Pagination',
  component: Pagination,
  args: {
    count: 20,
    defaultPage: 10,
    label: 'Pagination',
    previousLabel: 'Previous page',
    nextLabel: 'Next page',
  },
  argTypes: {
    slotProps: { control: false },
    pageLabel: { control: false },
    count: { control: { type: 'number', min: 1, max: 100 } },
    siblingCount: { control: { type: 'number', min: 0, max: 3 } },
    disabled: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof Pagination>;

export const Middle: Story = {};

/** Few enough pages that gaps would hide less than they cost — so none appear. */
export const AllPagesFit: Story = { args: { count: 5, defaultPage: 3 } };

export const AtTheStart: Story = { args: { defaultPage: 1 } };
export const AtTheEnd: Story = { args: { defaultPage: 20 } };

export const WiderWindow: Story = { args: { siblingCount: 2 } };

export const WithPageLabels: Story = {
  args: { pageLabel: (page: number) => `Page ${page}` },
};

export const DarkScheme: Story = {
  render: () => (
    <ThemeProvider colorScheme="dark">
      <div style={{ background: 'var(--ui-color-surface-page)', padding: 'var(--ui-space-6)' }}>
        <Pagination
          count={20}
          defaultPage={10}
          label="Pagination"
          previousLabel="Previous page"
          nextLabel="Next page"
        />
      </div>
    </ThemeProvider>
  ),
};

export const Playground: Story = {};
