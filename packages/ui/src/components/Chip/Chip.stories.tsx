import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Chip } from './Chip';
import type { ChipTone } from './Chip.types';

const meta: Meta<typeof Chip> = {
  title: 'Components/Chip',
  component: Chip,
  args: { children: 'React' },
  argTypes: {
    children: { control: 'text' },
    slotProps: { control: false },
    onClick: { control: false },
    onRemove: { control: false },
    tone: {
      control: 'radio',
      options: ['neutral', 'info', 'success', 'warning', 'danger', 'tag'],
    },
    size: { control: 'radio', options: ['sm', 'md'] },
    disabled: { control: 'boolean' },
    selected: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof Chip>;

export const Static: Story = {};

export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ui-space-2)', flexWrap: 'wrap' }}>
      {(['neutral', 'info', 'success', 'warning', 'danger', 'tag'] as ChipTone[]).map((tone) => (
        <Chip key={tone} tone={tone}>
          {tone}
        </Chip>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ui-space-2)', alignItems: 'center' }}>
      <Chip size="sm">small</Chip>
      <Chip size="md">medium</Chip>
    </div>
  ),
};

/** Filter chips: activatable, with selection exposed as `aria-pressed`. */
export const Selectable: Story = {
  render: function Selectable() {
    const [selected, setSelected] = useState<string[]>(['React']);
    const toggle = (name: string) =>
      setSelected((current) =>
        current.includes(name) ? current.filter((n) => n !== name) : [...current, name],
      );
    return (
      <div style={{ display: 'flex', gap: 'var(--ui-space-2)' }}>
        {['React', 'Vue', 'Svelte'].map((name) => (
          <Chip key={name} onClick={() => toggle(name)} selected={selected.includes(name)}>
            {name}
          </Chip>
        ))}
      </div>
    );
  },
};

export const Removable: Story = {
  render: function Removable() {
    const [tags, setTags] = useState(['React', 'TypeScript', 'CSS']);
    return (
      <div style={{ display: 'flex', gap: 'var(--ui-space-2)', flexWrap: 'wrap' }}>
        {tags.map((tag) => (
          <Chip
            key={tag}
            tone="tag"
            onRemove={() => setTags((current) => current.filter((t) => t !== tag))}
            removeLabel={`Remove ${tag}`}
          >
            {tag}
          </Chip>
        ))}
        {tags.length === 0 ? <Chip>All removed</Chip> : null}
      </div>
    );
  },
};

export const Disabled: Story = {
  args: { disabled: true, onRemove: () => {}, removeLabel: 'Remove' },
};

export const DarkScheme: Story = {
  render: () => (
    <ThemeProvider colorScheme="dark">
      <div
        style={{
          background: 'var(--ui-color-surface-page)',
          padding: 'var(--ui-space-6)',
          display: 'flex',
          gap: 'var(--ui-space-2)',
        }}
      >
        <Chip>neutral</Chip>
        <Chip tone="success">success</Chip>
        <Chip tone="tag">tag</Chip>
      </div>
    </ThemeProvider>
  ),
};

export const Playground: Story = {};
