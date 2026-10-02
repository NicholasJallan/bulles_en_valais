// Scale of the depth ladder (01-direction-artistique.md §7, E9): real down to 40 m, the limit of
// recreational diving, then compressed so that the technical depths still fit on a screen.

export const LADDER_BOTTOM = 120;
const KNEE_DEPTH = 40;
/** Share of the ladder taken by the first 40 m. */
const KNEE_POSITION = 0.6;

/** Position of a depth on the ladder, from 0 (surface) to 1 (120 m). */
export function ladderPosition(depth: number): number {
  if (!(depth >= 0 && depth <= LADDER_BOTTOM)) {
    throw new RangeError(`The ladder goes from 0 to ${LADDER_BOTTOM} m, got ${depth}`);
  }
  if (depth <= KNEE_DEPTH) return (depth / KNEE_DEPTH) * KNEE_POSITION;
  return (
    KNEE_POSITION + ((depth - KNEE_DEPTH) / (LADDER_BOTTOM - KNEE_DEPTH)) * (1 - KNEE_POSITION)
  );
}

/** Depth at a position of the ladder (the inverse of ladderPosition), kept within the ladder. */
export function depthAtPosition(position: number): number {
  const p = Number.isNaN(position) ? 0 : Math.min(1, Math.max(0, position));
  if (p <= KNEE_POSITION) return (p / KNEE_POSITION) * KNEE_DEPTH;
  return KNEE_DEPTH + ((p - KNEE_POSITION) / (1 - KNEE_POSITION)) * (LADDER_BOTTOM - KNEE_DEPTH);
}

export interface LadderTick {
  readonly depth: number;
  readonly position: number;
  /** Every 10 m: a longer tick, with its figure. */
  readonly major: boolean;
}

const FINE_STEP = 5;
const COARSE_STEP = 10;

/** Graduations of the ruler: every 5 m down to 40 m, where the scale is real, then every 10 m. */
export function ladderTicks(): readonly LadderTick[] {
  const fine = Array.from({ length: KNEE_DEPTH / FINE_STEP + 1 }, (_, i) => i * FINE_STEP);
  const coarse = Array.from(
    { length: (LADDER_BOTTOM - KNEE_DEPTH) / COARSE_STEP },
    (_, i) => KNEE_DEPTH + (i + 1) * COARSE_STEP,
  );
  return [...fine, ...coarse].map((depth) => ({
    depth,
    position: ladderPosition(depth),
    major: depth % COARSE_STEP === 0,
  }));
}

export interface DepthGroup<T> {
  readonly depth: number;
  readonly items: readonly T[];
}

/** Items gathered by depth, shallowest first; items keep their order inside a group. */
export function groupByDepth<T extends { readonly maxDepth: number }>(
  items: readonly T[],
): readonly DepthGroup<T>[] {
  const depths = [...new Set(items.map((item) => item.maxDepth))].toSorted((a, b) => a - b);
  return depths.map((depth) => ({ depth, items: items.filter((item) => item.maxDepth === depth) }));
}
