// Ascent rate alarm of the HUD (« ▲ SLOW »), like a dive computer. Off by default (S06 brief):
// the depths are narrative, so the limit is in metres of the page per second.

export const ASCENT_LIMIT_M_PER_S = 12;
const MIN_INTERVAL_MS = 16;

export interface DepthSample {
  readonly depth: number;
  /** Milliseconds. */
  readonly time: number;
}

export function isFastAscent(
  previous: DepthSample,
  current: DepthSample,
  limit = ASCENT_LIMIT_M_PER_S,
): boolean {
  const elapsed = current.time - previous.time;
  if (elapsed < MIN_INTERVAL_MS) return false;
  return ((previous.depth - current.depth) / elapsed) * 1000 > limit;
}
