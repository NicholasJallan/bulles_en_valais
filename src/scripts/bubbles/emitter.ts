// Bubble emitter (02-architecture.md §10, E7): one fixed 2D canvas over the page, created on the
// first release, a pool of 64 bubbles (src/lib/bubbles/pool.ts) moved on the GSAP ticker only
// while some are rising. Started by the motion module: no bubble without motion.
import { gsap } from '@/scripts/motion/gsap.ts';
import type { Cleanup } from '@/lib/controllers.ts';
import {
  createPool,
  MAX_RADIUS,
  spawnBubbles,
  stepBubbles,
  type Bubble,
} from '@/lib/bubbles/pool.ts';

/** Any script may ask for bubbles (the form success in S10) without importing the emitter. */
export const BUBBLES_EVENT = 'bv:bubbles';

export interface BubblesDetail {
  readonly x: number;
  readonly y: number;
  readonly count: number;
  readonly depth?: number;
}

export interface Emitter {
  /** Releases `count` bubbles around (x, y), in viewport pixels, from `depth` metres. */
  burst(x: number, y: number, count: number, depth: number): void;
  /** Bubbles follow a fine pointer moving over `element`. */
  trail(element: HTMLElement, depth: () => number): Cleanup;
  destroy(): void;
}

const POOL_SIZE = 64;
const FIELD = { pxPerMetre: 40, speed: 64 };
const MAX_PIXEL_RATIO = 2;
const SPRITE_SIZE = 64;
const TRAIL_INTERVAL_MS = 90;
/** The bubble, in foam: body transparent at the centre and thicker at the rim, then a highlight. */
const SPRITE = {
  body: [
    [0, 0],
    [0.75, 0.08],
    [1, 0.35],
  ],
  rimAlpha: 0.7,
  rimWidth: 2.5,
  highlightAlpha: 0.9,
} as const;
const TRAIL_DISTANCE_PX = 14;

/** A bubble drawn once (radial gradient, rim and highlight), then scaled: no gradient per frame. */
function drawSprite(colour: string): HTMLCanvasElement {
  const sprite = document.createElement('canvas');
  sprite.width = SPRITE_SIZE;
  sprite.height = SPRITE_SIZE;
  const context = sprite.getContext('2d');
  if (context === null) return sprite;
  const c = SPRITE_SIZE / 2;
  const r = c - 1;
  context.fillStyle = colour;
  context.strokeStyle = colour;
  context.beginPath();
  context.arc(c, c, r, 0, Math.PI * 2);
  context.fill();
  // Keeps the foam colour, with the alpha of the gradient.
  const body = context.createRadialGradient(c, c, r * 0.2, c, c, r);
  for (const [offset, alpha] of SPRITE.body) body.addColorStop(offset, `rgb(0 0 0 / ${alpha})`);
  context.globalCompositeOperation = 'destination-in';
  context.fillStyle = body;
  context.fill();
  context.globalCompositeOperation = 'source-over';
  context.globalAlpha = SPRITE.rimAlpha;
  context.lineWidth = SPRITE.rimWidth;
  context.beginPath();
  context.arc(c, c, r - SPRITE.rimWidth / 2, 0, Math.PI * 2);
  context.stroke();
  context.globalAlpha = SPRITE.highlightAlpha;
  context.fillStyle = colour;
  context.beginPath();
  context.ellipse(c - r * 0.38, c - r * 0.4, r * 0.22, r * 0.15, -Math.PI / 4, 0, Math.PI * 2);
  context.fill();
  return sprite;
}

interface Stage {
  readonly canvas: HTMLCanvasElement;
  readonly context: CanvasRenderingContext2D;
  readonly sprite: HTMLCanvasElement;
  width: number;
  height: number;
}

function createStage(): Stage | undefined {
  const canvas = document.createElement('canvas');
  canvas.className = 'bubbles-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.dataset.bubbles = '';
  const context = canvas.getContext('2d');
  if (context === null) return undefined;
  const colour = getComputedStyle(document.documentElement).getPropertyValue('--c-foam').trim();
  document.body.append(canvas);
  return { canvas, context, sprite: drawSprite(colour || 'white'), width: 0, height: 0 };
}

function fit(stage: Stage): void {
  const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
  stage.width = window.innerWidth;
  stage.height = window.innerHeight;
  stage.canvas.width = Math.round(stage.width * ratio);
  stage.canvas.height = Math.round(stage.height * ratio);
  stage.context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function draw(stage: Stage, pool: readonly Bubble[]): void {
  stage.context.clearRect(0, 0, stage.width, stage.height);
  for (const bubble of pool) {
    if (!bubble.alive) continue;
    const size = bubble.r * 2;
    stage.context.drawImage(stage.sprite, bubble.x - bubble.r, bubble.y - bubble.r, size, size);
  }
}

export function createEmitter(): Emitter {
  const pool = createPool(POOL_SIZE);
  let stage: Stage | undefined;
  let running = false;

  const tick = (_time: number, deltaTime: number): void => {
    if (stage === undefined) return;
    const active = stepBubbles(pool, deltaTime / 1000, FIELD);
    draw(stage, pool);
    if (active > 0) return;
    running = false;
    gsap.ticker.remove(tick);
  };
  // Resized once per frame at most: each fit reallocates the canvas.
  let resizeFrame = 0;
  const onResize = (): void => {
    if (resizeFrame !== 0) return;
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = 0;
      if (stage !== undefined) fit(stage);
    });
  };

  const burst: Emitter['burst'] = (x, y, count, depth) => {
    if (stage === undefined) {
      stage = createStage();
      if (stage === undefined) return;
      fit(stage);
      window.addEventListener('resize', onResize);
    }
    const spread = Math.min(48, 8 + count * 3);
    if (spawnBubbles(pool, { x, y, depth, count, spread }) === 0 || running) return;
    running = true;
    gsap.ticker.add(tick);
  };

  const trail: Emitter['trail'] = (element, depth) => {
    let last = { x: 0, y: 0, time: 0 };
    const onMove = (event: PointerEvent): void => {
      if (event.pointerType !== 'mouse') return;
      const moved = Math.hypot(event.clientX - last.x, event.clientY - last.y);
      if (event.timeStamp - last.time < TRAIL_INTERVAL_MS || moved < TRAIL_DISTANCE_PX) return;
      last = { x: event.clientX, y: event.clientY, time: event.timeStamp };
      burst(event.clientX, event.clientY - MAX_RADIUS, 1, depth());
    };
    element.addEventListener('pointermove', onMove);
    return () => element.removeEventListener('pointermove', onMove);
  };

  const onRequest = (event: Event): void => {
    const { x, y, count, depth = 0 } = (event as CustomEvent<BubblesDetail>).detail;
    burst(x, y, count, depth);
  };
  document.addEventListener(BUBBLES_EVENT, onRequest);

  return {
    burst,
    trail,
    destroy() {
      document.removeEventListener(BUBBLES_EVENT, onRequest);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(resizeFrame);
      gsap.ticker.remove(tick);
      running = false;
      for (const bubble of pool) bubble.alive = false;
      stage?.canvas.remove();
      stage = undefined;
    },
  };
}
