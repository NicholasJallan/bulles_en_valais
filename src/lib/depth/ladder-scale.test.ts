import { describe, expect, it } from 'vitest';
import {
  depthAtPosition,
  groupByDepth,
  LADDER_BOTTOM,
  ladderPosition,
  ladderTicks,
} from './ladder-scale.ts';

describe('ladderPosition', () => {
  it('is linear down to 40 m, over 60 % of the ladder', () => {
    expect(ladderPosition(0)).toBe(0);
    expect(ladderPosition(20)).toBeCloseTo(0.3);
    expect(ladderPosition(40)).toBeCloseTo(0.6);
  });

  it('compresses 40 to 120 m into the last 40 %', () => {
    expect(ladderPosition(80)).toBeCloseTo(0.8);
    expect(ladderPosition(LADDER_BOTTOM)).toBe(1);
  });

  it('refuses depths outside the ladder', () => {
    expect(() => ladderPosition(-1)).toThrow(RangeError);
    expect(() => ladderPosition(121)).toThrow(RangeError);
    expect(() => ladderPosition(Number.NaN)).toThrow(RangeError);
  });
});

describe('groupByDepth', () => {
  it('gathers the items of a same depth, shallowest first, keeping their order', () => {
    const items = [
      { id: 'b', maxDepth: 30 },
      { id: 'a', maxDepth: 18 },
      { id: 'c', maxDepth: 18 },
    ];
    expect(groupByDepth(items)).toEqual([
      { depth: 18, items: [items[1], items[2]] },
      { depth: 30, items: [items[0]] },
    ]);
  });
});

describe('depthAtPosition', () => {
  it('reads the depth back from a position on the ladder', () => {
    expect(depthAtPosition(0)).toBe(0);
    expect(depthAtPosition(0.3)).toBeCloseTo(20);
    expect(depthAtPosition(0.6)).toBeCloseTo(40);
    expect(depthAtPosition(0.8)).toBeCloseTo(80);
    expect(depthAtPosition(1)).toBe(LADDER_BOTTOM);
  });

  it('is the inverse of ladderPosition', () => {
    for (const depth of [0, 6, 18, 33.3, 40, 45, 70, 120]) {
      expect(depthAtPosition(ladderPosition(depth))).toBeCloseTo(depth);
    }
  });

  it('keeps to the ladder when the progress overshoots', () => {
    expect(depthAtPosition(-0.01)).toBe(0);
    expect(depthAtPosition(1.02)).toBe(LADDER_BOTTOM);
    expect(depthAtPosition(Number.NaN)).toBe(0);
  });
});

describe('ladderTicks', () => {
  it('graduates every 5 m down to 40 m, then every 10 m', () => {
    const depths = ladderTicks().map((tick) => tick.depth);
    expect(depths.slice(0, 10)).toEqual([0, 5, 10, 15, 20, 25, 30, 35, 40, 50]);
    expect(depths.at(-1)).toBe(LADDER_BOTTOM);
    expect(depths).toHaveLength(17);
  });

  it('marks the tens as major ticks and places each tick on the scale', () => {
    const ticks = ladderTicks();
    expect(ticks.find((tick) => tick.depth === 5)).toEqual({
      depth: 5,
      position: ladderPosition(5),
      major: false,
    });
    expect(ticks.filter((tick) => tick.major).map((tick) => tick.depth)).toEqual([
      0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120,
    ]);
  });
});
