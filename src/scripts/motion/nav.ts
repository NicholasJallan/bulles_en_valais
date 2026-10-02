// Living navigation (E16): fixed over the page, frosted glass once past the hero, tucked away
// while going down and back while going up (never while it holds the keyboard focus).
import type { Cleanup } from '@/lib/controllers.ts';
import { ScrollTrigger } from './gsap.ts';

const root = document.documentElement;

export function animateNav(): Cleanup {
  const header = document.querySelector<HTMLElement>('.site-header');
  const hero = document.getElementById('top');
  if (header === null || hero === null) return () => undefined;
  let size = header.offsetHeight;

  const tuck = (down: boolean, scroll: number): void => {
    const hide = down && scroll > size && !header.contains(document.activeElement);
    header.classList.toggle('is-tucked', hide);
  };
  const scroller = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onRefresh: () => {
      size = header.offsetHeight;
      root.style.setProperty('--nav-block-size', `${size}px`);
    },
    onUpdate: (self) => tuck(self.direction === 1, self.scroll()),
  });
  const glass = ScrollTrigger.create({
    trigger: hero,
    start: () => `bottom top+=${size}`,
    end: 'max',
    toggleClass: { targets: header, className: 'is-glass' },
  });
  const onFocus = (): void => header.classList.remove('is-tucked');
  header.addEventListener('focusin', onFocus);
  root.style.setProperty('--nav-block-size', `${size}px`);
  root.classList.add('nav-fixed');

  return () => {
    header.removeEventListener('focusin', onFocus);
    scroller.kill();
    glass.kill();
    header.classList.remove('is-tucked', 'is-glass');
    root.classList.remove('nav-fixed');
    root.style.removeProperty('--nav-block-size');
  };
}
