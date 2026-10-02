// The motion module (02-architecture.md §7, §8): loaded by app.ts with a dynamic import() when
// html.motion-ok is set, never in the initial bundle. It checks motion-ok again (boot.js
// withdraws it after 3 s if this module has not started), then sets motion-ready.
import { trackWater } from '@/components/water/water.ts';
import type { Cleanup } from '@/lib/controllers.ts';
import { trackDepth } from './depth.ts';
import { ScrollTrigger, setupGsap } from './gsap.ts';
import { startLenis } from './lenis.ts';
import { magnetize } from './magnetic.ts';
import { animateNav } from './nav.ts';
import { isMotionAllowed, whileMotion } from './reduced-motion.ts';
import { startReveals } from './reveal.ts';

/** The reveals wait for the fonts (lines are measured), but not forever. */
const FONTS_TIMEOUT_MS = 1500;
const noop: Cleanup = () => undefined;

function fontsSettled(): Promise<unknown> {
  return Promise.race([
    document.fonts.ready,
    new Promise((resolve) => window.setTimeout(resolve, FONTS_TIMEOUT_MS)),
  ]);
}

/** Starts the motion; returns undefined when motion is not allowed (any more). */
export function startMotion(): Cleanup | undefined {
  if (!isMotionAllowed()) return undefined;
  const root = document.documentElement;
  setupGsap();
  root.classList.add('motion-ready');

  const stop = whileMotion(({ fine }) => {
    const cleanups = [
      trackDepth(),
      trackWater(),
      animateNav(),
      fine ? startLenis() : noop,
      fine ? magnetize() : noop,
    ];
    let cancelled = false;
    let stopReveals = noop;
    void fontsSettled().then(() => {
      if (cancelled) return;
      stopReveals = startReveals();
      ScrollTrigger.refresh();
    });
    return () => {
      cancelled = true;
      stopReveals();
      for (const cleanup of cleanups) cleanup();
    };
  });
  return () => {
    stop();
    root.classList.remove('motion-ready');
  };
}
