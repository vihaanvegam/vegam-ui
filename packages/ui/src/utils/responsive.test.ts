import { describe, expect, it } from 'vitest';
import { resolveResponsive, responsiveStyleVars } from './responsive';

describe('resolveResponsive', () => {
  it('wraps scalars into { base }', () => {
    expect(resolveResponsive(4)).toEqual({ base: 4 });
    expect(resolveResponsive('md')).toEqual({ base: 'md' });
  });

  it('passes object form through untouched', () => {
    const value = { base: 1, laptop: 3 };
    expect(resolveResponsive<number>(value)).toBe(value);
  });

  it('accepts sparse objects without base', () => {
    const value = { tablet: 4 };
    expect(resolveResponsive<number>(value)).toBe(value);
  });
});

describe('responsiveStyleVars', () => {
  const toCss = (step: number) => `var(--ui-space-${step})`;

  it('returns nothing for undefined', () => {
    expect(responsiveStyleVars('--ui-box-p', undefined, toCss)).toEqual({});
  });

  it('emits only base for a scalar', () => {
    expect(responsiveStyleVars('--ui-box-p', 4, toCss)).toEqual({
      '--ui-box-p-base': 'var(--ui-space-4)',
    });
  });

  it('emits one property per present breakpoint, in ramp order', () => {
    const vars = responsiveStyleVars('--ui-box-p', { base: 2, laptop: 4, wide: 6 }, toCss);
    expect(vars).toEqual({
      '--ui-box-p-base': 'var(--ui-space-2)',
      '--ui-box-p-laptop': 'var(--ui-space-4)',
      '--ui-box-p-wide': 'var(--ui-space-6)',
    });
    expect(Object.keys(vars)).toEqual(['--ui-box-p-base', '--ui-box-p-laptop', '--ui-box-p-wide']);
  });
});
