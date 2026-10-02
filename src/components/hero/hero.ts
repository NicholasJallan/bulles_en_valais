// Hero « Surface » (E1, E2, E15), started by the motion module while motion is allowed: the
// intro (title lines settle, the HUD lights up at 0.0 m), the immersion scrubbed by the scroll
// (a water line rises through the photo, the title drifts up and fades), and the WebGL surface
// laid over the photo once the page is idle. Reduced motion and calm mode: the static hero.
import type { Cleanup } from '@/lib/controllers.ts';
import { DURATIONS_MS, STAGGER_MS, seconds } from '@/lib/motion/tokens.ts';
import { waterlinePolygon } from '@/lib/motion/waterline.ts';
import { fontsSettled } from '@/scripts/motion/fonts.ts';
import { gsap, ScrollTrigger, SplitText } from '@/scripts/motion/gsap.ts';
import { loadHeroSurface } from './hero-surface.ts';

/** Rollback switch (S07 brief): false keeps the CSS water line over the photo, without WebGL. */
const WEBGL_SURFACE = true;
/** Mirrors LEVEL_GAIN of surface.frag: the line crosses the screen before the hero has left. */
const LEVEL_GAIN = 1.15;
const WAVES_PER_HERO = 2;
const VEIL_START = 0.75;
/** The dark scrim that carries the text lifts a little underwater: the title is gone by then. */
const SCRIM_LIFT = 0.35;
const LINE_START_PERCENT = 120;
const EXIT_PERCENT = -60;
const EXIT_STAGGER = 0.1;
const HUD_FLICKER = [0.7, 0.15, 1] as const;

const root = document.documentElement;
const noop: Cleanup = () => undefined;
/** The intro plays once per page: a restart of the motion (a breakpoint crossed) skips it. */
let introPlayed = false;

/** Ends the wait of motion.css: the hero title and the HUD figures show (or start rising). */
const endIntroWait = (): void => {
  root.dataset.intro = '';
};

type Immersion = (progress: number) => void;

/** Fallback of E2 without WebGL: a wavy clip-path rises, the underwater veil thickens. */
function cssWater(veil: HTMLElement): Immersion {
  return (progress) => {
    veil.style.clipPath = waterlinePolygon(Math.min(1, progress * LEVEL_GAIN), {
      phase: progress * WAVES_PER_HERO * Math.PI * 2,
    });
    veil.style.opacity = String(VEIL_START + (1 - VEIL_START) * progress);
  };
}

/** E15: the title lines settle and the HUD lights up, in at most 1.2 s, never blocking. */
function introduce(lines: readonly Element[]): void {
  gsap.from(lines, {
    yPercent: LINE_START_PERCENT,
    duration: seconds(DURATIONS_MS.slow),
    ease: 'buoyant',
    stagger: seconds(STAGGER_MS.line),
  });
  const readout = document.querySelector('.hud-readout');
  if (readout !== null) {
    const step = seconds(DURATIONS_MS.instant) / 2;
    gsap.fromTo(
      readout,
      { opacity: 0 },
      {
        keyframes: HUD_FLICKER.map((opacity, index) => ({
          opacity,
          duration: index === HUD_FLICKER.length - 1 ? seconds(DURATIONS_MS.fast) : step,
        })),
        delay: seconds(DURATIONS_MS.fast),
        clearProps: 'opacity',
      },
    );
  }
}

/** E2: the title drifts up and fades while the hero scrolls away (line by line). */
function driftAway(hero: HTMLElement, masks: readonly Element[], lead: Element | null) {
  const timeline = gsap.timeline({
    scrollTrigger: { trigger: hero, start: 'top top', end: 'center top', scrub: true },
  });
  timeline.to(masks, { yPercent: EXIT_PERCENT, opacity: 0, ease: 'none', stagger: EXIT_STAGGER });
  if (lead !== null) timeline.to(lead, { opacity: 0, ease: 'none' }, 0);
  return timeline;
}

function animateTitle(hero: HTMLElement): void {
  const title = hero.querySelector<HTMLElement>('.hero-title');
  if (title === null) return;
  // A page opened lower down (on an anchor) skips the intro.
  if (hero.getBoundingClientRect().bottom <= 0) introPlayed = true;
  SplitText.create(title, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'reveal-line',
    autoSplit: true,
    onSplit(split) {
      if (!introPlayed) {
        introPlayed = true;
        introduce(split.lines);
      }
      return driftAway(hero, split.masks, hero.querySelector('.hero-lead'));
    },
  });
}

export function startHero({ fine }: { readonly fine: boolean }): Cleanup {
  const hero = document.getElementById('top');
  const veil = hero?.querySelector<HTMLElement>('[data-hero-water]');
  const image = hero?.querySelector<HTMLImageElement>('.hero-image');
  if (hero == null || veil == null || image == null) {
    endIntroWait();
    return noop;
  }

  const scrim = hero.querySelector<HTMLElement>('.hero-scrim');
  const context = gsap.context(() => undefined);
  const css = cssWater(veil);
  let immerse: Immersion = css;
  let progress = 0;
  const apply = (value: number): void => {
    progress = value;
    immerse(value);
    if (scrim !== null) scrim.style.opacity = String(1 - SCRIM_LIFT * value);
  };

  context.add(() => {
    const trigger = ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => apply(self.progress),
    });
    apply(trigger.progress);
  });

  let cancelled = false;
  void fontsSettled().then(() => {
    if (cancelled) return;
    try {
      context.add(() => animateTitle(hero));
    } finally {
      // Even if the split fails, the title must not stay hidden.
      endIntroWait();
    }
  });

  const stopSurface = WEBGL_SURFACE
    ? loadHeroSurface({
        hero,
        image,
        maskUrl: veil.dataset.mask ?? '',
        fine,
        onReady: (surface) => {
          surface.setImmersion(progress);
          immerse = (value) => surface.setImmersion(value);
          hero.dataset.surface = 'webgl';
        },
        onLost: () => {
          immerse = css;
          delete hero.dataset.surface;
          css(progress);
        },
      })
    : noop;

  return () => {
    cancelled = true;
    stopSurface();
    context.revert();
    delete hero.dataset.surface;
    veil.style.clipPath = '';
    veil.style.opacity = '';
    if (scrim !== null) scrim.style.opacity = '';
    endIntroWait();
  };
}
