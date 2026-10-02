import { describe, expect, it } from 'vitest';
import { nextTabIndex } from './tabs.ts';

describe('nextTabIndex (WAI-ARIA APG, horizontal tabs)', () => {
  it('moves right and left, wrapping at both ends', () => {
    expect(nextTabIndex('ArrowRight', 0, 3)).toBe(1);
    expect(nextTabIndex('ArrowRight', 2, 3)).toBe(0);
    expect(nextTabIndex('ArrowLeft', 1, 3)).toBe(0);
    expect(nextTabIndex('ArrowLeft', 0, 3)).toBe(2);
  });

  it('jumps to the first and last tab with Home and End', () => {
    expect(nextTabIndex('Home', 2, 4)).toBe(0);
    expect(nextTabIndex('End', 0, 4)).toBe(3);
  });

  it('ignores the other keys', () => {
    expect(nextTabIndex('ArrowDown', 1, 3)).toBeUndefined();
    expect(nextTabIndex('Enter', 1, 3)).toBeUndefined();
  });

  it('refuses an empty tab list', () => {
    expect(() => nextTabIndex('Home', 0, 0)).toThrow(RangeError);
  });
});
