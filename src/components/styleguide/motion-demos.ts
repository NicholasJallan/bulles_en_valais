// GSAP demos of the styleguide (E5, E6, E7 prototype). Loaded only when motion is allowed.
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { SplitText } from 'gsap/SplitText';
import type { Cleanup } from '@/lib/controllers.ts';
import { registerEases } from '@/lib/motion/eases.ts';
import { DURATIONS_MS, STAGGER_MS, seconds } from '@/lib/motion/tokens.ts';
import { waterlinePolygon } from '@/lib/motion/waterline.ts';
import { createBubbles } from './bubbles-demo.ts';
import { SWITCH_EVENT, type SwitchDetail } from './switch.ts';

gsap.registerPlugin(CustomEase, SplitText);
registerEases(CustomEase);

interface Demo {
  play(): void;
  /** What GSAP cannot revert itself (styles written by hand). */
  cleanup?: Cleanup;
}

const VISIBLE_RATIO = 0.35;
// The masks of the lines are padded (.demo-line-mask) so that descenders and accents show:
// a line starts low enough to hide under the mask, its padding included.
const LINE_START_PERCENT = 135;

function applyTempo(value: string | undefined): void {
  const scale = Number(value);
  gsap.globalTimeline.timeScale(Number.isFinite(scale) && scale > 0 ? scale : 1);
}

/** E5: the lines rise from their mask and settle; the italic words arrive slightly later. */
function titleDemo(target: HTMLElement): Demo {
  let timeline: gsap.core.Timeline | undefined;
  // autoSplit splits again when fonts load or the width changes, and carries the time over to
  // the new timeline: create it running while the demo plays, or it would freeze half-way.
  let playing = false;
  SplitText.create(target, {
    type: 'lines, words',
    mask: 'lines',
    linesClass: 'demo-line',
    wordsClass: 'demo-word',
    autoSplit: true,
    onSplit(self) {
      const rise = seconds(DURATIONS_MS.rise);
      const onComplete = (): void => {
        playing = false;
      };
      timeline = gsap
        .timeline({ paused: !playing, onComplete })
        .from(self.lines, {
          yPercent: LINE_START_PERCENT,
          duration: rise,
          ease: 'buoyant',
          stagger: seconds(STAGGER_MS.line),
        })
        .from(
          target.querySelectorAll('em .demo-word'),
          { yPercent: 45, opacity: 0, duration: rise, ease: 'buoyant' },
          seconds(DURATIONS_MS.fast),
        );
      return timeline;
    },
  });
  return {
    play: () => {
      playing = true;
      timeline?.restart();
    },
  };
}

/** E6: a wavy water line rises through the picture, which settles from 108 % to 100 %. */
function revealDemo(figure: HTMLElement): Demo {
  const image = figure.querySelector('img');
  const water = { progress: 0, phase: 0 };
  const render = (): void => {
    figure.style.clipPath =
      water.progress >= 1 ? 'none' : waterlinePolygon(water.progress, { phase: water.phase });
  };
  const timeline = gsap
    .timeline({ paused: true, onUpdate: render })
    .fromTo(
      water,
      { progress: 0, phase: 0 },
      { progress: 1, phase: Math.PI * 2, duration: seconds(DURATIONS_MS.drift), ease: 'buoyant' },
    );
  if (image !== null) {
    timeline.fromTo(
      image,
      { scale: 1.08 },
      { scale: 1, duration: seconds(DURATIONS_MS.tide), ease: 'buoyant' },
      0,
    );
  }
  render();
  return {
    play: () => timeline.restart(),
    cleanup: () => {
      figure.style.clipPath = '';
    },
  };
}

/** Plays each demo once when it comes into view, and again on its replay button. */
function playWhenVisible(element: Element, demo: Demo): Cleanup {
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      demo.play();
    },
    { threshold: VISIBLE_RATIO },
  );
  observer.observe(element);
  return () => observer.disconnect();
}

function bindReplay(section: HTMLElement, name: string, demo: Demo): Cleanup {
  const button = section.querySelector(`[data-demo-replay="${name}"]`);
  if (button === null) return () => undefined;
  const replay = (): void => demo.play();
  button.addEventListener('click', replay);
  return () => button.removeEventListener('click', replay);
}

function startDemo(
  section: HTMLElement,
  name: string,
  create: (target: HTMLElement) => Demo,
): Cleanup {
  const container = section.querySelector<HTMLElement>(`[data-demo="${name}"]`);
  const target = container?.querySelector<HTMLElement>('[data-demo-target]');
  if (!container || !target) return () => undefined;
  const demo = create(target);
  // Observe the demo, not its target: a target hidden by its own clip-path never intersects.
  const stopObserving = playWhenVisible(container, demo);
  const unbind = bindReplay(section, name, demo);
  return () => {
    stopObserving();
    unbind();
    demo.cleanup?.();
  };
}

function startBubbles(section: HTMLElement): Cleanup {
  const stage = section.querySelector<HTMLElement>('[data-demo="bubbles"] [data-demo-target]');
  const canvas = stage?.querySelector('canvas');
  const button = stage?.querySelector<HTMLElement>('[data-demo-burst]');
  if (!stage || !canvas || !button) return () => undefined;
  return createBubbles({ stage, canvas, trigger: button, ticker: gsap.ticker });
}

function followTempo(): Cleanup {
  applyTempo(document.documentElement.dataset.tempo);
  const onSwitch = (event: Event): void => {
    const { name, value } = (event as CustomEvent<SwitchDetail>).detail;
    if (name === 'tempo') applyTempo(value);
  };
  document.addEventListener(SWITCH_EVENT, onSwitch);
  return () => {
    document.removeEventListener(SWITCH_EVENT, onSwitch);
    applyTempo('1');
  };
}

/**
 * Starts the demos in one GSAP context: its revert() undoes the splits, the animations and the
 * styles GSAP wrote, then runs the cleanup returned here for the rest (observers, listeners…).
 */
export function startDemos(section: HTMLElement): Cleanup {
  const context = gsap.context(() => {
    const cleanups = [
      followTempo(),
      startDemo(section, 'title', titleDemo),
      startDemo(section, 'reveal', revealDemo),
      startBubbles(section),
    ];
    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  }, section);
  return () => context.revert();
}
