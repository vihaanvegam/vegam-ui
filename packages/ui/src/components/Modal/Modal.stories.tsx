import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Modal } from './Modal';
import type { ModalAppearance, ModalProps, ModalSize } from './Modal.types';

// The library ships no icon assets; stories pass their own currentColor SVG,
// exactly as consumers do (shown for warning/danger appearances).
const WarningIcon = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M10 3 2.5 16h15L10 3Z"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinejoin="round"
    />
    <path d="M10 8v3.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    <circle cx="10" cy="13.8" r="0.8" fill="currentColor" />
  </svg>
);

/**
 * Story args mirror the Figma component properties (page "Component ·
 * Modal"): Size and Appearance variants plus the Has Close Button / Show
 * Footer booleans and Title / Description / Body text. Show Blanket is not
 * modeled — the blanket always renders behind an open modal (a modal without
 * a scrim is a popover, which this library does not ship). The demo keeps
 * `open` in local state so every dismissal affordance actually works.
 */
interface ModalStoryArgs extends Pick<
  ModalProps,
  'open' | 'icon' | 'footer' | 'slotProps' | 'onClose'
> {
  size: ModalSize;
  appearance: ModalAppearance;
  title: string;
  description: string;
  body: string;
  hasCloseButton: boolean;
  showFooter: boolean;
  closeLabel: string;
}

const CONFIRM_LABEL: Record<ModalAppearance, string> = {
  default: 'Confirm',
  warning: 'Override',
  danger: 'Delete batch',
};

function ModalDemo(args: ModalStoryArgs) {
  const [open, setOpen] = useState(true);
  const close = () => setOpen(false);
  return (
    <div style={{ minHeight: '24rem', fontFamily: 'var(--ui-font-family-sans)' }}>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal
        open={open}
        onClose={close}
        size={args.size}
        appearance={args.appearance}
        title={args.title}
        description={args.description}
        icon={args.appearance === 'default' ? undefined : WarningIcon}
        closeLabel={args.hasCloseButton ? args.closeLabel : undefined}
        footer={
          args.showFooter ? (
            <>
              <Button variant="secondary" onClick={close}>
                Cancel
              </Button>
              <Button variant={args.appearance === 'danger' ? 'danger' : 'primary'} onClick={close}>
                {CONFIRM_LABEL[args.appearance]}
              </Button>
            </>
          ) : undefined
        }
      >
        {args.body}
      </Modal>
    </div>
  );
}

const meta: Meta<ModalStoryArgs> = {
  title: 'Components/Modal',
  component: Modal,
  render: (args) => <ModalDemo {...args} />,
  // Defaults mirror the Figma property defaults: close button + footer on.
  args: {
    size: 'sm',
    appearance: 'default',
    title: 'Delete batch?',
    description: 'This action cannot be undone.',
    body: 'Batch BTH-001 will be permanently removed from the dispatch queue.',
    hasCloseButton: true,
    showFooter: true,
    closeLabel: 'Close dialog',
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl', 'fullscreen'] },
    appearance: { control: 'select', options: ['default', 'warning', 'danger'] },
    title: { control: 'text' },
    description: { control: 'text' },
    body: { control: 'text' },
    hasCloseButton: { name: 'Has Close Button', control: 'boolean' },
    showFooter: { name: 'Show Footer', control: 'boolean' },
    closeLabel: { control: 'text' },
    // Real component props stay code-only: ReactNode/function/object values
    // cannot be edited as JSON, and a saved `{}` is not a renderable child.
    icon: { table: { disable: true } },
    footer: { table: { disable: true } },
    slotProps: { table: { disable: true } },
    onClose: { table: { disable: true } },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Small: Story = { args: { size: 'sm' } };
export const Medium: Story = { args: { size: 'md' } };
export const Large: Story = { args: { size: 'lg' } };
export const XLarge: Story = { args: { size: 'xl' } };
export const FullScreen: Story = { args: { size: 'fullscreen' } };

export const Warning: Story = { args: { appearance: 'warning' } };
export const Danger: Story = { args: { appearance: 'danger' } };

export const NoFooter: Story = { args: { showFooter: false } };

export const DarkScheme: Story = {
  render: (args) => (
    <ThemeProvider colorScheme="dark">
      <div style={{ background: 'var(--ui-color-bg-canvas)', padding: 'var(--ui-space-6)' }}>
        <ModalDemo {...args} />
      </div>
    </ThemeProvider>
  ),
};

export const Playground: Story = {};
