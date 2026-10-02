import { describe, expect, it } from 'vitest';
import { centredProgress, interpolate, nearestIndex } from './track.ts';

describe('centredProgress', () => {
  // A track of panels moved to the left by up to 1000 px under a window 800 px wide.
  it('is the progress at which the centre of an item meets the centre of the window', () => {
    expect(centredProgress({ start: 600, width: 400 }, 800, 1000)).toBeCloseTo(0.4);
    expect(centredProgress({ start: 1200, width: 400 }, 800, 1000)).toBeCloseTo(1);
  });

  it('stays between 0 and 1 for the first and last items', () => {
    expect(centredProgress({ start: 0, width: 300 }, 800, 1000)).toBe(0);
    expect(centredProgress({ start: 1500, width: 300 }, 800, 1000)).toBe(1);
  });

  it('is 0 when the track does not move', () => {
    expect(centredProgress({ start: 500, width: 100 }, 800, 0)).toBe(0);
  });
});

describe('interpolate', () => {
  const knots = [
    [0, 0],
    [0.4, 0.1],
    [0.8, 0.6],
    [1, 1],
  ] as const;

  it('is linear between the knots', () => {
    expect(interpolate(knots, 0.2)).toBeCloseTo(0.05);
    expect(interpolate(knots, 0.6)).toBeCloseTo(0.35);
    expect(interpolate(knots, 0.9)).toBeCloseTo(0.8);
  });

  it('holds the end values outside the knots, and takes the last of equal positions', () => {
    expect(interpolate(knots, -1)).toBe(0);
    expect(interpolate(knots, 2)).toBe(1);
    expect(
      interpolate(
        [
          [0, 0],
          [0.5, 0.2],
          [0.5, 0.4],
          [1, 1],
        ],
        0.5,
      ),
    ).toBe(0.4);
  });

  it('refuses an empty list of knots', () => {
    expect(() => interpolate([], 0)).toThrow(RangeError);
  });
});

describe('nearestIndex', () => {
  it('is the index of the nearest value, the first one on a tie', () => {
    expect(nearestIndex([0.1, 0.5, 0.9], 0.2)).toBe(0);
    expect(nearestIndex([0.1, 0.5, 0.9], 0.68)).toBe(1);
    expect(nearestIndex([0.1, 0.5, 0.9], 1)).toBe(2);
    expect(nearestIndex([0.2, 0.4], 0.3)).toBe(0);
    expect(nearestIndex([], 0.3)).toBe(-1);
  });
});
