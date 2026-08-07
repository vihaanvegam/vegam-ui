import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from './ThemeProvider';

const meta: Meta<typeof ThemeProvider> = {
  title: 'Theme/ThemeProvider',
  component: ThemeProvider,
  argTypes: {
    colorScheme: {
      control: 'radio',
      options: ['light', 'dark'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof ThemeProvider>;

function Sample() {
  return (
    <div
      style={{
        background: 'var(--ui-color-surface-page)',
        color: 'var(--ui-text-primary)',
        padding: 'var(--ui-space-6)',
        border: '1px solid var(--ui-color-border-default)',
        borderRadius: 'var(--ui-radius-md)',
        fontFamily: 'var(--ui-font-family-sans)',
      }}
    >
      <p style={{ marginTop: 0 }}>Primary text on the page surface.</p>
      <p style={{ color: 'var(--ui-text-secondary)' }}>Muted text.</p>
      <span
        style={{
          background: 'var(--ui-color-action-primary-bg)',
          color: 'var(--ui-color-action-primary-fg-on-solid)',
          padding: 'var(--ui-space-2) var(--ui-space-4)',
          borderRadius: 'var(--ui-radius-md)',
          display: 'inline-block',
        }}
      >
        Primary action sample
      </span>
    </div>
  );
}

export const Light: Story = {
  args: { colorScheme: 'light', children: <Sample /> },
};

export const Dark: Story = {
  args: { colorScheme: 'dark', children: <Sample /> },
};

/** A light region nested inside a dark one re-themes only its subtree. */
export const Nested: Story = {
  render: () => (
    <ThemeProvider colorScheme="dark">
      <Sample />
      <div style={{ height: 'var(--ui-space-4)' }} />
      <ThemeProvider colorScheme="light">
        <Sample />
      </ThemeProvider>
    </ThemeProvider>
  ),
};

export const Playground: Story = {
  args: { children: <Sample /> },
};
