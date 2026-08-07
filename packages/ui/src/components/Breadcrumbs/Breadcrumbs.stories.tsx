import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Breadcrumbs } from './Breadcrumbs';
import type { BreadcrumbsItem, BreadcrumbsProps } from './Breadcrumbs.types';

// The library ships no icon assets; stories pass their own currentColor SVG,
// exactly as consumers do.
const HomeIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M2.5 7 8 2.5 13.5 7v6a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V7Z"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinejoin="round"
    />
  </svg>
);

const TRAIL: BreadcrumbsItem[] = [
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Operations', href: '#operations' },
  { label: 'Dispatch', href: '#dispatch' },
  { label: 'BTH-20241201' },
];

/**
 * Story args mirror the Figma component properties (page "Component Â·
 * BreadcrumbsðŸŸ¢"): the collapsed variant plus the truncationWidth toggle
 * (mapped to the real `truncateWidth` prop â€” Figma truncates at 120px) and
 * an iconBefore toggle for the first crumb. Items themselves are data;
 * clicking the overflow trigger expands the trail, as in the Figma prototype.
 */
interface BreadcrumbsStoryArgs extends Pick<
  BreadcrumbsProps,
  'items' | 'slots' | 'slotProps' | 'onCollapsedChange'
> {
  collapsed: boolean;
  truncation: boolean;
  iconBefore: boolean;
  overflowLabel: string;
}

const renderBreadcrumbs = (args: BreadcrumbsStoryArgs) => {
  const items = args.iconBefore
    ? TRAIL.map((item, index) => (index === 0 ? { ...item, iconBefore: HomeIcon } : item))
    : TRAIL;
  return (
    <Breadcrumbs
      aria-label="Breadcrumb"
      items={items}
      defaultCollapsed={args.collapsed}
      overflowLabel={args.overflowLabel}
      truncateWidth={args.truncation ? '7.5rem' : undefined}
    />
  );
};

const meta: Meta<BreadcrumbsStoryArgs> = {
  title: 'Components/Breadcrumbs',
  component: Breadcrumbs,
  render: renderBreadcrumbs,
  args: {
    collapsed: false,
    truncation: false,
    iconBefore: false,
    overflowLabel: 'Show full path',
  },
  argTypes: {
    collapsed: { name: 'collapsed', control: 'boolean' },
    truncation: { name: 'truncationWidth', control: 'boolean' },
    iconBefore: { name: 'iconBefore', control: 'boolean' },
    overflowLabel: { control: 'text' },
    // Real component props stay code-only: arrays/ReactNode/function values
    // cannot be edited safely as JSON in the controls panel.
    items: { table: { disable: true } },
    slots: { table: { disable: true } },
    slotProps: { table: { disable: true } },
    onCollapsedChange: { table: { disable: true } },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Collapsed: Story = { args: { collapsed: true } };

export const WithIcon: Story = { args: { iconBefore: true } };

export const Truncated: Story = {
  render: (args) =>
    renderBreadcrumbs({
      ...args,
      truncation: true,
    }),
  args: { truncation: true },
};

export const ButtonCrumbs: Story = {
  render: () => (
    <Breadcrumbs
      aria-label="Breadcrumb"
      items={[
        { label: 'Dashboard', onClick: () => {} },
        { label: 'Operations', onClick: () => {} },
        { label: 'BTH-20241201' },
      ]}
    />
  ),
};

export const DarkScheme: Story = {
  render: (args) => (
    <ThemeProvider colorScheme="dark">
      <div style={{ background: 'var(--ui-color-surface-page)', padding: 'var(--ui-space-6)' }}>
        {renderBreadcrumbs(args)}
      </div>
    </ThemeProvider>
  ),
};

export const Playground: Story = {};
