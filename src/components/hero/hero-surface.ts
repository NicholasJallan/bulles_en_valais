// Lays the WebGL surface (E1) over the hero photo, after `load` and in idle time, when the
// device can (02-architecture.md §7). The <img> stays underneath: it is the LCP element, and the
// fallback whenever the surface fails or loses its context.
import type { Cleanup } from '@/lib/controllers.ts';
import { DURATIONS_MS, seconds } from '@/lib/motion/tokens.ts';
import { canUseWebGL, readEnvironment } from '@/lib/webgl/capability.ts';
import { isTap, shouldEmit, type PointerSample } from '@/lib/webgl/ripples.ts';
import { parseObjectPosition } from '@/lib/webgl/viewport.ts';
import { gsap } from '@/scripts/motion/gsap.ts';
import type { Surface } from '@/scripts/webgl/surface.ts';

export interface HeroSurfaceOptions {
  readonly hero: HTMLElement;
  readonly image: HTMLImageElement;
  readonly maskUrl: string;
  /** Fine pointer: full resolution, ripples on hover. Otherwise ripples on a short tap only. */
  readonly fine: boolean;
  /** The surface is drawn and fading in: from now on it takes the immersion. */
  readonly onReady: (surface: Surface) => void;
  /** The surface is gone (context lost): back to the CSS water line. */
  readonly onLost: () => void;
}

const noop: Cleanup = () => undefined;
const IDLE_TIMEOUT_MS = 2000;
const IDLE_FALLBACK_MS = 200;
/** 16 rings of 5 s: a moving mouse never frees a slot before its ring has faded. */
const EMIT = { minIntervalMs: 320, minDistancePx: 40 } as const;

/** Runs `task` once the page has loaded and the main thread is idle. */
function whenIdleAfterLoad(task: () => void): Cleanup {
  let idle = 0;
  let timer = 0;
  const schedule = (): void => {
    // Safari has no requestIdleCallback.
    if (typeof window.requestIdleCallback === 'function') {
      idle = window.requestIdleCallback(task, { timeout: IDLE_TIMEOUT_MS });
    } else {
      timer = window.setTimeout(task, IDLE_FALLBACK_MS);
    }
  };
  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule, { once: true });
  return () => {
    window.removeEventListener('load', schedule);
    if (idle !== 0) window.cancelIdleCallback(idle);
    window.clearTimeout(timer);
  };
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = url;
  await image.decode();
  return image;
}

const sample = (event: PointerEvent): PointerSample => ({
  x: event.clientX,
  y: event.clientY,
  t: event.timeStamp,
});

/** Ripples: a moving mouse now and then, a click; on touch screens a short tap, never a swipe. */
function rippleOnPointer(hero: HTMLElement, surface: Surface): Cleanup {
  let last: PointerSample | undefined;
  let down: PointerSample | undefined;
  const emit = (at: PointerSample): void => surface.addRipple(at.x, at.y);
  const onMove = (event: PointerEvent): void => {
    if (event.pointerType !== 'mouse') return;
    const next = sample(event);
    if (!shouldEmit(last, next, EMIT)) return;
    last = next;
    emit(next);
  };
  const onDown = (event: PointerEvent): void => {
    down = sample(event);
    if (event.pointerType === 'mouse') emit(down);
  };
  const onUp = (event: PointerEvent): void => {
    if (event.pointerType !== 'mouse' && down !== undefined && isTap(down, sample(event))) {
      emit(sample(event));
    }
    down = undefined;
  };
  const onCancel = (): void => {
    down = undefined;
  };
  // Passive listeners only: the surface never holds the page scroll.
  const listeners = [
    ['pointermove', onMove],
    ['pointerdown', onDown],
    ['pointerup', onUp],
    ['pointercancel', onCancel],
  ] as const;
  for (const [type, listener] of listeners) {
    hero.addEventListener(type, listener, { passive: true });
  }
  return () => {
    for (const [type, listener] of listeners) hero.removeEventListener(type, listener);
  };
}

interface Created {
  readonly canvas: HTMLCanvasElement;
  readonly surface: Surface;
}

async function createOver(
  options: HeroSurfaceOptions,
  isCancelled: () => boolean,
  onLost: () => void,
): Promise<Created | undefined> {
  const { image, maskUrl, fine } = options;
  const [{ createSurface }, mask] = await Promise.all([
    import('@/scripts/webgl/surface.ts'),
    loadImage(maskUrl),
    image.decode(),
  ]);
  if (isCancelled()) return undefined;
  const canvas = document.createElement('canvas');
  canvas.className = 'hero-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  (image.closest('picture') ?? image).after(canvas);
  try {
    const surface = createSurface({
      canvas,
      image,
      mask,
      focal: parseObjectPosition(getComputedStyle(image).objectPosition),
      mobile: !fine,
      onContextLost: onLost,
    });
    return { canvas, surface };
  } catch (error) {
    canvas.remove();
    throw error;
  }
}

export function loadHeroSurface(options: HeroSurfaceOptions): Cleanup {
  let cancelled = false;
  let release: Cleanup = noop;
  const cancelIdle = whenIdleAfterLoad(() => {
    if (cancelled || !canUseWebGL(readEnvironment(document, navigator))) return;
    const lost = (): void => {
      release();
      options.onLost();
    };
    createOver(options, () => cancelled, lost)
      .then((created) => {
        if (created === undefined) return;
        const { canvas, surface } = created;
        const stopRipples = rippleOnPointer(options.hero, surface);
        release = () => {
          release = noop;
          stopRipples();
          gsap.killTweensOf(canvas);
          surface.destroy();
          canvas.remove();
        };
        surface.start();
        options.onReady(surface);
        gsap.to(canvas, { opacity: 1, duration: seconds(DURATIONS_MS.slow), ease: 'surface' });
      })
      .catch((error: unknown) => {
        // The photo stays: the surface is an enhancement. Kept visible for debugging.
        release();
        console.warn('Hero surface unavailable', error);
      });
  });
  return () => {
    cancelled = true;
    cancelIdle();
    release();
  };
}
