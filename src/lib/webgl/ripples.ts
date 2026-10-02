// Ripples of the hero surface (E1): at most 8 rings, passed to the shader as uRipples[8]
// (x, y in screen UV, age in seconds), and the pointer gestures that create them.

export interface Ripple {
  /** Screen UV, 0 to 1, y up. */
  readonly x: number;
  readonly y: number;
  /** Time of birth, in seconds of the surface clock. */
  readonly born: number;
}

export const MAX_RIPPLES = 8;
/** A ring has faded out after this long (the shader damps it to nothing). */
export const RIPPLE_LIFETIME_S = 4;
const EMPTY_SLOT = -1;

export function addRipple(list: readonly Ripple[], ripple: Ripple): Ripple[] {
  return [...list, ripple].slice(-MAX_RIPPLES);
}

/** The same list when nothing expired, so that callers can skip work. */
export function liveRipples(list: readonly Ripple[], now: number): readonly Ripple[] {
  const live = list.filter((ripple) => now - ripple.born < RIPPLE_LIFETIME_S);
  return live.length === list.length ? list : live;
}

/** Fills the uniform buffer (8 × vec3) in place: it is uploaded on every frame. */
export function writeRipples(list: readonly Ripple[], now: number, out: number[]): void {
  for (let slot = 0; slot < MAX_RIPPLES; slot += 1) {
    const ripple = list[slot];
    out[slot * 3] = ripple?.x ?? 0;
    out[slot * 3 + 1] = ripple?.y ?? 0;
    out[slot * 3 + 2] = ripple === undefined ? EMPTY_SLOT : now - ripple.born;
  }
}

/** A pointer position in CSS pixels, with its time in milliseconds. */
export interface PointerSample {
  readonly x: number;
  readonly y: number;
  readonly t: number;
}

export interface EmitOptions {
  readonly minIntervalMs: number;
  readonly minDistancePx: number;
}

const distance = (a: PointerSample, b: PointerSample): number => Math.hypot(b.x - a.x, b.y - a.y);

/** A moving mouse leaves a ripple now and then, not one per event. */
export function shouldEmit(
  last: PointerSample | undefined,
  next: PointerSample,
  { minIntervalMs, minDistancePx }: EmitOptions,
): boolean {
  if (last === undefined) return true;
  return next.t - last.t >= minIntervalMs && distance(last, next) >= minDistancePx;
}

const TAP_MAX_MS = 300;
const TAP_MAX_PX = 10;

/** On touch screens, only a short tap makes a ripple: never a swipe (it scrolls the page). */
export function isTap(down: PointerSample, up: PointerSample): boolean {
  return up.t - down.t <= TAP_MAX_MS && distance(down, up) <= TAP_MAX_PX;
}
