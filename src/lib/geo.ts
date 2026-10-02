// Projection of the dive sites onto the small map of the Rhône (Places): equirectangular, with the
// longitude scaled by the cosine of the middle latitude, which is exact enough over 60 km.
import type { Coordinates } from './format.ts';

export interface MapFrame {
  readonly north: number;
  readonly south: number;
  readonly west: number;
  readonly east: number;
  /** Width of the drawing in SVG units; the height follows from the frame. */
  readonly width: number;
}

export interface Point {
  readonly x: number;
  readonly y: number;
}

const round = (value: number): number => Math.round(value * 10) / 10;

export function projectPoint({ lat, lng }: Coordinates, frame: MapFrame): Point {
  const middle = ((frame.north + frame.south) / 2) * (Math.PI / 180);
  const scale = frame.width / ((frame.east - frame.west) * Math.cos(middle));
  return {
    x: round((lng - frame.west) * Math.cos(middle) * scale),
    y: round((frame.north - lat) * scale),
  };
}

/** Height of the drawing of a frame, in SVG units. */
export function frameHeight(frame: MapFrame): number {
  return projectPoint({ lat: frame.south, lng: frame.west }, frame).y;
}

const distance = (a: Point, b: Point): number => Math.hypot(b.x - a.x, b.y - a.y);

/** Point of the segment [a, b] nearest to `target`, as a share of the segment (0 → a, 1 → b). */
function nearestOnSegment(a: Point, b: Point, target: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const squared = dx * dx + dy * dy;
  if (squared === 0) return 0;
  const share = ((target.x - a.x) * dx + (target.y - a.y) * dy) / squared;
  return Math.min(1, Math.max(0, share));
}

/**
 * Share of the length of `route` travelled up to its point nearest `target` (0 at the start, 1
 * at the end): where a station sits along the river, for the drawing of the route (E10).
 */
export function fractionAlong(route: readonly Point[], target: Point): number {
  if (route.length < 2) throw new RangeError('A route needs at least two points');
  const lengths = route.slice(1).map((point, index) => distance(route[index] as Point, point));
  const total = lengths.reduce((sum, length) => sum + length, 0);
  let best = { gap: Number.POSITIVE_INFINITY, travelled: 0 };
  let start = 0;
  lengths.forEach((length, index) => {
    const a = route[index] as Point;
    const b = route[index + 1] as Point;
    const share = nearestOnSegment(a, b, target);
    const gap = distance({ x: a.x + share * (b.x - a.x), y: a.y + share * (b.y - a.y) }, target);
    if (gap < best.gap) best = { gap, travelled: start + share * length };
    start += length;
  });
  return total === 0 ? 0 : best.travelled / total;
}
