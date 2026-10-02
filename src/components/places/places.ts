// The route of the Rhône in motion (E10, S09): on a desktop with motion, the stage of Places is
// pinned while the header and the three sites slide to the left, like the river towards the lake;
// the map beside them draws the river as far as the site in view and marks its station. The HUD
// runs from 32 to 22 m over the section, pin included (data-depth-*, depth.ts). A link focused in
// a site out of view brings that site into the window. Elsewhere, Places stays static.
import type { Cleanup } from '@/lib/controllers.ts';
import { centredProgress, interpolate, nearestIndex, type Knot } from '@/lib/motion/track.ts';
import { gsap, ScrollTrigger } from '@/scripts/motion/gsap.ts';
import { revealElement } from '@/scripts/motion/reveal.ts';

/** Smoothing of the scrub, in seconds: same drift as the depth ladder. */
const SCRUB_S = 0.8;
/** A photo is revealed when its card has come this far into the window. */
const REVEAL_START = 'left 85%';

interface Parts {
  readonly section: HTMLElement;
  readonly stage: HTMLElement;
  readonly window: HTMLElement;
  readonly track: HTMLElement;
  readonly panels: readonly HTMLElement[];
  readonly river: SVGPathElement | null;
  readonly stations: readonly SVGGElement[];
}

function findParts(): Parts | undefined {
  const section = document.getElementById('places');
  const stage = section?.querySelector<HTMLElement>('[data-places-stage]');
  const window_ = section?.querySelector<HTMLElement>('.places-window');
  const track = section?.querySelector<HTMLElement>('[data-places-track]');
  if (!section || !stage || !window_ || !track) return undefined;
  return {
    section,
    stage,
    window: window_,
    track,
    panels: Array.from(section.querySelectorAll<HTMLElement>('[data-places-panel]')),
    river: section.querySelector<SVGPathElement>('[data-rhone-river]'),
    stations: Array.from(section.querySelectorAll<SVGGElement>('[data-station]')),
  };
}

/** Where the track stops at each panel, and how far the river is drawn there. */
interface Route {
  distance: number;
  centres: number[];
  knots: Knot[];
}

function measureRoute(parts: Parts, route: Route): void {
  const view = parts.window.clientWidth;
  route.distance = Math.max(0, parts.track.scrollWidth - view);
  route.centres = parts.panels.map((panel) =>
    centredProgress({ start: panel.offsetLeft, width: panel.offsetWidth }, view, route.distance),
  );
  // The intro shows the river undrawn; each site draws it down to its own station.
  const fractions = parts.panels.map((panel) => {
    const station = parts.stations.find((item) => item.dataset.station === panel.dataset.place);
    return Number(station?.dataset.fraction ?? 0);
  });
  const last = route.centres.length - 1;
  route.knots = route.centres.map((centre, index) => [
    centre,
    index === last ? 1 : (fractions[index] ?? 0),
  ]);
}

/** The river drawn to the progress of the track, and the station of the panel in view. */
function follow(parts: Parts, route: Route): (progress: number) => void {
  let active = -1;
  return (progress) => {
    if (parts.river !== null && route.knots.length > 0) {
      parts.river.style.strokeDashoffset = String(1 - interpolate(route.knots, progress));
    }
    const index = nearestIndex(route.centres, progress);
    if (index === active) return;
    active = index;
    const place = parts.panels[index]?.dataset.place;
    for (const station of parts.stations) {
      station.toggleAttribute('data-active', station.dataset.station === place);
    }
  };
}

/** Photos are revealed as their card enters the window, not as the stage enters the screen. */
function deferReveals(parts: Parts, tween: gsap.core.Tween): Cleanup {
  const photos = Array.from(parts.track.querySelectorAll<HTMLElement>('[data-reveal="image"]'));
  const triggers = photos
    .filter((photo) => !('revealed' in photo.dataset))
    .map((photo) => {
      photo.dataset.revealDefer = '';
      return ScrollTrigger.create({
        trigger: photo,
        containerAnimation: tween,
        start: REVEAL_START,
        once: true,
        onEnter: () => revealElement(photo),
      });
    });
  return () => {
    for (const trigger of triggers) trigger.kill();
    for (const photo of photos) delete photo.dataset.revealDefer;
  };
}

/**
 * Keyboard: a link focused in a panel out of view scrolls the page to that panel. The window
 * hides its overflow (axe then knows the panels beyond it are hidden): the browser may scroll it
 * to show a focused link or a match of the find in page, which the track must not add to.
 */
function followFocus(parts: Parts, route: Route, trigger: ScrollTrigger): Cleanup {
  const keepWindowStill = (): void => {
    if (parts.window.scrollLeft !== 0) parts.window.scrollLeft = 0;
  };
  const onFocus = (event: FocusEvent): void => {
    keepWindowStill();
    const panel =
      event.target instanceof Element ? event.target.closest('[data-places-panel]') : null;
    const index = parts.panels.indexOf(panel as HTMLElement);
    const centre = route.centres[index];
    if (centre === undefined) return;
    const top = trigger.start + centre * (trigger.end - trigger.start);
    if (Math.abs(window.scrollY - top) > 1) window.scrollTo({ top, behavior: 'instant' });
  };
  parts.track.addEventListener('focusin', onFocus);
  parts.window.addEventListener('scroll', keepWindowStill, { passive: true });
  return () => {
    parts.track.removeEventListener('focusin', onFocus);
    parts.window.removeEventListener('scroll', keepWindowStill);
  };
}

export function pinPlaces(): Cleanup {
  const parts = findParts();
  if (parts === undefined || parts.panels.length === 0) return () => undefined;
  const route: Route = { distance: 0, centres: [], knots: [] };
  parts.section.dataset.pinned = '';
  const update = follow(parts, route);
  if (parts.river !== null) parts.river.style.strokeDasharray = '1 1';

  const tween = gsap.to(parts.track, {
    x: () => -route.distance,
    ease: 'none',
    onUpdate() {
      update(this.progress());
    },
    scrollTrigger: {
      trigger: parts.stage,
      start: 'top top',
      end: () => `+=${route.distance}`,
      pin: true,
      scrub: SCRUB_S,
      // Like the ladder: measured before the triggers of the sections below.
      refreshPriority: 1,
      invalidateOnRefresh: true,
      onRefreshInit: () => measureRoute(parts, route),
    },
  });
  measureRoute(parts, route);
  update(0);
  const trigger = tween.scrollTrigger as ScrollTrigger;
  const cleanups = [deferReveals(parts, tween), followFocus(parts, route, trigger)];

  return () => {
    for (const cleanup of cleanups) cleanup();
    trigger.kill(true);
    tween.revert();
    parts.river?.style.removeProperty('stroke-dasharray');
    parts.river?.style.removeProperty('stroke-dashoffset');
    for (const station of parts.stations) station.removeAttribute('data-active');
    delete parts.section.dataset.pinned;
  };
}
