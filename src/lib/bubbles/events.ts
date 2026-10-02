// Any script may ask for bubbles (the form success, S10) without importing the emitter and GSAP:
// a `bv:bubbles` event on the document, a no-op without the motion module.
export const BUBBLES_EVENT = 'bv:bubbles';

export interface BubblesDetail {
  /** Viewport coordinates, in px. */
  readonly x: number;
  readonly y: number;
  readonly count: number;
  /** Depth the bubbles start from (the HUD's by default). */
  readonly depth?: number;
}
