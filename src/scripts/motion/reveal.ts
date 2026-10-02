// Reveals on entering the viewport (02-architecture.md §8, E5, E6): `data-reveal="lines|fade|
// image|stagger"`. motion.css hides them under html.motion-ok until they get `data-revealed`;
// each animation is created first (its start state applies at once), then the mark is set.
import type { Cleanup } from '@/lib/controllers.ts';
import { DURATIONS_MS, STAGGER_MS, seconds } from '@/lib/motion/tokens.ts';
import { waterlinePolygon } from '@/lib/motion/waterline.ts';
import { gsap, ScrollTrigger } from './gsap.ts';
import { splitLines } from './split.ts';

const START = 'top 88%';
const START_RATIO = 0.88;
const RISE = seconds(DURATIONS_MS.rise);
const LINE_START_PERCENT = 120;
const FADE_OFFSET_PX = 24;
const IMAGE_ZOOM = 1.08;

const reveal = (element: HTMLElement): void => {
  element.dataset.revealed = '';
};

/** E5: the lines rise from their mask and settle; the italic words light up slightly later. */
function revealLines(element: HTMLElement): void {
  const split = splitLines(element);
  const timeline = gsap.timeline({ onComplete: () => split.revert() });
  timeline.from(split.lines, {
    yPercent: LINE_START_PERCENT,
    duration: RISE,
    ease: 'buoyant',
    stagger: seconds(STAGGER_MS.line),
  });
  const emphasis = element.querySelectorAll('em');
  if (emphasis.length > 0) {
    timeline.from(
      emphasis,
      { opacity: 0.25, duration: RISE, ease: 'buoyant' },
      seconds(DURATIONS_MS.fast),
    );
  }
  reveal(element);
}

function revealFade(element: HTMLElement): void {
  gsap.from(element, {
    opacity: 0,
    y: FADE_OFFSET_PX,
    duration: seconds(DURATIONS_MS.slow),
    ease: 'buoyant',
    clearProps: 'opacity,transform',
  });
  reveal(element);
}

function revealStagger(element: HTMLElement): void {
  gsap.from(element.children, {
    opacity: 0,
    y: FADE_OFFSET_PX,
    duration: seconds(DURATIONS_MS.slow),
    ease: 'buoyant',
    stagger: seconds(STAGGER_MS.line),
    clearProps: 'opacity,transform',
  });
  reveal(element);
}

/** E6: a wavy water line rises through the picture, which settles from 108 % to 100 %. */
function revealImage(element: HTMLElement): void {
  const water = { progress: 0, phase: 0 };
  const draw = (): void => {
    element.style.clipPath = waterlinePolygon(water.progress, { phase: water.phase });
  };
  const timeline = gsap.timeline({
    onUpdate: draw,
    onComplete: () => {
      element.style.clipPath = '';
    },
  });
  timeline.to(water, {
    progress: 1,
    phase: Math.PI * 2,
    duration: seconds(DURATIONS_MS.drift),
    ease: 'buoyant',
  });
  const image = element.querySelector('img');
  if (image !== null) {
    timeline.from(
      image,
      {
        scale: IMAGE_ZOOM,
        duration: seconds(DURATIONS_MS.tide),
        ease: 'buoyant',
        clearProps: 'transform',
      },
      0,
    );
  }
  draw();
  reveal(element);
}

const REVEALS: Readonly<Record<string, (element: HTMLElement) => void>> = {
  lines: revealLines,
  fade: revealFade,
  image: revealImage,
  stagger: revealStagger,
};

/** Plays the reveal of an element now (a trigger of its own: Places, in its horizontal track). */
export function revealElement(element: HTMLElement): void {
  if ('revealed' in element.dataset) return;
  REVEALS[element.dataset.reveal ?? '']?.(element);
}

/**
 * Arms every reveal of the page, except those deferred to a trigger of their own
 * (`data-reveal-defer`, set by places.ts); the returned cleanup undoes the animations and the
 * splits.
 * What is already in view, or above it (a page opened on an anchor), shows at once; a jump
 * over a reveal (onLeave without onEnter) shows it too.
 */
export function startReveals(): Cleanup {
  const context = gsap.context(() => undefined);
  for (const element of document.querySelectorAll<HTMLElement>('[data-reveal]')) {
    const play = REVEALS[element.dataset.reveal ?? ''];
    if (play === undefined || 'revealed' in element.dataset || 'revealDefer' in element.dataset) {
      continue;
    }
    const run = (): void => {
      if ('revealed' in element.dataset) return;
      context.add(() => play(element));
    };
    if (element.getBoundingClientRect().top < window.innerHeight * START_RATIO) {
      run();
      continue;
    }
    context.add(() => {
      const once = (self: ScrollTrigger): void => {
        run();
        self.kill();
      };
      ScrollTrigger.create({ trigger: element, start: START, onEnter: once, onLeave: once });
    });
  }
  return () => {
    context.revert();
    // The water line is drawn by hand: an interrupted reveal must not leave its polygon behind.
    for (const image of document.querySelectorAll<HTMLElement>('[data-reveal="image"]')) {
      image.style.clipPath = '';
    }
  };
}
