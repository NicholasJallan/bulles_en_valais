// TypeScript mirror of the motion tokens of src/styles/tokens.css (checked by tokens.test.ts).

export type CubicBezier = readonly [x1: number, y1: number, x2: number, y2: number];

/** Durations in milliseconds, `--dur-<name>` in CSS. */
export const DURATIONS_MS = {
  instant: 120,
  fast: 240,
  base: 480,
  slow: 900,
  rise: 1100, // neutral-buoyancy titles (E5)
  drift: 1400,
  tide: 2400,
} as const;

/** Delays between the items of a sequence, `--stagger-<name>` in CSS. */
export const STAGGER_MS = {
  line: 80,
} as const;

/** Easings, `--ease-<name>` in CSS and GSAP `CustomEase` names. */
export const EASINGS = {
  buoyant: [0.16, 1, 0.3, 1], // entrances: settle without bouncing
  surface: [0.22, 1, 0.36, 1], // interface feedback
  drift: [0.45, 0, 0.55, 1], // floating, slow loops
  sink: [0.55, 0, 0.75, 0.2], // exits: sink slowly
} as const satisfies Record<string, CubicBezier>;

export type EasingName = keyof typeof EASINGS;

/** GSAP durations and delays are in seconds. */
export const seconds = (milliseconds: number): number => milliseconds / 1000;

export const cssCubicBezier = ([x1, y1, x2, y2]: CubicBezier): string =>
  `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
