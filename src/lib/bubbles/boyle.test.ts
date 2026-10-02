import { describe, expect, it } from 'vitest';
import { radiusAtDepth, riseSpeed } from './boyle.ts';

describe('radiusAtDepth', () => {
  it('doubles the volume from 10 m to the surface: the radius grows by ∛2', () => {
    expect(radiusAtDepth(1, 10, 0)).toBeCloseTo(1.26, 2);
  });

  it('quadruples the volume from 30 m to the surface: the radius grows by ∛4', () => {
    expect(radiusAtDepth(1, 30, 0)).toBeCloseTo(1.587, 3);
  });

  it('keeps the radius at the same depth and shrinks it on the way down', () => {
    expect(radiusAtDepth(3, 18, 18)).toBe(3);
    expect(radiusAtDepth(2, 0, 10)).toBeCloseTo(2 / 2 ** (1 / 3));
  });

  it('refuses negative depths and radii', () => {
    expect(() => radiusAtDepth(1, -1, 0)).toThrow(RangeError);
    expect(() => radiusAtDepth(1, 0, Number.NaN)).toThrow(RangeError);
    expect(() => radiusAtDepth(-1, 0, 0)).toThrow(RangeError);
  });
});

describe('riseSpeed', () => {
  it('grows with the square root of the radius', () => {
    expect(riseSpeed(4) / riseSpeed(1)).toBeCloseTo(2);
    expect(riseSpeed(0)).toBe(0);
  });

  it('takes the speed of a 1 px bubble as its scale', () => {
    expect(riseSpeed(9, 50)).toBe(150);
  });
});
