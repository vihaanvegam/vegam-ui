import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import * as IconSet from '@vegam-ui/icons';
import type { IconComponent, IconSize } from '@vegam-ui/icons';
import { Input } from '../components/Input/Input';
import { Text } from '../components/Text/Text';

// The set enumerates itself: every barrel export prefixed `Icon` is an icon,
// so a newly generated glyph shows up here with no edit to this file.
const ALL_ICONS = Object.entries(IconSet)
  .filter((entry): entry is [string, IconComponent] => entry[0].startsWith('Icon'))
  .sort(([a], [b]) => a.localeCompare(b));

const SIZE_STEPS = Object.keys(IconSet.ICON_SIZES) as IconSize[];

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(7.5rem, 1fr))',
  gap: 'var(--ui-space-2)',
  marginTop: 'var(--ui-space-4)',
};

const cellStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 'var(--ui-space-2)',
  padding: 'var(--ui-space-3)',
  background: 'none',
  border: 'var(--ui-border-width-hairline) solid var(--ui-color-border-default)',
  borderRadius: 'var(--ui-radius-md)',
  color: 'var(--ui-color-text-primary-standard)',
  font: 'inherit',
  cursor: 'pointer',
  overflow: 'hidden',
};

const nameStyle: CSSProperties = {
  fontSize: 'var(--ui-font-size-xs)',
  color: 'var(--ui-color-text-secondary-standard)',
  maxWidth: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

function IconGallery() {
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle === '') return ALL_ICONS;
    return ALL_ICONS.filter(([name]) => name.toLowerCase().includes(needle));
  }, [query]);

  const copyImport = (name: string) => {
    const line = `import { ${name} } from '@vegam-ui/icons';`;
    // Clipboard access needs a secure context; in one that lacks it the
    // gallery should still be usable, so failure is non-fatal.
    void navigator.clipboard?.writeText(line).catch(() => undefined);
    setCopied(name);
  };

  return (
    <div>
      <Input
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
        }}
        placeholder={`Filter ${String(ALL_ICONS.length)} icons…`}
        aria-label="Filter icons by name"
      />

      {/* Announced politely so a screen-reader user hears the result count
          change as they type, and hears which import line was copied. */}
      <Text
        as="p"
        size="sm"
        tone="muted"
        aria-live="polite"
        style={{ marginTop: 'var(--ui-space-2)' }}
      >
        {copied === null
          ? `${String(shown.length)} of ${String(ALL_ICONS.length)} icons`
          : `Copied the import for ${copied}`}
      </Text>

      <div style={gridStyle}>
        {shown.map(([name, Icon]) => (
          <button
            key={name}
            type="button"
            style={cellStyle}
            onClick={() => {
              copyImport(name);
            }}
            title={`Copy: import { ${name} } from '@vegam-ui/icons';`}
          >
            <Icon size="lg" />
            <span style={nameStyle}>{name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const meta: Meta<typeof IconSet.IconSearch> = {
  title: 'Icons',
  component: IconSet.IconSearch,
  argTypes: {
    // icons is consumed as a BUILT package, so react-docgen has no source to
    // read — the controls are declared here and the prop reference lives in
    // Icons.mdx.
    size: {
      control: 'select',
      options: SIZE_STEPS,
      description: 'Named token step, or a number for px.',
    },
    title: { control: 'text', description: 'Accessible name; omit to keep the icon decorative.' },
  },
};

export default meta;

/**
 * Every icon in the set. Type to filter; click a tile to copy its import line.
 */
export const Gallery: StoryObj = {
  render: () => <IconGallery />,
  parameters: { controls: { disable: true } },
};

/**
 * One icon with live controls — the quickest way to see what `size` and
 * `title` actually do.
 */
export const Playground: StoryObj<typeof IconSet.IconSearch> = {
  args: { size: 'lg', title: 'Search' },
};

/**
 * The `size.icon-*` ramp in its true order. `xxl` (28px) sits between `lg`
 * (24px) and `xl` (32px) — it is not alphabetical, and assuming otherwise is
 * the easiest mistake to make with this API.
 */
export const SizeRamp: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--ui-space-5)' }}>
      {SIZE_STEPS.map((step) => (
        <div
          key={step}
          style={{ display: 'grid', justifyItems: 'center', gap: 'var(--ui-space-2)' }}
        >
          <IconSet.IconSearch size={step} />
          <span style={nameStyle}>{step}</span>
        </div>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};

/**
 * Colour comes from CSS `color` — there is no `color` prop. The theme ships
 * `--ui-color-icon-*` tokens for the usual roles.
 */
export const Colour: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ui-space-5)' }}>
      {[
        ['default', 'var(--ui-color-icon-default)'],
        ['subtle', 'var(--ui-color-icon-subtle)'],
        ['disabled', 'var(--ui-color-icon-disabled)'],
        ['inherits text', 'inherit'],
      ].map(([label, colour]) => (
        <div
          key={label}
          style={{
            display: 'grid',
            justifyItems: 'center',
            gap: 'var(--ui-space-2)',
            color: colour,
          }}
        >
          <IconSet.IconWarning size="xl" />
          <span style={nameStyle}>{label}</span>
        </div>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};
