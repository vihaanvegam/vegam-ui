import { useEffect, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from './ThemeProvider';

/**
 * Renders every design token, read at runtime from the `:root` rule of the
 * stylesheet that actually loaded — the gallery can never drift from what
 * ships. Swatches use `var()` so the browser resolves values per theme;
 * semantic colors render inside light AND dark providers.
 */

type Kind =
  | 'color'
  | 'color-pair'
  | 'space'
  | 'radius'
  | 'font-family'
  | 'font-size'
  | 'font-weight'
  | 'elevation'
  | 'text';

interface Category {
  title: string;
  match: RegExp;
  kind: Kind;
}

const CATEGORIES: Category[] = [
  { title: 'Semantic colors (light / dark)', match: /^--ui-(color|border)-/, kind: 'color-pair' },
  {
    title: 'Palette primitives',
    match: /^--ui-(white|black|gray|blue|red|green|amber)/,
    kind: 'color',
  },
  { title: 'Spacing (4px base)', match: /^--ui-space-/, kind: 'space' },
  { title: 'Radii', match: /^--ui-radius-/, kind: 'radius' },
  { title: 'Font families', match: /^--ui-font-family-/, kind: 'font-family' },
  { title: 'Font sizes (modular scale)', match: /^--ui-font-size-/, kind: 'font-size' },
  { title: 'Font weights', match: /^--ui-font-weight-/, kind: 'font-weight' },
  { title: 'Line heights', match: /^--ui-font-line-height-/, kind: 'text' },
  { title: 'Elevation', match: /^--ui-elevation-/, kind: 'elevation' },
  { title: 'Motion', match: /^--ui-motion-/, kind: 'text' },
  { title: 'Focus ring', match: /^--ui-focus-/, kind: 'text' },
];

interface TokenDeclaration {
  name: string;
  value: string;
}

function readRootTokens(): TokenDeclaration[] {
  const tokens: TokenDeclaration[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue; // cross-origin stylesheet
    }
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule && rule.selectorText === ':root') {
        for (const property of Array.from(rule.style)) {
          if (property.startsWith('--ui-')) {
            tokens.push({ name: property, value: rule.style.getPropertyValue(property).trim() });
          }
        }
      }
    }
  }
  return tokens;
}

const labelStyle: CSSProperties = {
  fontFamily: 'var(--ui-font-family-mono)',
  fontSize: 'var(--ui-font-size-1)',
  color: 'var(--ui-color-text-primary)',
};

const valueStyle: CSSProperties = {
  fontFamily: 'var(--ui-font-family-mono)',
  fontSize: 'var(--ui-font-size-1)',
  color: 'var(--ui-color-text-muted)',
};

function Swatch({ name }: { name: string }) {
  return (
    <div
      style={{
        width: 48,
        height: 32,
        background: `var(${name})`,
        borderRadius: 'var(--ui-radius-sm)',
        border: '1px solid var(--ui-border-subtle)',
      }}
    />
  );
}

function themedPreview(name: string, kind: Kind): ReactNode {
  switch (kind) {
    case 'color':
    case 'color-pair':
      return <Swatch name={name} />;
    case 'space':
      return (
        <div
          style={{
            width: `var(${name})`,
            height: 12,
            background: 'var(--ui-color-action-primary)',
          }}
        />
      );
    case 'radius':
      return (
        <div
          style={{
            width: 48,
            height: 32,
            borderRadius: `var(${name})`,
            background: 'var(--ui-color-bg-muted)',
            border: '1px solid var(--ui-border-strong)',
          }}
        />
      );
    case 'font-family':
      return <span style={{ fontFamily: `var(${name})` }}>The quick brown fox 0123</span>;
    case 'font-size':
      return <span style={{ fontSize: `var(${name})`, lineHeight: 1 }}>Ag</span>;
    case 'font-weight':
      return <span style={{ fontWeight: `var(${name})` as CSSProperties['fontWeight'] }}>Ag</span>;
    case 'elevation':
      return (
        <div
          style={{
            width: 64,
            height: 32,
            boxShadow: `var(${name})`,
            background: 'var(--ui-color-bg-surface)',
            borderRadius: 'var(--ui-radius-md)',
          }}
        />
      );
    case 'text':
      return null;
  }
}

function TokenRow({ token, kind }: { token: TokenDeclaration; kind: Kind }) {
  const preview =
    kind === 'color-pair' ? (
      <div style={{ display: 'flex', gap: 8 }}>
        <ThemeProvider colorScheme="light">
          <div style={{ background: 'var(--ui-color-bg-canvas)', padding: 6 }}>
            {themedPreview(token.name, kind)}
          </div>
        </ThemeProvider>
        <ThemeProvider colorScheme="dark">
          <div style={{ background: 'var(--ui-color-bg-canvas)', padding: 6 }}>
            {themedPreview(token.name, kind)}
          </div>
        </ThemeProvider>
      </div>
    ) : (
      themedPreview(token.name, kind)
    );

  return (
    <tr>
      <td style={{ padding: '6px 16px 6px 0', whiteSpace: 'nowrap' }}>
        <code style={labelStyle}>{token.name}</code>
      </td>
      <td style={{ padding: '6px 16px 6px 0' }}>{preview}</td>
      <td style={{ padding: '6px 0' }}>
        <code style={valueStyle}>{token.value}</code>
      </td>
    </tr>
  );
}

function TokenGallery() {
  const [tokens, setTokens] = useState<TokenDeclaration[]>([]);
  useEffect(() => {
    setTokens(readRootTokens());
  }, []);

  return (
    <div style={{ fontFamily: 'var(--ui-font-family-sans)' }}>
      {CATEGORIES.map((category) => {
        const matching = tokens.filter((token) => category.match.test(token.name));
        if (matching.length === 0) return null;
        return (
          <section key={category.title} style={{ marginBottom: 'var(--ui-space-8)' }}>
            <h2
              style={{
                fontSize: 'var(--ui-font-size-4)',
                fontWeight: 'var(--ui-font-weight-semibold)' as CSSProperties['fontWeight'],
              }}
            >
              {category.title}
            </h2>
            <table style={{ borderCollapse: 'collapse' }}>
              <tbody>
                {matching.map((token) => (
                  <TokenRow key={token.name} token={token} kind={category.kind} />
                ))}
              </tbody>
            </table>
          </section>
        );
      })}
    </div>
  );
}

const meta: Meta = {
  title: 'Theme/Tokens',
  parameters: {
    controls: { disable: true },
  },
};

export default meta;

export const AllTokens: StoryObj = {
  render: () => <TokenGallery />,
};
