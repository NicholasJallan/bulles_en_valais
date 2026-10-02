// Bubbles that a diver would believe (01-direction-artistique.md §7, E7): the pressure grows by
// 1 bar every 10 m, the volume of a bubble follows Boyle's law (P·V constant), so its radius
// grows by the cube root of the pressure ratio as it rises; it rises faster when it is bigger.

const BAR_DEPTH = 10;

const assertDepth = (depth: number): void => {
  if (!(depth >= 0)) throw new RangeError(`A depth is positive, got ${depth}`);
};

/** Radius at `toDepth` of a bubble of radius `r0` released at `fromDepth` (metres). */
export function radiusAtDepth(r0: number, fromDepth: number, toDepth: number): number {
  if (!(r0 >= 0)) throw new RangeError(`A radius is positive, got ${r0}`);
  assertDepth(fromDepth);
  assertDepth(toDepth);
  return r0 * ((BAR_DEPTH + fromDepth) / (BAR_DEPTH + toDepth)) ** (1 / 3);
}

/** Rising speed of a bubble of radius `r`, ∝ √r; `unit` is the speed of a radius of 1. */
export function riseSpeed(r: number, unit = 1): number {
  return unit * Math.sqrt(r);
}
