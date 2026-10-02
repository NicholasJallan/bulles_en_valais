// Snell's window in motion (E14): as the contact section comes up, the disc of light opens and
// brightens, and the ripples inside it drift with the scroll (transform and opacity only).
import type { Cleanup } from '@/lib/controllers.ts';
import { gsap } from '@/scripts/motion/gsap.ts';

const OPEN_FROM_SCALE = 0.55;
const SHIMMER_DRIFT_PERCENT = 14;

export function openSnellWindow(): Cleanup {
  const section = document.getElementById('contact');
  const disc = section?.querySelector<HTMLElement>('[data-snell-disc]');
  const shimmer = section?.querySelector<HTMLElement>('[data-snell-shimmer]');
  if (!section || !disc || !shimmer) return () => undefined;
  const context = gsap.context(() => {
    gsap.fromTo(
      disc,
      { scale: OPEN_FROM_SCALE, autoAlpha: 0.3 },
      {
        scale: 1,
        autoAlpha: 1,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top bottom', end: 'top 15%', scrub: true },
      },
    );
    gsap.fromTo(
      shimmer,
      { xPercent: -SHIMMER_DRIFT_PERCENT, yPercent: SHIMMER_DRIFT_PERCENT },
      {
        xPercent: SHIMMER_DRIFT_PERCENT,
        yPercent: -SHIMMER_DRIFT_PERCENT,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );
  });
  return () => context.revert();
}
