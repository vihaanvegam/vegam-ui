import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  borderColorKeys,
  dividerTones,
  elevationSteps,
  radiusSteps,
  spaceSteps,
  surfaceKeys,
} from './tokenScales';

const tokensPath = [
  resolve(process.cwd(), '../tokens/src/tokens.json'),
  resolve(process.cwd(), 'packages/tokens/src/tokens.json'),
].find(existsSync);

type TokenGroup = Record<string, { value: unknown }>;

// The hand-written scales are only safe while they match the export — a new
// export that adds/renames/removes keys must turn this red (breakpoints.ts
// precedent).
describe('tokenScales drift', () => {
  if (!tokensPath) throw new Error('tokens.json not found from the vitest working directory');
  const tokens = JSON.parse(readFileSync(tokensPath, 'utf8')) as {
    space: TokenGroup;
    radius: TokenGroup;
    theme: {
      light: {
        color: { surface: TokenGroup; border: TokenGroup; divider: TokenGroup };
        elevation: TokenGroup;
      };
    };
  };

  it('spaceSteps match the non-null space tokens', () => {
    const exported = Object.entries(tokens.space)
      .filter(([, token]) => token.value !== null)
      .map(([key]) => Number(key))
      .sort((a, b) => a - b);
    expect([...spaceSteps]).toEqual(exported);
  });

  it('radiusSteps match the radius group', () => {
    expect([...radiusSteps].sort()).toEqual(Object.keys(tokens.radius).sort());
  });

  it('surfaceKeys match theme color.surface', () => {
    expect([...surfaceKeys].sort()).toEqual(Object.keys(tokens.theme.light.color.surface).sort());
  });

  it('borderColorKeys match theme color.border', () => {
    expect([...borderColorKeys].sort()).toEqual(
      Object.keys(tokens.theme.light.color.border).sort(),
    );
  });

  it('elevationSteps match the composed theme elevation shadows', () => {
    expect([...elevationSteps].sort()).toEqual(Object.keys(tokens.theme.light.elevation).sort());
  });

  it('dividerTones are a subset excluding exactly the known bad keys', () => {
    const exported = Object.keys(tokens.theme.light.color.divider);
    for (const tone of dividerTones) expect(exported).toContain(tone);
    // `strong` (red.500 data error, TOKENS_PLAN §4) and `on-dark-surface`
    // are present in the export and deliberately not offered.
    expect(exported.sort()).toEqual([...dividerTones, 'strong', 'on-dark-surface'].sort());
  });
});
