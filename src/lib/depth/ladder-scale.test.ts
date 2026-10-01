import { describe, expect, it } from 'vitest';
import { groupByDepth, LADDER_BOTTOM, ladderPosition } from './ladder-scale.ts';

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
