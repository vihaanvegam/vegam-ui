import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Button } from '../Button';
import { Stack } from '../Stack';
import { ToastProvider } from './ToastProvider';
import { useToast } from './ToastContext';
import type { ToastPlacement } from './Toast.types';

const meta: Meta<typeof ToastProvider> = {
  title: 'Components/Toast',
  component: ToastProvider,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    children: { control: false },
    regionProps: { control: false },
    placement: {
      control: 'select',
      options: [
        'top-start',
        'top-center',
        'top-end',
        'bottom-start',
        'bottom-center',
        'bottom-end',
      ],
    },
    max: { control: { type: 'number', min: 1, max: 10 } },
  },
};

export default meta;

type Story = StoryObj<typeof ToastProvider>;

function Demo() {
  const { show, dismissAll } = useToast();
  return (
    <Stack gap={3} style={{ padding: 'var(--ui-space-8)', maxInlineSize: '20rem' }}>
      <Button onClick={() => show({ title: 'Saved', description: 'Your changes are live.' })}>
        Info toast
      </Button>
      <Button
        variant="secondary"
        onClick={() => show({ title: 'Deployed', intent: 'success', closeLabel: 'Dismiss' })}
      >
        Success toast
      </Button>
      <Button
        variant="danger"
        onClick={() =>
          show({
            title: 'Upload failed',
            description: 'The file exceeds the size limit.',
            intent: 'danger',
            duration: null,
            closeLabel: 'Dismiss',
          })
        }
      >
        Danger toast (stays until dismissed)
      </Button>
      <Button
        variant="ghost"
        onClick={() =>
          show({
            title: 'Item deleted',
            duration: null,
            closeLabel: 'Dismiss',
            action: (
              <Button size="sm" variant="secondary">
                Undo
              </Button>
            ),
          })
        }
      >
        With an action
      </Button>
      <Button variant="ghost" onClick={dismissAll}>
        Dismiss all
      </Button>
    </Stack>
  );
}

export const Basic: Story = {
  render: (args) => (
    <ToastProvider {...args}>
      <Demo />
    </ToastProvider>
  ),
};

export const TopCenter: Story = {
  render: () => (
    <ToastProvider placement="top-center">
      <Demo />
    </ToastProvider>
  ),
};

export const Placements: Story = {
  render: () => (
    <div style={{ padding: 'var(--ui-space-4)' }}>
      {(['top-start', 'bottom-end'] as ToastPlacement[]).map((placement) => (
        <ToastProvider key={placement} placement={placement}>
          <Demo />
        </ToastProvider>
      ))}
    </div>
  ),
};

export const DarkScheme: Story = {
  render: () => (
    <ThemeProvider colorScheme="dark">
      <div style={{ background: 'var(--ui-color-surface-page)', minBlockSize: '100vh' }}>
        <ToastProvider>
          <Demo />
        </ToastProvider>
      </div>
    </ThemeProvider>
  ),
};

export const Playground: Story = {
  render: (args) => (
    <ToastProvider {...args}>
      <Demo />
    </ToastProvider>
  ),
};
