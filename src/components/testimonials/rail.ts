// Previous and next buttons of the testimonials rail: one card per press, disabled when the first
// or the last card is fully in view (IntersectionObserver, no scroll listener). The scrolling
// itself stays native: scroll-snap, touch, keyboard.
import type { Cleanup } from '@/lib/controllers.ts';

const FULLY_VISIBLE = 0.98;

export function init(element: HTMLElement): Cleanup {
  const rail = element.querySelector<HTMLElement>('[data-rail]');
  const previous = element.querySelector<HTMLButtonElement>('[data-rail-previous]');
  const next = element.querySelector<HTMLButtonElement>('[data-rail-next]');
  const first = rail?.firstElementChild;
  const last = rail?.lastElementChild;
  if (!rail || !previous || !next || !first || !last) throw new Error('rail: parts missing');

  const step = () => {
    const gap = Number.parseFloat(getComputedStyle(rail).columnGap) || 0;
    return first.getBoundingClientRect().width + gap;
  };
  const onPrevious = () => rail.scrollBy({ left: -step(), behavior: 'smooth' });
  const onNext = () => rail.scrollBy({ left: step(), behavior: 'smooth' });
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const button = entry.target === first ? previous : next;
        button.disabled = entry.intersectionRatio >= FULLY_VISIBLE;
      }
    },
    { root: rail, threshold: [0, FULLY_VISIBLE] },
  );

  previous.addEventListener('click', onPrevious);
  next.addEventListener('click', onNext);
  observer.observe(first);
  observer.observe(last);
  return () => {
    previous.removeEventListener('click', onPrevious);
    next.removeEventListener('click', onNext);
    observer.disconnect();
  };
}
