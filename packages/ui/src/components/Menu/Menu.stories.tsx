import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Button } from '../Button';
import { Menu } from './Menu';
import type { MenuItem } from './Menu.types';

const items: MenuItem[] = [
  { value: 'edit', label: 'Edit' },
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'archive', label: 'Archive', disabled: true },
  { value: 'delete', label: 'Delete' },
];

const meta: Meta<typeof Menu> = {
  title: 'Components/Menu',
  component: Menu,
  args: { label: 'Actions', items },
  argTypes: {
    children: { control: false },
    items: { control: false },
    slots: { control: false },
    slotProps: { control: false },
    label: { control: 'text' },
    side: { control: 'radio', options: ['top', 'right', 'bottom', 'left'] },
    align: { control: 'radio', options: ['start', 'center', 'end'] },
  },
  render: (args) => (
    <div style={{ padding: 'var(--ui-space-12)' }}>
      <Menu {...args}>
        <Button>Actions</Button>
      </Menu>
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof Menu>;

export const Basic: Story = {};

export const Open: Story = { args: { defaultOpen: true } };

/** Router links: the slot must render a focusable element and spread `itemProps`. */
export const LinkItems: Story = {
  args: {
    defaultOpen: true,
    slots: {
      item: ({ item, className, itemProps, children }) => (
        <a href={`#${item.value}`} className={className} {...itemProps}>
          {children}
        </a>
      ),
    },
  },
};

export const DarkScheme: Story = {
  render: () => (
    <ThemeProvider colorScheme="dark">
      <div style={{ background: 'var(--ui-color-surface-page)', padding: 'var(--ui-space-12)' }}>
        <Menu label="Actions" items={items} defaultOpen>
          <Button>Actions</Button>
        </Menu>
      </div>
    </ThemeProvider>
  ),
};

export const Playground: Story = {};
