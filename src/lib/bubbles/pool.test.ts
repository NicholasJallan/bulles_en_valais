import { describe, expect, it } from 'vitest';
import { createPool, MAX_RADIUS, spawnBubbles, stepBubbles, type BubbleField } from './pool.ts';

const FIELD: BubbleField = { pxPerMetre: 40, speed: 50 };
/** Always the middle of the range: deterministic bubbles. */
const half = (): number => 0.5;

describe('createPool', () => {
  it('holds the given number of idle bubbles', () => {
    const pool = createPool(4);
    expect(pool).toHaveLength(4);
    expect(pool.every((bubble) => !bubble.alive)).toBe(true);
  });
});

describe('spawnBubbles', () => {
  it('wakes idle bubbles at the origin and never more than the free ones', () => {
    const pool = createPool(3);
    expect(spawnBubbles(pool, { x: 100, y: 200, depth: 10, count: 2, spread: 0 }, half)).toBe(2);
    expect(spawnBubbles(pool, { x: 0, y: 0, depth: 10, count: 5, spread: 0 }, half)).toBe(1);
    expect(spawnBubbles(pool, { x: 0, y: 0, depth: 10, count: 1, spread: 0 }, half)).toBe(0);
    const [first] = pool;
    expect(first).toMatchObject({ alive: true, x: 100, y: 200, releaseDepth: 10 });
    expect(first?.r0).toBeGreaterThan(0);
    expect(first?.r0).toBeLessThanOrEqual(MAX_RADIUS);
  });

  it('scatters the bubbles across the spread', () => {
    const pool = createPool(1);
    spawnBubbles(pool, { x: 100, y: 0, depth: 0, count: 1, spread: 40 }, () => 1);
    expect(pool[0]?.x0).toBe(120);
  });

  it('starts below the surface even when asked for a negative depth', () => {
    const pool = createPool(1);
    spawnBubbles(pool, { x: 0, y: 0, depth: -3, count: 1, spread: 0 }, half);
    expect(pool[0]?.releaseDepth).toBe(0);
  });
});

describe('stepBubbles', () => {
  it('makes the bubbles rise, faster for the bigger ones', () => {
    const pool = createPool(2);
    spawnBubbles(pool, { x: 0, y: 500, depth: 0, count: 1, spread: 0 }, () => 0);
    spawnBubbles(pool, { x: 0, y: 500, depth: 0, count: 1, spread: 0 }, () => 0.99);
    expect(stepBubbles(pool, 0.1, FIELD)).toBe(2);
    const [small, big] = pool;
    expect(small?.y).toBeLessThan(500);
    expect((big?.y ?? 0) < (small?.y ?? 0)).toBe(true);
  });

  it('makes a bubble grow as it rises (Boyle), and no more once at the surface', () => {
    const pool = createPool(1);
    spawnBubbles(pool, { x: 0, y: 2000, depth: 30, count: 1, spread: 0 }, half);
    stepBubbles(pool, 0, FIELD);
    const start = pool[0]?.r ?? 0;
    expect(start).toBeCloseTo(pool[0]?.r0 ?? -1);
    // 1200 px at 40 px/m: 30 m higher, at the surface.
    pool[0]!.y = 800;
    stepBubbles(pool, 0, FIELD);
    expect((pool[0]?.r ?? 0) / start).toBeCloseTo(4 ** (1 / 3), 3);
    pool[0]!.y = 400;
    stepBubbles(pool, 0, FIELD);
    expect((pool[0]?.r ?? 0) / start).toBeCloseTo(4 ** (1 / 3), 3);
  });

  it('sways the bubbles sideways around their column', () => {
    const pool = createPool(1);
    spawnBubbles(pool, { x: 50, y: 500, depth: 0, count: 1, spread: 0 }, half);
    const positions = [0.2, 0.2, 0.2].map(() => {
      stepBubbles(pool, 0.2, FIELD);
      return pool[0]?.x ?? 50;
    });
    expect(new Set(positions).size).toBeGreaterThan(1);
    for (const x of positions) expect(Math.abs(x - 50)).toBeLessThanOrEqual(pool[0]!.wobble);
  });

  it('puts a bubble back in the pool once it has left the top of the screen', () => {
    const pool = createPool(1);
    spawnBubbles(pool, { x: 0, y: 0, depth: 0, count: 1, spread: 0 }, half);
    expect(stepBubbles(pool, 1, FIELD)).toBe(0);
    expect(pool[0]?.alive).toBe(false);
  });

  it('caps a long frame (a tab back from the background) to a short step', () => {
    const pool = createPool(1);
    spawnBubbles(pool, { x: 0, y: 10_000, depth: 0, count: 1, spread: 0 }, half);
    stepBubbles(pool, 10, FIELD);
    expect(pool[0]?.y).toBeGreaterThan(9_900);
  });
});
