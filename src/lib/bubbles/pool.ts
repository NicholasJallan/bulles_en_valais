// The particles of the bubble emitter (E7), without the canvas: a fixed pool, rewritten on each
// frame without allocating (mutable on purpose), in viewport pixels.
import { radiusAtDepth, riseSpeed } from './boyle.ts';

export interface Bubble {
  alive: boolean;
  /** Column the bubble sways around, and its current position. */
  x0: number;
  x: number;
  y: number;
  /** Where it was released: the depth follows its height from there. */
  y0: number;
  releaseDepth: number;
  r0: number;
  /** Current radius, after Boyle. */
  r: number;
  phase: number;
  wobble: number;
  age: number;
}

export interface BubbleField {
  /** Height of one metre of water on screen: rising by that much takes 1 m off the depth. */
  readonly pxPerMetre: number;
  /** Rising speed of a bubble of 1 px, in px/s. */
  readonly speed: number;
}

export interface Release {
  readonly x: number;
  readonly y: number;
  readonly depth: number;
  readonly count: number;
  /** Width over which the bubbles are scattered, centred on x. */
  readonly spread: number;
}

const MIN_RADIUS = 1.6;
/** Largest radius at release, in px. */
export const MAX_RADIUS = 5.2;
const MAX_STEP_S = 0.05;
const SWAY_RATE = 2.6;

export function createPool(size: number): Bubble[] {
  return Array.from({ length: size }, () => ({
    alive: false,
    x0: 0,
    x: 0,
    y: 0,
    y0: 0,
    releaseDepth: 0,
    r0: 0,
    r: 0,
    phase: 0,
    wobble: 0,
    age: 0,
  }));
}

/** Wakes up to `count` idle bubbles; returns how many were free. */
export function spawnBubbles(
  pool: Bubble[],
  release: Release,
  random: () => number = Math.random,
): number {
  let spawned = 0;
  for (const bubble of pool) {
    if (spawned === release.count) break;
    if (bubble.alive) continue;
    // Mostly small bubbles, a few big ones.
    const r0 = MIN_RADIUS + random() ** 2 * (MAX_RADIUS - MIN_RADIUS);
    const x0 = release.x + (random() - 0.5) * release.spread;
    Object.assign(bubble, {
      alive: true,
      x0,
      x: x0,
      y: release.y,
      y0: release.y,
      releaseDepth: Math.max(0, release.depth),
      r0,
      r: r0,
      phase: random() * Math.PI * 2,
      wobble: 1 + r0 * 0.6,
      age: 0,
    });
    spawned += 1;
  }
  return spawned;
}

const depthOf = (bubble: Bubble, field: BubbleField): number =>
  Math.max(0, bubble.releaseDepth - (bubble.y0 - bubble.y) / field.pxPerMetre);

/** Moves the bubbles by `seconds`; returns how many are still on screen. */
export function stepBubbles(pool: Bubble[], seconds: number, field: BubbleField): number {
  const dt = Math.min(Math.max(0, seconds), MAX_STEP_S);
  let active = 0;
  for (const bubble of pool) {
    if (!bubble.alive) continue;
    bubble.age += dt;
    bubble.r = radiusAtDepth(bubble.r0, bubble.releaseDepth, depthOf(bubble, field));
    bubble.y -= riseSpeed(bubble.r, field.speed) * dt;
    bubble.x = bubble.x0 + Math.sin(bubble.age * SWAY_RATE + bubble.phase) * bubble.wobble;
    if (bubble.y + bubble.r < 0) {
      bubble.alive = false;
      continue;
    }
    active += 1;
  }
  return active;
}
