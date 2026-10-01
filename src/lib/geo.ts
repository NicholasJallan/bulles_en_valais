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
