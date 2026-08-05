import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Banner } from './Banner';
import type { BannerIntent, BannerProps } from './Banner.types';

// The library ships no icon assets; stories pass their own currentColor SVG,
// exactly as consumers do.
const InfoIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6.4" stroke="currentColor" strokeWidth="1.25" />
    <path d="M8 7.2v3.6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    <circle cx="8" cy="5" r="0.8" fill="currentColor" />
  </svg>
);

/**
 * Story args mirror the Figma component properties (page "Component ·
 * Banner🟢"): the Intent variant plus the Icon / Description / Primary
 * Action / Secondary Action / Close "Enable" booleans. The shared render
 * maps each Enable toggle to the PRESENCE of the corresponding prop — the
 * component API itself has no boolean style flags (locked rule); an omitted
 * `icon` / `children` / `actions` / `onClose` simply renders nothing.
 * The raw ReactNode props stay code-only (see argTypes) because JSON
 * controls cannot produce renderable React elements.
 */
interface BannerStoryArgs extends Pick<
  BannerProps,
  'icon' | 'actions' | 'slotProps' | 'onClose' | 'children'
> {
  intent: BannerIntent;
  title: string;
  description: string;
  iconEnable: boolean;
  descriptionEnable: boolean;
  primaryActionEnable: boolean;
  secondaryActionEnable: boolean;
  closeEnable: boolean;
  closeLabel: string;
}

const renderBanner = (args: BannerStoryArgs) => (
  <Banner
    intent={args.intent}
    title={args.title}
    icon={args.iconEnable ? InfoIcon : undefined}
    actions={
      args.primaryActionEnable || args.secondaryActionEnable ? (
        <>
          {args.primaryActionEnable ? (
            <Button size="sm" variant="secondary">
              View details
            </Button>
          ) : null}
          {args.secondaryActionEnable ? (
            <Button size="sm" variant="ghost">
              Dismiss
            </Button>
          ) : null}
        </>
      ) : undefined
    }
    onClose={args.closeEnable ? () => {} : undefined}
    closeLabel={args.closeEnable ? args.closeLabel : undefined}
  >
    {args.descriptionEnable ? args.description : undefined}
  </Banner>
);

const meta: Meta<BannerStoryArgs> = {
  title: 'Components/Banner',
  component: Banner,
  render: renderBanner,
  // Defaults mirror the Figma property defaults: icon + description on,
  // actions + close off.
  args: {
    intent: 'info',
    title: 'Historian sync degraded',
    description:
      'Data from the plant historian may lag by up to 10 minutes. Values shown are the last confirmed read.',
    iconEnable: true,
    descriptionEnable: true,
    primaryActionEnable: false,
    secondaryActionEnable: false,
    closeEnable: false,
    closeLabel: 'Dismiss notification',
  },
  argTypes: {
    intent: {
      control: 'select',
      options: ['info', 'success', 'warning', 'danger'],
    },
    title: { control: 'text' },
    description: { control: 'text' },
    iconEnable: { name: 'Icon Enable', control: 'boolean' },
    descriptionEnable: { name: 'Description Enable', control: 'boolean' },
    primaryActionEnable: { name: 'Primary Action Enable', control: 'boolean' },
    secondaryActionEnable: { name: 'Secondary Action Enable', control: 'boolean' },
    closeEnable: { name: 'Close Enable', control: 'boolean' },
    closeLabel: { control: 'text' },
    // Real component props stay code-only: ReactNode/function/object values
    // cannot be edited as JSON, and a saved `{}` is not a renderable child.
    icon: { table: { disable: true } },
    actions: { table: { disable: true } },
    slotProps: { table: { disable: true } },
    onClose: { table: { disable: true } },
    children: { table: { disable: true } },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Info: Story = { args: { intent: 'info' } };
export const Success: Story = { args: { intent: 'success' } };
export const Warning: Story = { args: { intent: 'warning' } };
export const Danger: Story = { args: { intent: 'danger' } };

export const TitleOnly: Story = {
  args: { descriptionEnable: false },
};

export const WithActions: Story = {
  args: { primaryActionEnable: true, secondaryActionEnable: true },
};

export const Dismissible: Story = {
  args: { closeEnable: true },
};

export const AllIntents: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ui-space-4)' }}>
      {renderBanner({ ...args, intent: 'info' })}
      {renderBanner({ ...args, intent: 'success' })}
      {renderBanner({ ...args, intent: 'warning' })}
      {renderBanner({ ...args, intent: 'danger' })}
    </div>
  ),
};

export const DarkScheme: Story = {
  render: (args) => (
    <ThemeProvider colorScheme="dark">
      <div
        style={{
          background: 'var(--ui-color-bg-canvas)',
          padding: 'var(--ui-space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ui-space-4)',
        }}
      >
        {renderBanner({ ...args, intent: 'info' })}
        {renderBanner({ ...args, intent: 'success' })}
        {renderBanner({ ...args, intent: 'warning' })}
        {renderBanner({ ...args, intent: 'danger' })}
      </div>
    </ThemeProvider>
  ),
};

export const Playground: Story = {};
