import { describe, expect, it } from 'vitest';
import { MAGNETIC_MAX_PX, magneticOffset } from './magnetic.ts';

const BOX = { left: 100, top: 100, width: 200, height: 50 };

describe('magneticOffset (E17)', () => {
  it('does not move when the pointer is at the centre', () => {
    expect(magneticOffset(BOX, 200, 125)).toEqual({ x: 0, y: 0 });
  });

  it('leans towards the pointer, at most 6 px on each axis', () => {
    expect(magneticOffset(BOX, 300, 150)).toEqual({ x: MAGNETIC_MAX_PX, y: MAGNETIC_MAX_PX });
    expect(magneticOffset(BOX, 100, 100)).toEqual({ x: -MAGNETIC_MAX_PX, y: -MAGNETIC_MAX_PX });
  });

  it('is proportional in between', () => {
    expect(magneticOffset(BOX, 250, 125)).toEqual({ x: 3, y: 0 });
  });

  it('never exceeds the limit, even outside the box', () => {
    const { x, y } = magneticOffset(BOX, 900, -400);
    expect(x).toBe(MAGNETIC_MAX_PX);
    expect(y).toBe(-MAGNETIC_MAX_PX);
  });

  it('copes with an empty box', () => {
    expect(magneticOffset({ left: 0, top: 0, width: 0, height: 0 }, 10, 10)).toEqual({
      x: 0,
      y: 0,
    });
  });
});
