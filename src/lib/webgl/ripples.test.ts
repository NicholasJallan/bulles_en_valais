import { describe, expect, it } from 'vitest';
import {
  MAX_RIPPLES,
  RIPPLE_LIFETIME_S,
  RING_WAVELENGTH_M,
  addRipple,
  isTap,
  liveRipples,
  shouldEmit,
  ringWave,
  writeRipples,
} from './ripples.ts';
import { groupSpeed, phaseSpeed } from './lake.ts';

const ripple = (born: number, x = 0.5, z = 4) => ({ x, z, born });

describe('ripples (uRipples[16])', () => {
  it('adds a ripple without changing the list it was given', () => {
    const before = [ripple(0)];
    const after = addRipple(before, ripple(1));
    expect(before).toHaveLength(1);
    expect(after).toHaveLength(2);
  });

  it('keeps the 16 most recent ripples', () => {
    let list: ReturnType<typeof addRipple> = [];
    for (let born = 0; born < 19; born += 1) list = addRipple(list, ripple(born));
    expect(list).toHaveLength(MAX_RIPPLES);
    expect(list[0]?.born).toBe(3);
    expect(list.at(-1)?.born).toBe(18);
  });

  it('drops the ripples that have faded out', () => {
    const list = [ripple(0), ripple(5)];
    expect(liveRipples(list, RIPPLE_LIFETIME_S + 1)).toEqual([ripple(5)]);
    expect(liveRipples(list, 1)).toBe(list);
  });

  it('writes the point of the lake (metres) and the age of each ripple, −1 for the empty slots', () => {
    const out = Array.from({ length: MAX_RIPPLES * 3 }, () => 0);
    writeRipples([ripple(1, -0.5, 6.25)], 3, out);
    expect(out.slice(0, 6)).toEqual([-0.5, 6.25, 2, 0, 0, -1]);
    expect(out[MAX_RIPPLES * 3 - 1]).toBe(-1);
  });
});

describe('ringWave (uRingWave)', () => {
  it('hands the shader the wavenumber and the speeds of a 12 cm ripple', () => {
    const [k, phase, group, lifetime] = ringWave();
    expect(k).toBeCloseTo((2 * Math.PI) / RING_WAVELENGTH_M, 9);
    expect(phase).toBe(phaseSpeed(RING_WAVELENGTH_M));
    expect(group).toBe(groupSpeed(RING_WAVELENGTH_M));
    // The shader fades the ring out before its slot is freed.
    expect(lifetime).toBe(RIPPLE_LIFETIME_S);
  });

  it('carries the ring a metre or so within its lifetime', () => {
    const [, , group] = ringWave();
    expect(group * RIPPLE_LIFETIME_S).toBeGreaterThan(0.8);
    expect(group * RIPPLE_LIFETIME_S).toBeLessThan(2);
  });
});

describe('pointer gestures', () => {
  const options = { minIntervalMs: 100, minDistancePx: 40 };

  it('emits the first ripple, then only after enough time and movement', () => {
    expect(shouldEmit(undefined, { x: 0, y: 0, t: 0 }, options)).toBe(true);
    const last = { x: 0, y: 0, t: 0 };
    expect(shouldEmit(last, { x: 100, y: 0, t: 50 }, options)).toBe(false);
    expect(shouldEmit(last, { x: 10, y: 10, t: 500 }, options)).toBe(false);
    expect(shouldEmit(last, { x: 30, y: 30, t: 150 }, options)).toBe(true);
  });

  it('recognises a short tap, never a swipe nor a long press', () => {
    const down = { x: 100, y: 100, t: 0 };
    expect(isTap(down, { x: 104, y: 103, t: 180 })).toBe(true);
    expect(isTap(down, { x: 100, y: 160, t: 120 })).toBe(false);
    expect(isTap(down, { x: 100, y: 100, t: 900 })).toBe(false);
  });
});
