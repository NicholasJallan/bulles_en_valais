// « Water line » reveal (E6): a wavy line rises through the box, the image shows beneath it.

export type Point = readonly [x: number, y: number];

export interface WaterlineOptions {
  /** Points along the line (24 in the art direction). */
  readonly points?: number;
  /** Half the height of the waves, in percent of the box. */
  readonly amplitude?: number;
  /** Number of waves across the width. */
  readonly waves?: number;
  /** Shift of the waves, in radians: animate it to make the water move. */
  readonly phase?: number;
}

const DEFAULTS = { points: 24, amplitude: 2.5, waves: 1.5, phase: 0 } as const;

const round = (value: number): number => Math.round(value * 100) / 100;

/**
 * Points of the line, in percent of the box, for a progress from 0 (line just below the box,
 * nothing shown) to 1 (line just above it, everything shown).
 */
export function waterlinePoints(progress: number, options: WaterlineOptions = {}): Point[] {
  const { points, amplitude, waves, phase } = { ...DEFAULTS, ...options };
  const clamped = Math.min(1, Math.max(0, progress));
  const level = 100 + amplitude - clamped * (100 + 2 * amplitude);
  return Array.from({ length: points }, (_, index) => {
    const along = points === 1 ? 0 : index / (points - 1);
    const y = level + amplitude * Math.sin(along * waves * 2 * Math.PI + phase);
    return [round(along * 100), round(y)] as const;
  });
}

/** CSS `clip-path` showing what lies under the water line. */
export function waterlinePolygon(progress: number, options: WaterlineOptions = {}): string {
  const line = waterlinePoints(progress, options).map(([x, y]) => `${x}% ${y}%`);
  return `polygon(${[...line, '100% 100%', '0% 100%'].join(', ')})`;
}
