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
