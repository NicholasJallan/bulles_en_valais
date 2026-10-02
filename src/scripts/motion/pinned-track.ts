// A horizontal track driven by the vertical scroll (D45): the stage is pinned while its track
// slides to the left, then the page carries on at the end. Shared by Places (E10) and the
// Testimonials (E12), and the model of any future rail or carousel. The window hides its overflow
// (axe then knows the panels beyond it are not shown) and keeps its own scroll at 0; a link
// focused in a panel out of view scrolls the page to that panel; the photos of the track are
// revealed as they enter the window (containerAnimation). Measured before the triggers below it
// (refreshPriority: 1), no anticipatePin (after a long jump it pinned the stage over the section
// above).
import type { Cleanup } from '@/lib/controllers.ts';
import { centredProgress, scrollAt } from '@/lib/motion/track.ts';
import { gsap, ScrollTrigger } from './gsap.ts';
import { revealElement } from './reveal.ts';

/** Smoothing of the scrub, in seconds: same drift as the depth ladder. */
const SCRUB_S = 0.8;
/** A photo is revealed when it has come this far into the window. */
const REVEAL_START = 'left 85%';

export interface TrackParts {
  /** Gets `data-pinned` while the track runs: the CSS lays the stage out for it. */
  readonly section: HTMLElement;
  /** Pinned for the length of the track. */
  readonly stage: HTMLElement;
  readonly window: HTMLElement;
  /** Moved by the scroll; the offsetParent of the panels. */
  readonly track: HTMLElement;
  readonly panels: readonly HTMLElement[];
}

export interface TrackOptions {
  /** After each measure (refresh): progress at which each panel is centred. */
  readonly onMeasure?: (centres: readonly number[]) => void;
  /** On every update of the scrubbed tween. */
  readonly onProgress?: (progress: number) => void;
}

export interface PinnedTrack {
  readonly tween: gsap.core.Tween;
  /** Progress at which each panel is centred, as last measured. */
  centres(): readonly number[];
  /** Progress of the page through the pin (ahead of the track, which the scrub smooths). */
  scrollProgress(): number;
  /** Scroll position of the page at which a progress of the track is reached. */
  scrollTopAt(progress: number): number;
  kill(): void;
}

interface Route {
  distance: number;
  centres: number[];
}

function measure(parts: TrackParts, route: Route): void {
  const view = parts.window.clientWidth;
  route.distance = Math.max(0, parts.track.scrollWidth - view);
  route.centres = parts.panels.map((panel) =>
    centredProgress({ start: panel.offsetLeft, width: panel.offsetWidth }, view, route.distance),
  );
}

/**
 * Photos in the track are revealed as they enter the window, not as the stage enters the screen
 * (the titles of the first panel keep their usual reveal).
 */
function deferReveals(parts: TrackParts, tween: gsap.core.Tween): Cleanup {
  const context = gsap.context(() => undefined);
  const elements = Array.from(parts.track.querySelectorAll<HTMLElement>('[data-reveal="image"]'));
  const triggers = elements
    .filter((element) => !('revealed' in element.dataset))
    .map((element) => {
      element.dataset.revealDefer = '';
      // A jump over the panel (anchor, focus, restored scroll) leaves without entering.
      const once = (): void => context.add(() => revealElement(element));
      return ScrollTrigger.create({
        trigger: element,
        containerAnimation: tween,
        start: REVEAL_START,
        once: true,
        onEnter: once,
        onLeave: once,
      });
    });
  return () => {
    for (const trigger of triggers) trigger.kill();
    context.revert();
    for (const element of elements) {
      delete element.dataset.revealDefer;
      element.style.clipPath = '';
    }
  };
}

/**
 * Keyboard: a link focused in a panel out of view scrolls the page to that panel. The browser may
 * scroll the window to show a focused link or a match of the find in page: the track must not add
 * to it, so the window's own scroll goes back to 0.
 */
function followFocus(parts: TrackParts, track: PinnedTrack): Cleanup {
  const keepWindowStill = (): void => {
    if (parts.window.scrollLeft !== 0) parts.window.scrollLeft = 0;
  };
  let frame = 0;
  const onFocus = (event: FocusEvent): void => {
    keepWindowStill();
    const target = event.target instanceof Node ? event.target : null;
    const index = parts.panels.findIndex((panel) => target !== null && panel.contains(target));
    const centre = track.centres()[index];
    if (centre === undefined) return;
    const top = track.scrollTopAt(centre);
    const go = (): void => {
      if (Math.abs(window.scrollY - top) > 1) window.scrollTo({ top, behavior: 'instant' });
    };
    go();
    // WebKit brings the focused link into view after focusin, over this scroll: again next frame.
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(go);
  };
  parts.track.addEventListener('focusin', onFocus);
  parts.window.addEventListener('scroll', keepWindowStill, { passive: true });
  return () => {
    cancelAnimationFrame(frame);
    parts.track.removeEventListener('focusin', onFocus);
    parts.window.removeEventListener('scroll', keepWindowStill);
  };
}

export function pinTrack(parts: TrackParts, options: TrackOptions = {}): PinnedTrack {
  const route: Route = { distance: 0, centres: [] };
  parts.section.dataset.pinned = '';
  const remeasure = (): void => {
    measure(parts, route);
    options.onMeasure?.(route.centres);
  };

  const tween = gsap.to(parts.track, {
    x: () => -route.distance,
    ease: 'none',
    onUpdate() {
      options.onProgress?.(this.progress());
    },
    scrollTrigger: {
      trigger: parts.stage,
      start: 'top top',
      end: () => `+=${route.distance}`,
      pin: true,
      scrub: SCRUB_S,
      refreshPriority: 1,
      invalidateOnRefresh: true,
      onRefreshInit: remeasure,
    },
  });
  remeasure();
  options.onProgress?.(0);
  const trigger = tween.scrollTrigger as ScrollTrigger;

  const track: PinnedTrack = {
    tween,
    centres: () => route.centres,
    scrollProgress: () => trigger.progress,
    scrollTopAt: (progress) => scrollAt({ start: trigger.start, end: trigger.end }, progress),
    kill() {
      for (const cleanup of cleanups) cleanup();
      trigger.kill(true);
      tween.revert();
      delete parts.section.dataset.pinned;
    },
  };
  const cleanups = [deferReveals(parts, tween), followFocus(parts, track)];
  return track;
}
