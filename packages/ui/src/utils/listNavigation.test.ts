import { describe, expect, it } from 'vitest';
import {
  firstEnabledIndex,
  lastEnabledIndex,
  nextEnabledIndex,
  typeAheadIndex,
} from './listNavigation';

const items = [
  { label: 'Apple' },
  { label: 'Banana', disabled: true },
  { label: 'Blueberry' },
  { label: 'Cherry', disabled: true },
  { label: 'Date' },
];

describe('firstEnabledIndex / lastEnabledIndex', () => {
  it('finds the boundary enabled items', () => {
    expect(firstEnabledIndex(items)).toBe(0);
    expect(lastEnabledIndex(items)).toBe(4);
  });

  it('returns -1 when everything is disabled', () => {
    expect(firstEnabledIndex([{ disabled: true }])).toBe(-1);
    expect(lastEnabledIndex([{ disabled: true }])).toBe(-1);
    expect(firstEnabledIndex([])).toBe(-1);
  });
});

describe('nextEnabledIndex', () => {
  it('skips disabled items in both directions', () => {
    expect(nextEnabledIndex(items, 0, 1)).toBe(2);
    expect(nextEnabledIndex(items, 2, 1)).toBe(4);
    expect(nextEnabledIndex(items, 4, -1)).toBe(2);
  });

  it('does not wrap at the ends', () => {
    expect(nextEnabledIndex(items, 4, 1)).toBe(4);
    expect(nextEnabledIndex(items, 0, -1)).toBe(0);
  });
});

describe('typeAheadIndex', () => {
  it('matches case-insensitively and skips disabled items', () => {
    expect(typeAheadIndex(items, 'b', 0)).toBe(2);
    expect(typeAheadIndex(items, 'DA', 0)).toBe(4);
  });

  it('wraps around from the search start', () => {
    expect(typeAheadIndex(items, 'a', 4)).toBe(0);
  });

  it('returns -1 for no match or empty input', () => {
    expect(typeAheadIndex(items, 'z', 0)).toBe(-1);
    expect(typeAheadIndex(items, '', 0)).toBe(-1);
    expect(typeAheadIndex([], 'a', 0)).toBe(-1);
  });
});
