import { describe, expect, it } from 'vitest';
import { PLACES } from '../data/places.ts';
import { RHONE, RHONE_FRAME } from '../data/rhone.ts';
import { fractionAlong, frameHeight, projectPoint, type MapFrame } from './geo.ts';

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

describe('fractionAlong', () => {
  // An L: 30 units east, then 40 units south (70 in all).
  const route = [
    { x: 0, y: 0 },
    { x: 30, y: 0 },
    { x: 30, y: 40 },
  ];

  it('is the share of the route travelled to the point of the route nearest the target', () => {
    expect(fractionAlong(route, { x: 0, y: 0 })).toBe(0);
    expect(fractionAlong(route, { x: 30, y: 0 })).toBeCloseTo(30 / 70);
    expect(fractionAlong(route, { x: 30, y: 40 })).toBe(1);
    // Beside the route: projected onto it.
    expect(fractionAlong(route, { x: 15, y: -5 })).toBeCloseTo(15 / 70);
    expect(fractionAlong(route, { x: 40, y: 20 })).toBeCloseTo(50 / 70);
  });

  it('clamps targets beyond the ends', () => {
    expect(fractionAlong(route, { x: -20, y: 0 })).toBe(0);
    expect(fractionAlong(route, { x: 30, y: 90 })).toBe(1);
  });

  it('refuses a route of fewer than two points', () => {
    expect(() => fractionAlong([{ x: 0, y: 0 }], { x: 0, y: 0 })).toThrow(RangeError);
  });
});

describe('the three dive sites on the map of the Rhône', () => {
  const [sion, rosel, leman] = PLACES.map((place) => projectPoint(place.coords, RHONE_FRAME));

  it('puts Sion to the east, the Rosel to the south-west of it, Lake Geneva to the north-west', () => {
    expect(sion && rosel && leman).toBeTruthy();
    if (!sion || !rosel || !leman) return;
    expect(rosel.x).toBeLessThan(sion.x);
    expect(rosel.y).toBeGreaterThan(sion.y);
    expect(leman.x).toBeLessThan(rosel.x);
    expect(leman.y).toBeLessThan(sion.y);
  });

  it('keeps every site inside the frame', () => {
    const height = frameHeight(RHONE_FRAME);
    for (const site of [sion, rosel, leman]) {
      expect(site?.x).toBeGreaterThan(0);
      expect(site?.x).toBeLessThan(RHONE_FRAME.width);
      expect(site?.y).toBeGreaterThan(0);
      expect(site?.y).toBeLessThan(height);
    }
  });

  it('meets the sites in the order of the river, Sion near its start, the lake at its end', () => {
    const river = RHONE.map(([lat, lng]) => projectPoint({ lat, lng }, RHONE_FRAME));
    const fractions = [sion, rosel, leman].map((site) =>
      fractionAlong(river, site ?? { x: 0, y: 0 }),
    );
    expect(fractions[0]).toBeLessThan(0.05);
    expect(fractions[1]).toBeGreaterThan(0.3);
    expect(fractions[1]).toBeLessThan(0.7);
    expect(fractions[2]).toBeGreaterThan(0.95);
  });
});
