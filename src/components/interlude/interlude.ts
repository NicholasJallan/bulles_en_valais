// Interludes in motion (S08): the picture drifts slower than the page (parallax of 12 %), and on
// a fine pointer a ring replaces the cursor and leaves a trail of bubbles (E7). Started by the
// motion module: nothing of this under reduced motion, in calm mode or on touch screens.
import { currentDepth } from '@/components/hud/hud.ts';
import type { Cleanup } from '@/lib/controllers.ts';
import { DURATIONS_MS, seconds } from '@/lib/motion/tokens.ts';
import type { Emitter } from '@/scripts/bubbles/emitter.ts';
import { gsap } from '@/scripts/motion/gsap.ts';

/** Travel of the picture, in % of its own height (112 % of the interlude). */
const PARALLAX_PERCENT = 5;
const RING_LAG_S = 0.18;

function parallax(interlude: HTMLElement): Cleanup {
  const picture = interlude.querySelector<HTMLElement>('.interlude-image');
  if (picture === null) return () => undefined;
  interlude.dataset.parallax = '';
  const tween = gsap.fromTo(
    picture,
    { yPercent: -PARALLAX_PERCENT },
    {
      yPercent: PARALLAX_PERCENT,
      ease: 'none',
      scrollTrigger: { trigger: interlude, start: 'top bottom', end: 'bottom top', scrub: true },
    },
  );
  return () => {
    tween.scrollTrigger?.kill();
    tween.revert();
    delete interlude.dataset.parallax;
  };
}

/** The ring that follows the pointer, and the bubbles it leaves behind. */
function trail(interlude: HTMLElement, emitter: Emitter): Cleanup {
  const ring = document.createElement('span');
  ring.className = 'interlude-cursor';
  ring.setAttribute('aria-hidden', 'true');
  interlude.append(ring);
  interlude.dataset.trail = '';
  const moveX = gsap.quickTo(ring, 'x', { duration: RING_LAG_S, ease: 'surface' });
  const moveY = gsap.quickTo(ring, 'y', { duration: RING_LAG_S, ease: 'surface' });
  let shown = false;
  const fade = (opacity: number): void => {
    shown = opacity > 0;
    gsap.to(ring, { opacity, duration: seconds(DURATIONS_MS.fast), overwrite: 'auto' });
  };
  const onEnter = (event: PointerEvent): void => {
    if (event.pointerType !== 'mouse') return;
    gsap.set(ring, { x: event.clientX, y: event.clientY });
    fade(1);
  };
  const onMove = (event: PointerEvent): void => {
    if (event.pointerType !== 'mouse') return;
    // Restarted under a still pointer (a resize across 1024 px): no pointerenter came.
    if (!shown) {
      onEnter(event);
      return;
    }
    moveX(event.clientX);
    moveY(event.clientY);
  };
  const onLeave = (): void => fade(0);
  interlude.addEventListener('pointerenter', onEnter);
  interlude.addEventListener('pointermove', onMove);
  interlude.addEventListener('pointerleave', onLeave);
  const stopBubbles = emitter.trail(interlude, currentDepth);
  return () => {
    stopBubbles();
    interlude.removeEventListener('pointerenter', onEnter);
    interlude.removeEventListener('pointermove', onMove);
    interlude.removeEventListener('pointerleave', onLeave);
    gsap.killTweensOf(ring);
    ring.remove();
    delete interlude.dataset.trail;
  };
}

export function startInterludes({ fine, bubbles }: { fine: boolean; bubbles: Emitter }): Cleanup {
  if (!fine) return () => undefined;
  const cleanups = Array.from(document.querySelectorAll<HTMLElement>('[data-interlude]')).flatMap(
    (interlude) => [parallax(interlude), trail(interlude, bubbles)],
  );
  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}
