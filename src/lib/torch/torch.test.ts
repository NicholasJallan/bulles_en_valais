import { describe, expect, it } from 'vitest';
import { driftPoint, litIndex, particleField, type Box } from './torch.ts';

const box = (left: number, top: number, width: number, height: number): Box => ({
  left,
  top,
  right: left + width,
  bottom: top + height,
});

describe('litIndex', () => {
  const cards = [box(0, 0, 100, 50), box(120, 0, 100, 50), box(0, 60, 100, 50)];

  it('finds the card under the centre of the lamp', () => {
    expect(litIndex(cards, 10, 10)).toBe(0);
    expect(litIndex(cards, 150, 40)).toBe(1);
    expect(litIndex(cards, 50, 100)).toBe(2);
  });

  it('includes the edges of a card', () => {
    expect(litIndex(cards, 100, 50)).toBe(0);
    expect(litIndex(cards, 120, 0)).toBe(1);
  });

  it('is -1 between the cards and outside them', () => {
    expect(litIndex(cards, 110, 20)).toBe(-1);
    expect(litIndex(cards, 500, 500)).toBe(-1);
    expect(litIndex([], 0, 0)).toBe(-1);
  });

  it('ignores empty boxes (cards of a hidden tab panel)', () => {
    expect(litIndex([box(0, 0, 0, 0), box(0, 0, 10, 10)], 0, 0)).toBe(1);
  });
});

describe('driftPoint', () => {
  const area = box(0, 1000, 800, 600);

  it('stays inside the area, away from its edges by the margin', () => {
    for (const value of [0, 0.25, 0.5, 0.999]) {
      const point = driftPoint(() => value, area, 100);
      expect(point.x).toBeGreaterThanOrEqual(100);
      expect(point.x).toBeLessThanOrEqual(700);
      expect(point.y).toBeGreaterThanOrEqual(1100);
      expect(point.y).toBeLessThanOrEqual(1500);
    }
  });

  it('falls back to the centre when the area is smaller than twice the margin', () => {
    expect(driftPoint(() => 0, box(0, 0, 100, 100), 80)).toEqual({ x: 50, y: 50 });
  });
});

describe('particleField', () => {
  it('draws the same motes for the same seed, inside the field', () => {
    const first = particleField({ width: 200, height: 400, density: 0.002, seed: 7 });
    const second = particleField({ width: 200, height: 400, density: 0.002, seed: 7 });
    expect(first).toEqual(second);
    expect(first).toHaveLength(160);
    for (const mote of first) {
      expect(mote.x).toBeGreaterThanOrEqual(0);
      expect(mote.x).toBeLessThan(200);
      expect(mote.y).toBeGreaterThanOrEqual(0);
      expect(mote.y).toBeLessThan(400);
      expect(mote.radius).toBeGreaterThan(0);
      expect(mote.alpha).toBeGreaterThan(0);
      expect(mote.alpha).toBeLessThanOrEqual(1);
    }
  });

  it('differs from one seed to another', () => {
    const first = particleField({ width: 100, height: 100, density: 0.01, seed: 1 });
    const second = particleField({ width: 100, height: 100, density: 0.01, seed: 2 });
    expect(first).not.toEqual(second);
  });

  it('is empty for an empty field', () => {
    expect(particleField({ width: 0, height: 100, density: 0.01, seed: 1 })).toEqual([]);
  });
});
