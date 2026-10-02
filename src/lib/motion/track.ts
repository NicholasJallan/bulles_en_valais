// A horizontal track moved by the scroll (Places, E10): where each panel is centred, and values
// that follow the progress from one panel to the next (the drawing of the river).

export interface Span {
  /** Left edge of the item in the track, in px. */
  readonly start: number;
  readonly width: number;
}

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/**
 * Progress (0 → 1) at which the centre of `item` meets the centre of a window `view` px wide,
 * the track moving left by up to `distance` px.
 */
export function centredProgress(item: Span, view: number, distance: number): number {
  if (distance <= 0) return 0;
  return clamp01((item.start + item.width / 2 - view / 2) / distance);
}

export type Knot = readonly [at: number, value: number];

/** Piecewise linear value at `at`; the end values hold beyond the first and last knots. */
export function interpolate(knots: readonly Knot[], at: number): number {
  const first = knots[0];
  if (first === undefined) throw new RangeError('interpolate needs at least one knot');
  let previous = first;
  if (at <= first[0]) return first[1];
  for (const knot of knots.slice(1)) {
    if (at < knot[0]) {
      const span = knot[0] - previous[0];
      return previous[1] + ((at - previous[0]) / span) * (knot[1] - previous[1]);
    }
    previous = knot;
  }
  return previous[1];
}

/** Index of the value nearest `at` (the first one on a tie), -1 for an empty list. */
export function nearestIndex(values: readonly number[], at: number): number {
  return values.reduce(
    (best, value, index) =>
      best < 0 || Math.abs(value - at) < Math.abs((values[best] as number) - at) ? index : best,
    -1,
  );
}

/** How close the progress must be to a centre to count as there (the scrub lags behind). */
const STEP_EPSILON = 0.01;

/**
 * The panel a previous (-1) or next (1) button goes to: the nearest centre behind or ahead of
 * the progress, -1 when there is none.
 */
export function stepIndex(centres: readonly number[], progress: number, direction: 1 | -1): number {
  if (direction === 1) return centres.findIndex((centre) => centre > progress + STEP_EPSILON);
  return centres.findLastIndex((centre) => centre < progress - STEP_EPSILON);
}

export interface Pin {
  /** Scroll positions where the pin starts and ends, in px. */
  readonly start: number;
  readonly end: number;
}

/** Scroll position at which a pinned track reaches `progress`. */
export function scrollAt(pin: Pin, progress: number): number {
  return Math.round(pin.start + clamp01(progress) * (pin.end - pin.start));
}
