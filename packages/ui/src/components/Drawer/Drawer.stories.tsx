import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Button } from '../Button';
import { Field } from '../Field';
import { Input } from '../Input';
import { Stack } from '../Stack';
import { Drawer } from './Drawer';
import type { DrawerPlacement } from './Drawer.types';

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer',
  component: Drawer,
  parameters: { layout: 'fullscreen' },
  args: {
    title: 'Settings',
    description: 'Manage your workspace preferences.',
    closeLabel: 'Close',
  },
  argTypes: {
    children: { control: false },
    footer: { control: false },
    title: { control: 'text' },
    description: { control: 'text' },
    placement: { control: 'radio', options: ['left', 'right', 'top', 'bottom'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg', 'full'] },
    slotProps: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof Drawer>;

function DrawerDemo({
  placement = 'right',
  size = 'md',
  ...rest
}: Partial<React.ComponentProps<typeof Drawer>>) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ padding: 'var(--ui-space-8)' }}>
      <Button onClick={() => setOpen(true)}>Open {placement} drawer</Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        placement={placement}
        size={size}
        title="Settings"
        description="Manage your workspace preferences."
        closeLabel="Close"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Save</Button>
          </>
        }
        {...rest}
      >
        <Stack gap={4}>
          <Field label="Workspace name">
            <Input defaultValue="Acme" />
          </Field>
          <Field label="Contact email" description="Used for billing receipts.">
            <Input type="email" defaultValue="team@acme.test" />
          </Field>
        </Stack>
      </Drawer>
    </div>
  );
}

export const Right: Story = { render: () => <DrawerDemo placement="right" /> };
export const Left: Story = { render: () => <DrawerDemo placement="left" /> };
export const Bottom: Story = { render: () => <DrawerDemo placement="bottom" size="sm" /> };

export const Placements: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ui-space-4)', flexWrap: 'wrap' }}>
      {(['left', 'right', 'top', 'bottom'] as DrawerPlacement[]).map((placement) => (
        <DrawerDemo key={placement} placement={placement} />
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
          minBlockSize: '100vh',
        }}
      >
        <DrawerDemo placement="right" />
      </div>
    </ThemeProvider>
  ),
};

export const Playground: Story = {
  render: (args) => <DrawerDemo {...args} />,
};
