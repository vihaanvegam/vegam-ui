import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { breakpointOrder, breakpointWidths } from './breakpoints';

// import.meta.url is not a file: URL under the vitest transform, so locate
// the export from the working directory (vitest runs with cwd = packages/ui;
// the second candidate covers a repo-root runner).
const tokensPath = [
  resolve(process.cwd(), '../tokens/src/tokens.json'),
  resolve(process.cwd(), 'packages/tokens/src/tokens.json'),
].find(existsSync);

// The §8.1 deviation (annotated literals instead of token vars) is only safe
// while this stays green: the JS home of the values must match the export.
describe('breakpointWidths', () => {
  if (!tokensPath) throw new Error('tokens.json not found from the vitest working directory');
  const tokens = JSON.parse(readFileSync(tokensPath, 'utf8')) as {
    breakpoint: Record<string, { value: string }>;
  };

  it.each(Object.entries(breakpointWidths))('%s matches tokens.json', (name, value) => {
    expect(tokens.breakpoint[name]?.value).toBe(value);
  });

  it('covers every query bound in the export (mobile is a baseline width, not a bound)', () => {
    const bounds = Object.keys(tokens.breakpoint).filter((name) => name !== 'mobile');
    expect(Object.keys(breakpointWidths).sort()).toEqual(bounds.sort());
  });

  it('orders base first, then bounds ascending', () => {
    expect(breakpointOrder[0]).toBe('base');
    const rems = breakpointOrder
      .slice(1)
      .map((bp) => parseFloat(breakpointWidths[bp as keyof typeof breakpointWidths]));
    expect([...rems].sort((a, b) => a - b)).toEqual(rems);
  });
});
