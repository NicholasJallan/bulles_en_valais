// The depth ladder in motion (E9, S08): on a desktop with motion, once its header has scrolled
// by, the stage of the ladder is pinned for three screens; scrolling runs a scrubbed timeline that slides the ruler under the « you are
// here » marker, writes the depth in large figures, and lights each rung at its depth while the
// ones above fade. The HUD hides itself in the section (data-hud="hidden", hud.ts).
import type { Cleanup } from '@/lib/controllers.ts';
import { depthAtPosition } from '@/lib/depth/ladder-scale.ts';
import { formatDecimal } from '@/lib/format.ts';
import { LOCALES, type Locale } from '@/i18n/types.ts';
import { gsap, ScrollTrigger } from '@/scripts/motion/gsap.ts';

/** Scrolled distance of the pin, in screens (paired with --track-length in DepthLadder.astro). */
const PIN_SCREENS = 3;
/** Smoothing of the scrub, in seconds: the ruler drifts behind the wheel like in water. */
const SCRUB_S = 0.8;
/** Share of the ladder over which a rung appears, and the opacity of the rungs passed by. */
const APPEAR = 0.04;
const PASSED_OPACITY = 0.35;
const SLIDE_PX = 24;

const pageLocale = (): Locale =>
  LOCALES.find((locale) => locale === document.documentElement.lang) ?? 'fr';

function lightRungs(timeline: gsap.core.Timeline, rungs: readonly HTMLElement[]): void {
  rungs.forEach((rung, index) => {
    const position = Number(rung.dataset.position);
    const side = index % 2 === 0 ? -1 : 1;
    timeline.fromTo(
      rung,
      { opacity: 0, x: side * SLIDE_PX },
      { opacity: 1, x: 0, duration: APPEAR },
      Math.max(0, position - APPEAR),
    );
    const next = Number(rungs[index + 1]?.dataset.position);
    if (Number.isFinite(next)) {
      const fadeAt = Math.min(next - APPEAR / 2, 1 - APPEAR);
      timeline.to(rung, { opacity: PASSED_OPACITY, duration: APPEAR }, fadeAt);
    }
  });
}

/** The element of the address (a page opened on #faq), to keep in place when the pin adds room. */
function hashTarget(): HTMLElement | null {
  try {
    return document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
  } catch {
    return null;
  }
}

export function pinLadder(): Cleanup {
  const section = document.getElementById('depth');
  const stage = section?.querySelector<HTMLElement>('[data-ladder-stage]');
  const track = section?.querySelector<HTMLElement>('[data-ladder-track]');
  const reading = section?.querySelector<HTMLElement>('[data-ladder-depth]');
  if (!section || !stage || !track || !reading) return () => undefined;
  const rungs = Array.from(section.querySelectorAll<HTMLElement>('[data-ladder-rung]'));
  const locale = pageLocale();
  let shown = '';
  const write = (position: number): void => {
    const text = formatDecimal(depthAtPosition(position), locale, 0);
    if (text === shown) return;
    shown = text;
    reading.textContent = text;
  };

  const anchor = hashTarget();
  const anchorTop = anchor?.getBoundingClientRect().top;
  // The pinned layout first: ScrollTrigger measures the stage as it will be pinned.
  section.dataset.pinned = '';
  const timeline = gsap.timeline({
    defaults: { ease: 'none' },
    // The ruler runs from time 0 to 1: the time is the position on the ladder.
    onUpdate() {
      write(this.time());
    },
    scrollTrigger: {
      trigger: stage,
      start: 'top top',
      end: () => `+=${window.innerHeight * PIN_SCREENS}`,
      pin: true,
      scrub: SCRUB_S,
      // Before the triggers created earlier for the sections below: they measure the page
      // with the room the pin takes.
      refreshPriority: 1,
      invalidateOnRefresh: true,
    },
  });
  timeline.to(track, { yPercent: -100, duration: 1 }, 0);
  lightRungs(timeline, rungs);
  write(0);
  // The browser jumped to the anchor before the pin added three screens above it: follow it once
  // the pin has taken its room (the first refresh).
  const followAnchor = (): void => {
    ScrollTrigger.removeEventListener('refresh', followAnchor);
    if (anchor === null || anchorTop === undefined) return;
    window.scrollBy(0, anchor.getBoundingClientRect().top - anchorTop);
  };
  if (
    anchor !== null &&
    section.compareDocumentPosition(anchor) & Node.DOCUMENT_POSITION_FOLLOWING
  ) {
    ScrollTrigger.addEventListener('refresh', followAnchor);
  }

  return () => {
    ScrollTrigger.removeEventListener('refresh', followAnchor);
    timeline.scrollTrigger?.kill(true);
    timeline.revert();
    delete section.dataset.pinned;
    reading.textContent = formatDecimal(0, locale, 0);
  };
}
