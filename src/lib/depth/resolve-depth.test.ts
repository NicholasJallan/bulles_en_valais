import { describe, expect, it } from 'vitest';
import { probeLine, resolveDepth, type MeasuredSection } from './resolve-depth.ts';

const section = (
  id: string,
  top: number,
  bottom: number,
  start: number,
  end: number,
  hidden = false,
): MeasuredSection => ({ id, top, bottom, start, end, hidden });

// A page of 4 sections, with a 100 px gap (a thermocline) between b and c.
const SECTIONS = [
  section('a', 0, 1000, 0, 0),
  section('b', 1000, 2000, 0, 10),
  section('c', 2100, 2600, 10, 40, true),
  section('d', 2600, 3600, 40, 20),
];

describe('probeLine', () => {
  it('runs from the top of the page to its bottom as the page scrolls', () => {
    expect(probeLine(0, 800, 4000)).toBe(0);
    expect(probeLine(3200, 800, 4000)).toBe(4000);
  });

  it('crosses the middle of the viewport half-way down', () => {
    expect(probeLine(1600, 800, 4000)).toBe(2000);
  });

  it('stays in the middle of the viewport when the page does not scroll', () => {
    expect(probeLine(0, 800, 800)).toBe(400);
  });

  it('clamps an overscroll (rubber band)', () => {
    expect(probeLine(-50, 800, 4000)).toBe(0);
    expect(probeLine(3300, 800, 4000)).toBe(4000);
  });
});

describe('resolveDepth', () => {
  it('interpolates between the depths of the section under the probe', () => {
    expect(resolveDepth(SECTIONS, 1500)).toEqual({
      id: 'b',
      index: 1,
      progress: 0.5,
      depth: 5,
      hidden: false,
    });
  });

  it('reads the start depth at the top of the page', () => {
    expect(resolveDepth(SECTIONS, 0)).toMatchObject({ id: 'a', depth: 0, progress: 0 });
  });

  it('reads the end depth at the bottom of the page, below the last section', () => {
    expect(resolveDepth(SECTIONS, 4000)).toMatchObject({ id: 'd', depth: 20, progress: 1 });
  });

  it('starts at the first depth above the first section', () => {
    expect(resolveDepth([section('x', 200, 400, 3, 8)], 100)).toMatchObject({
      id: 'x',
      depth: 3,
      progress: 0,
    });
  });

  it('goes on from one section to the next across a gap', () => {
    const reading = resolveDepth(SECTIONS, 2050);
    expect(reading.id).toBe('b');
    expect(reading.depth).toBe(10);
  });

  it('flags a hidden section and still interpolates through it', () => {
    expect(resolveDepth(SECTIONS, 2350)).toMatchObject({ id: 'c', hidden: true, depth: 25 });
  });

  it('handles sections shorter than the viewport', () => {
    const short = [section('s', 0, 100, 0, 6), section('t', 100, 150, 6, 9)];
    expect(resolveDepth(short, 125).depth).toBeCloseTo(7.5);
  });

  it('copes with an empty section (height 0)', () => {
    expect(resolveDepth([section('z', 500, 500, 4, 9)], 500)).toMatchObject({ depth: 9 });
  });

  it('refuses an empty list', () => {
    expect(() => resolveDepth([], 0)).toThrow(RangeError);
  });
});
