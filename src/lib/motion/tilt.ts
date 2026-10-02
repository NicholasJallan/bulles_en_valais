// Tilt of the gift voucher under the pointer (E11): 8° at most, and the reflection that slides
// across it the other way.
import type { Box } from './magnetic.ts';

export const TILT_MAX_DEG = 8;

export interface Tilt {
  /** Degrees around the horizontal axis: positive tips the top edge away. */
  readonly rotateX: number;
  /** Degrees around the vertical axis: positive turns the right edge away. */
  readonly rotateY: number;
  /** Shift of the reflection, -1 → 1 of its travel on each axis. */
  readonly sheenX: number;
  readonly sheenY: number;
}

/** -1 at the start edge, 1 at the end edge, clamped beyond. */
const along = (pointer: number, start: number, size: number): number =>
  size <= 0 ? 0 : Math.min(1, Math.max(-1, ((pointer - start) / size) * 2 - 1));

const round = (value: number): number => Math.round(value * 100) / 100 + 0;

export function tiltAt(box: Box, x: number, y: number, max = TILT_MAX_DEG): Tilt {
  const across = along(x, box.left, box.width);
  const down = along(y, box.top, box.height);
  return {
    rotateX: round(-down * max),
    rotateY: round(across * max),
    sheenX: round(-across),
    sheenY: round(-down),
  };
}
