import { describe, expect, it } from 'vitest';
import { waterlinePoints, waterlinePolygon } from './waterline.ts';

const yValues = (points: ReadonlyArray<readonly [number, number]>): number[] =>
  points.map(([, y]) => y);

describe('waterlinePoints', () => {
  it('draws 24 points across the whole width by default', () => {
    const points = waterlinePoints(0.5);
    expect(points).toHaveLength(24);
    expect(points[0]?.[0]).toBe(0);
    expect(points.at(-1)?.[0]).toBe(100);
  });

  it('starts below the box and ends above it, so the image is first hidden then whole', () => {
    expect(Math.min(...yValues(waterlinePoints(0)))).toBeGreaterThanOrEqual(100);
    expect(Math.max(...yValues(waterlinePoints(1)))).toBeLessThanOrEqual(0);
  });

  it('rises as the progress grows', () => {
    const mean = (progress: number) => {
      const values = yValues(waterlinePoints(progress));
      return values.reduce((total, y) => total + y, 0) / values.length;
    };
    expect(mean(0.25)).toBeGreaterThan(mean(0.5));
    expect(mean(0.5)).toBeGreaterThan(mean(0.75));
  });

  it('clamps the progress to [0, 1]', () => {
    expect(waterlinePoints(-1)).toEqual(waterlinePoints(0));
    expect(waterlinePoints(2)).toEqual(waterlinePoints(1));
  });

  it('moves the waves with the phase, not the water level', () => {
    const still = waterlinePoints(0.5, { phase: 0 });
    const moved = waterlinePoints(0.5, { phase: Math.PI / 2 });
    expect(moved).not.toEqual(still);
    const level = (points: typeof still) => yValues(points).reduce((a, b) => a + b, 0);
    expect(Math.abs(level(moved) - level(still)) / still.length).toBeLessThan(2);
  });

  it('puts a single point at the left edge', () => {
    expect(waterlinePoints(1, { points: 1, amplitude: 0 })).toEqual([[0, 0]]);
  });

  it('accepts another number of points and amplitude', () => {
    const points = waterlinePoints(0.5, { points: 8, amplitude: 0 });
    expect(points).toHaveLength(8);
    expect(new Set(yValues(points)).size).toBe(1);
  });
});

describe('waterlinePolygon', () => {
  it('closes the wave along the bottom of the box, in CSS clip-path notation', () => {
    const polygon = waterlinePolygon(1, { points: 2, amplitude: 0 });
    expect(polygon).toBe('polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)');
  });
});
