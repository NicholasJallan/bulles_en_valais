// E7 prototype for the styleguide: one 2D canvas, a pool of 64 bubbles, Boyle's law.
// The tested engine of the page: src/lib/bubbles/ (S08), drawn by src/scripts/bubbles/emitter.ts.
import type { Cleanup } from '@/lib/controllers.ts';

type TickerCallback = (time: number, deltaTime: number, frame: number) => void;

interface Ticker {
  add(callback: TickerCallback): unknown;
  remove(callback: TickerCallback): unknown;
}

export interface BubblesOptions {
  readonly stage: HTMLElement;
  readonly canvas: HTMLCanvasElement;
  readonly trigger: HTMLElement;
  readonly ticker: Ticker;
}

// Mutable on purpose: a particle pool is rewritten 60 times a second without allocating.
interface Bubble {
  alive: boolean;
  x0: number;
  y: number;
  r0: number;
  releaseDepth: number;
  phase: number;
  wobble: number;
}

interface Scene {
  readonly context: CanvasRenderingContext2D;
  readonly size: { width: number; height: number };
  readonly pool: Bubble[];
  clock: number;
}

const POOL_SIZE = 64;
const STAGE_DEPTH_M = 40; // depth of the bottom of the stage, the top being the surface
const RISE_SPEED = 55; // px/s of a 1 px bubble: the speed grows with the square root of the radius
const MAX_PIXEL_RATIO = 2;
const MAX_STEP_MS = 50;
const HOVER_BUBBLES = 3;
const CLICK_BUBBLES = 16;

/** Boyle: the volume grows as the pressure falls (+1 bar every 10 m), so the radius by ∛. */
const radiusAt = (r0: number, from: number, to: number): number =>
  r0 * ((10 + from) / (10 + to)) ** (1 / 3);

const depthAt = (scene: Scene, y: number): number =>
  STAGE_DEPTH_M * Math.min(1, Math.max(0, y / Math.max(1, scene.size.height)));

function draw(context: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  context.globalAlpha = 0.12;
  context.beginPath();
  context.arc(x, y, r, 0, Math.PI * 2);
  context.fill();
  context.globalAlpha = 0.65;
  context.lineWidth = Math.max(0.75, r * 0.12);
  context.stroke();
  context.globalAlpha = 0.9;
  context.beginPath();
  context.arc(x - r * 0.38, y - r * 0.38, r * 0.22, 0, Math.PI * 2);
  context.fill();
}

function resize(scene: Scene, stage: HTMLElement, canvas: HTMLCanvasElement, colour: string): void {
  const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
  scene.size.width = stage.clientWidth;
  scene.size.height = stage.clientHeight;
  canvas.width = Math.round(scene.size.width * ratio);
  canvas.height = Math.round(scene.size.height * ratio);
  scene.context.setTransform(ratio, 0, 0, ratio, 0, 0);
  scene.context.fillStyle = colour;
  scene.context.strokeStyle = colour;
}

/** Moves and draws the bubbles; returns how many are still rising. */
function step(scene: Scene, deltaTime: number): number {
  const seconds = Math.min(deltaTime, MAX_STEP_MS) / 1000;
  scene.clock += seconds;
  scene.context.clearRect(0, 0, scene.size.width, scene.size.height);
  let active = 0;
  for (const bubble of scene.pool) {
    if (!bubble.alive) continue;
    const r = radiusAt(bubble.r0, bubble.releaseDepth, depthAt(scene, bubble.y));
    bubble.y -= RISE_SPEED * Math.sqrt(r) * seconds;
    if (bubble.y + r < 0) {
      bubble.alive = false;
      continue;
    }
    const x = bubble.x0 + Math.sin(scene.clock * 2.6 + bubble.phase) * bubble.wobble;
    draw(scene.context, x, bubble.y, r);
    active += 1;
  }
  return active;
}

/** Releases up to `count` bubbles from the top of the trigger; returns how many were free. */
function release(scene: Scene, stage: HTMLElement, trigger: HTMLElement, count: number): number {
  const origin = trigger.getBoundingClientRect();
  const box = stage.getBoundingClientRect();
  const x = origin.left - box.left + origin.width / 2;
  const y = origin.top - box.top;
  const free = scene.pool.filter((bubble) => !bubble.alive).slice(0, count);
  for (const bubble of free) {
    const r0 = 1.4 + Math.random() ** 2 * 4;
    Object.assign(bubble, {
      alive: true,
      x0: x + (Math.random() - 0.5) * origin.width * 0.6,
      y: y - Math.random() * 10,
      r0,
      releaseDepth: depthAt(scene, y),
      phase: Math.random() * Math.PI * 2,
      wobble: 1.5 + r0 * 0.6,
    });
  }
  return free.length;
}

export function createBubbles({ stage, canvas, trigger, ticker }: BubblesOptions): Cleanup {
  const context = canvas.getContext('2d');
  if (context === null) return () => undefined;
  const styles = getComputedStyle(stage);
  const colour = styles.getPropertyValue('--c-foam').trim() || styles.color;
  const pool = Array.from({ length: POOL_SIZE }, (): Bubble => ({
    alive: false,
    x0: 0,
    y: 0,
    r0: 0,
    releaseDepth: 0,
    phase: 0,
    wobble: 0,
  }));
  const scene: Scene = { context, size: { width: 0, height: 0 }, pool, clock: 0 };
  let running = false;

  const tick: TickerCallback = (_time, deltaTime) => {
    if (step(scene, deltaTime) > 0) return;
    running = false;
    ticker.remove(tick);
  };
  const emit = (count: number): void => {
    if (release(scene, stage, trigger, count) === 0 || running) return;
    running = true;
    ticker.add(tick);
  };
  const onEnter = (): void => emit(HOVER_BUBBLES);
  const onClick = (): void => emit(CLICK_BUBBLES);
  const observer = new ResizeObserver(() => resize(scene, stage, canvas, colour));
  observer.observe(stage);
  resize(scene, stage, canvas, colour);
  trigger.addEventListener('pointerenter', onEnter);
  trigger.addEventListener('click', onClick);

  return () => {
    ticker.remove(tick);
    observer.disconnect();
    trigger.removeEventListener('pointerenter', onEnter);
    trigger.removeEventListener('click', onClick);
  };
}
