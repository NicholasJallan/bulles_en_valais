// Water column and thermoclines (E4), for the motion module. While a thermocline crosses the
// viewport, the layer of the water above it is fully shown and the layer of the water below
// fades in on top of it (opacity only; autoAlpha hides the other layers so they never paint).
// The shimmer of each band drifts with the scroll (transform only).
import { gsap, ScrollTrigger } from '@/scripts/motion/gsap.ts';
import type { Cleanup } from '@/lib/controllers.ts';

const SHIMMER_DRIFT_PERCENT = 18;

export function trackWater(): Cleanup {
  const column = document.querySelector<HTMLElement>('[data-water-column]');
  if (column === null) return () => undefined;
  const layers = Array.from(column.querySelectorAll<HTMLElement>('[data-water-tone]'));
  const layer = (tone: string | undefined): HTMLElement | undefined =>
    layers.find((candidate) => candidate.dataset.waterTone === tone);
  let active: HTMLElement | undefined;

  const show = (band: HTMLElement, progress: number): void => {
    const from = layer(band.dataset.from);
    const to = layer(band.dataset.to);
    if (active !== band) {
      active = band;
      for (const candidate of layers) {
        if (candidate !== from && candidate !== to) gsap.set(candidate, { autoAlpha: 0 });
      }
      if (from !== undefined) gsap.set(from, { autoAlpha: 1, zIndex: 0 });
      if (to !== undefined) gsap.set(to, { zIndex: 1 });
    }
    if (to !== undefined) gsap.set(to, { autoAlpha: progress });
  };

  const context = gsap.context(() => {
    for (const band of document.querySelectorAll<HTMLElement>('[data-thermocline]')) {
      ScrollTrigger.create({
        trigger: band,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => show(band, self.progress),
        onToggle: (self) => {
          if (self.isActive) show(band, self.progress);
        },
      });
      const shimmer = band.querySelector('[data-thermocline-shimmer]');
      if (shimmer === null) continue;
      gsap.fromTo(
        shimmer,
        { yPercent: -SHIMMER_DRIFT_PERCENT },
        {
          yPercent: SHIMMER_DRIFT_PERCENT,
          ease: 'none',
          scrollTrigger: { trigger: band, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    }
  });
  return () => context.revert();
}
