import { describe, expect, it } from 'vitest';
import { DIVE_PROFILE } from '@/data/sections.ts';
import { fillHiddenDepths, profileGeometry, profilePoint } from './profile.ts';

describe('fillHiddenDepths', () => {
  it('keeps the depths of the visible sections', () => {
    const filled = fillHiddenDepths(DIVE_PROFILE);
    expect(filled.find((s) => s.id === 'agencies')).toMatchObject({ start: 8, end: 15 });
  });

  it('runs the hidden sections from the depth before them to the depth after them', () => {
    const filled = fillHiddenDepths(DIVE_PROFILE);
    // interlude-descent ends at 18 m, interlude-light starts at 40 m: depth and compare share it.
    expect(filled.find((s) => s.id === 'depth')).toMatchObject({
      start: 18,
      end: 29,
      hidden: true,
    });
    expect(filled.find((s) => s.id === 'compare')).toMatchObject({
      start: 29,
      end: 40,
      hidden: true,
    });
  });

  it('keeps the order and the length of the profile', () => {
    expect(fillHiddenDepths(DIVE_PROFILE).map((s) => s.id)).toEqual(DIVE_PROFILE.map((s) => s.id));
  });

  it('holds a hidden section at the surface without neighbours', () => {
    expect(fillHiddenDepths([{ id: 'x', hud: null }])).toEqual([
      { id: 'x', start: 0, end: 0, hidden: true },
    ]);
  });
});

describe('profileGeometry', () => {
  const geometry = profileGeometry(fillHiddenDepths(DIVE_PROFILE), { width: 160, height: 60 });

  it('places one waypoint per section, left to right', () => {
    expect(geometry.waypoints).toHaveLength(DIVE_PROFILE.length);
    const xs = geometry.waypoints.map((point) => point.x);
    expect(xs).toEqual([...xs].sort((a, b) => a - b));
  });

  it('draws a U: surface at both ends, the bottom in the middle', () => {
    const ys = geometry.waypoints.map((point) => point.y);
    expect(geometry.end.y).toBe(ys[0]);
    expect(Math.max(...ys)).toBeGreaterThan(ys[0] ?? 0);
  });

  it('describes an SVG path that starts with a move', () => {
    expect(geometry.path).toMatch(/^M[\d.]+,[\d.]+( L[\d.]+,[\d.]+)+$/);
  });

  it('stays within the box', () => {
    for (const { x, y } of geometry.waypoints) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(160);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(60);
    }
  });

  it('puts the active dot on the line, between two waypoints', () => {
    const point = profilePoint(geometry, 3, 0.5, 11.5);
    const [from, to] = [geometry.waypoints[3], geometry.waypoints[4]];
    expect(point.x).toBeCloseTo(((from?.x ?? 0) + (to?.x ?? 0)) / 2);
    expect(point.y).toBeCloseTo(geometry.depthToY(11.5));
  });

  it('keeps the dot on the last waypoint at the end of the dive', () => {
    const last = DIVE_PROFILE.length - 1;
    expect(profilePoint(geometry, last, 1, 0).x).toBeCloseTo(160 - geometry.padding);
  });
});
