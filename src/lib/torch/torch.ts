// The lamp of the Specialties (E8, S09): which card it lights, where it drifts when nobody holds
// it, and the motes of the water it reveals. Pure: the DOM glue is components/specialties/torch.ts.

export interface Box {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

export interface Mote {
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  readonly alpha: number;
}

/** Index of the box under the point (edges included), -1 if none; empty boxes never match. */
export function litIndex(boxes: readonly Box[], x: number, y: number): number {
  return boxes.findIndex(
    (box) =>
      box.right > box.left &&
      box.bottom > box.top &&
      x >= box.left &&
      x <= box.right &&
      y >= box.top &&
      y <= box.bottom,
  );
}

const between = (start: number, end: number, margin: number, value: number): number =>
  end - start <= 2 * margin
    ? (start + end) / 2
    : start + margin + value * (end - start - 2 * margin);

/** A random point of `area`, at least `margin` from its edges (its centre if it is too small). */
export function driftPoint(
  random: () => number,
  area: Box,
  margin: number,
): { x: number; y: number } {
  return {
    x: between(area.left, area.right, margin, random()),
    y: between(area.top, area.bottom, margin, random()),
  };
}

/** Small deterministic generator (mulberry32): the same field on every visit. */
function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MOTE_RADIUS = { min: 0.4, max: 1.6 } as const;
const MOTE_ALPHA = { min: 0.25, max: 0.9 } as const;

/** Motes in suspension over a field of `width` × `height`, `density` motes per unit of area. */
export function particleField(field: {
  width: number;
  height: number;
  density: number;
  seed: number;
}): Mote[] {
  const count = Math.round(Math.max(0, field.width) * Math.max(0, field.height) * field.density);
  const random = seeded(field.seed);
  return Array.from({ length: count }, () => {
    // Most motes are specks, a few are larger: the square favours the small ones.
    const size = random() ** 2;
    return {
      x: random() * field.width,
      y: random() * field.height,
      radius: MOTE_RADIUS.min + size * (MOTE_RADIUS.max - MOTE_RADIUS.min),
      alpha: MOTE_ALPHA.min + random() * (MOTE_ALPHA.max - MOTE_ALPHA.min),
    };
  });
}
