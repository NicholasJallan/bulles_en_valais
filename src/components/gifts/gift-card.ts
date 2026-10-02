// The gift voucher in motion (E11, S10): with a fine pointer, it tilts towards the pointer (8° at
// most, rotateX and rotateY through gsap.quickTo, perspective from its scene) and its sheen slides
// the other way; it settles back flat when the pointer leaves. No gyroscope: it would ask for a
// permission. Without motion or on touch, the card stays still.
import type { Cleanup } from '@/lib/controllers.ts';
import { DURATIONS_MS, seconds } from '@/lib/motion/tokens.ts';
import { tiltAt } from '@/lib/motion/tilt.ts';
import { gsap } from '@/scripts/motion/gsap.ts';

/** How far the sheen travels, in percent of its own size (it overflows the card by 30 %). */
const SHEEN_TRAVEL_PERCENT = 12;

export function tiltGiftCard(): Cleanup {
  const scene = document.querySelector<HTMLElement>('[data-gift-card]');
  const card = scene?.firstElementChild;
  const sheen = scene?.querySelector<HTMLElement>('[data-gift-sheen]');
  if (!scene || !(card instanceof HTMLElement) || !sheen) return () => undefined;

  const options = { duration: seconds(DURATIONS_MS.base), ease: 'surface' };
  const to = {
    rotateX: gsap.quickTo(card, 'rotationX', options),
    rotateY: gsap.quickTo(card, 'rotationY', options),
    sheenX: gsap.quickTo(sheen, 'xPercent', options),
    sheenY: gsap.quickTo(sheen, 'yPercent', options),
  };
  const apply = (x: number, y: number): void => {
    // The scene, not the card: a tilted card would measure a different box on every move.
    const tilt = tiltAt(scene.getBoundingClientRect(), x, y);
    to.rotateX(tilt.rotateX);
    to.rotateY(tilt.rotateY);
    to.sheenX(tilt.sheenX * SHEEN_TRAVEL_PERCENT);
    to.sheenY(tilt.sheenY * SHEEN_TRAVEL_PERCENT);
  };
  const onMove = (event: PointerEvent): void => {
    if (event.pointerType === 'mouse') apply(event.clientX, event.clientY);
  };
  const onLeave = (): void => {
    const box = scene.getBoundingClientRect();
    apply(box.left + box.width / 2, box.top + box.height / 2);
  };

  scene.addEventListener('pointermove', onMove);
  scene.addEventListener('pointerleave', onLeave);
  return () => {
    scene.removeEventListener('pointermove', onMove);
    scene.removeEventListener('pointerleave', onLeave);
    gsap.killTweensOf([card, sheen]);
    gsap.set(card, { clearProps: 'transform' });
    gsap.set(sheen, { clearProps: 'transform' });
  };
}
