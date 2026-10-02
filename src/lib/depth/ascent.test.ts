import { describe, expect, it } from 'vitest';
import { ASCENT_LIMIT_M_PER_S, isFastAscent } from './ascent.ts';

describe('isFastAscent (▲ SLOW alarm)', () => {
  it('stays quiet on the way down', () => {
    expect(isFastAscent({ depth: 10, time: 0 }, { depth: 30, time: 100 })).toBe(false);
  });

  it('stays quiet on a slow ascent', () => {
    expect(isFastAscent({ depth: 30, time: 0 }, { depth: 28, time: 1000 })).toBe(false);
  });

  it('rings when the depth falls faster than the limit', () => {
    const rise = ASCENT_LIMIT_M_PER_S * 2;
    expect(isFastAscent({ depth: 30, time: 0 }, { depth: 30 - rise, time: 1000 })).toBe(true);
  });

  it('ignores samples too close in time to measure a rate', () => {
    expect(isFastAscent({ depth: 30, time: 0 }, { depth: 0, time: 0 })).toBe(false);
  });
});
