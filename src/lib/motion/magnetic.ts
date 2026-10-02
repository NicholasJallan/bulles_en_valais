// Magnetic pull of the lamp buttons (E17): they lean towards the pointer, 6 px at most.

export const MAGNETIC_MAX_PX = 6;

export interface Box {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

const pull = (pointer: number, start: number, size: number, max: number): number => {
  if (size <= 0) return 0;
  const ratio = ((pointer - start) / size) * 2 - 1;
  return Math.round(Math.min(1, Math.max(-1, ratio)) * max * 100) / 100 + 0;
};

/** Offset of the button for a pointer at (x, y), in pixels. */
export function magneticOffset(box: Box, x: number, y: number, max = MAGNETIC_MAX_PX) {
  return { x: pull(x, box.left, box.width, max), y: pull(y, box.top, box.height, max) };
}
