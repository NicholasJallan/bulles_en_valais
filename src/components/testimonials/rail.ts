// Previous and next buttons of the testimonials rail. On their own: one card per press, disabled
// when the first or the last card is fully in view (IntersectionObserver, no scroll listener); the
// scrolling stays native (scroll-snap, touch, keyboard). While the motion module pins the rail
// (testimonials.ts, D45), it takes the buttons over: they scroll the page, and it tells which ends
// are reached.
import type { Cleanup } from '@/lib/controllers.ts';

const FULLY_VISIBLE = 0.98;

export type Direction = 1 | -1;

export interface RailTakeover {
  /** Disables the buttons of the reached ends. */
  setEdges(atStart: boolean, atEnd: boolean): void;
  /** Gives the buttons back to the native rail. */
  release(): void;
}

let current: ((onStep: (direction: Direction) => void) => RailTakeover) | undefined;

/** Lets the pinned rail drive the buttons; undefined when the rail controller has not started. */
export function takeOverRail(onStep: (direction: Direction) => void): RailTakeover | undefined {
  return current?.(onStep);
}

/** A disabled button drops the focus to <body>: hand it to the other one (or the rail) first. */
function setDisabled(
  button: HTMLButtonElement,
  other: HTMLButtonElement,
  disabled: boolean,
  fallback: HTMLElement,
) {
  if (disabled && document.activeElement === button) {
    if (other.disabled) fallback.focus();
    else other.focus();
  }
  button.disabled = disabled;
}

export function init(element: HTMLElement): Cleanup {
  const rail = element.querySelector<HTMLElement>('[data-rail]');
  const previous = element.querySelector<HTMLButtonElement>('[data-rail-previous]');
  const next = element.querySelector<HTMLButtonElement>('[data-rail-next]');
  const first = rail?.firstElementChild;
  const last = rail?.lastElementChild;
  if (!rail || !previous || !next || !first || !last) throw new Error('rail: parts missing');
  let drive: ((direction: Direction) => void) | undefined;

  const step = () => {
    const gap = Number.parseFloat(getComputedStyle(rail).columnGap) || 0;
    return first.getBoundingClientRect().width + gap;
  };
  // Smooth only when motion is allowed (reduced motion and calm mode remove motion-ok).
  const behavior = (): ScrollBehavior =>
    document.documentElement.classList.contains('motion-ok') ? 'smooth' : 'auto';
  const go = (direction: Direction) => {
    if (drive !== undefined) drive(direction);
    else rail.scrollBy({ left: direction * step(), behavior: behavior() });
  };
  const onPrevious = () => go(-1);
  const onNext = () => go(1);
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const button = entry.target === first ? previous : next;
        const other = button === previous ? next : previous;
        setDisabled(button, other, entry.intersectionRatio >= FULLY_VISIBLE, rail);
      }
    },
    { root: rail, threshold: [0, FULLY_VISIBLE] },
  );
  const observe = () => {
    observer.observe(first);
    observer.observe(last);
  };

  const release = () => {
    drive = undefined;
    rail.setAttribute('tabindex', '0');
    previous.disabled = false;
    next.disabled = false;
    observer.disconnect();
    observe();
  };
  current = (onStep) => {
    drive = onStep;
    observer.disconnect();
    // The rail no longer scrolls by itself: nothing to reach with the keyboard there.
    rail.removeAttribute('tabindex');
    return {
      setEdges(atStart, atEnd) {
        // Pinned, the rail cannot take the focus: the section's heading does.
        const heading = document.getElementById('testimonials-title') ?? rail;
        if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
        setDisabled(previous, next, atStart, heading);
        setDisabled(next, previous, atEnd, heading);
      },
      release,
    };
  };
  previous.addEventListener('click', onPrevious);
  next.addEventListener('click', onNext);
  observe();
  return () => {
    current = undefined;
    drive = undefined;
    rail.setAttribute('tabindex', '0');
    previous.removeEventListener('click', onPrevious);
    next.removeEventListener('click', onNext);
    observer.disconnect();
  };
}
