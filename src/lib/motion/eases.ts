import { EASINGS, type CubicBezier } from './tokens.ts';

/** The part of GSAP's `CustomEase` used here (injected, so that this module stays testable). */
export interface CustomEaseLike {
  create(id: string, data: string): unknown;
}

/** SVG path of a cubic-bezier from (0,0) to (1,1), as `CustomEase` reads it. */
export const easePath = ([x1, y1, x2, y2]: CubicBezier): string =>
  `M0,0 C${x1},${y1} ${x2},${y2} 1,1`;

/** Declares the easings of the tokens once, as GSAP eases named `buoyant`, `surface`… */
export function registerEases(customEase: CustomEaseLike): void {
  for (const [name, curve] of Object.entries(EASINGS)) customEase.create(name, easePath(curve));
}
