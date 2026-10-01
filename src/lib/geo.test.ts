import { describe, expect, it } from 'vitest';
import { frameHeight, projectPoint, type MapFrame } from './geo.ts';

const FRAME: MapFrame = { north: 46.5, south: 46, west: 6.5, east: 7.5, width: 400 };

describe('projectPoint', () => {
  it('maps the north-west corner to the origin and the south-east corner to the far corner', () => {
    expect(projectPoint({ lat: 46.5, lng: 6.5 }, FRAME)).toEqual({ x: 0, y: 0 });
    const corner = projectPoint({ lat: 46, lng: 7.5 }, FRAME);
    expect(corner.x).toBe(400);
    // A degree of longitude is shorter than a degree of latitude: cos(46.25°) ≈ 0.69.
    expect(corner.y).toBeCloseTo(400 * (0.5 / (1 * Math.cos((46.25 * Math.PI) / 180))), 0);
    expect(frameHeight(FRAME)).toBe(corner.y);
  });

  it('rounds to a tenth of a unit, enough for an SVG path', () => {
    const { x, y } = projectPoint({ lat: 46.2333, lng: 7.3667 }, FRAME);
    expect(x).toBe(346.7);
    expect(Number.isInteger(y * 10)).toBe(true);
  });
});
