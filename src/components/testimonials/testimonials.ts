// The testimonials in motion (E12, D45): on every screen, the stage is pinned and the vertical
// scroll slides the header, the quotes and the invitation by (pinned-track.ts, as in Places). The
// previous and next buttons scroll the page to the quote before or after, a bar shows the progress,
// and the large quote marks drift a little against the rail. A review taller than the window is cut
// short (reviews.ts; the dialog that shows it whole belongs to rail.ts). A screen too short for any quote (a phone held sideways) keeps the native rail.
import type { Cleanup } from '@/lib/controllers.ts';
import { stepIndex } from '@/lib/motion/track.ts';
import { gsap } from '@/scripts/motion/gsap.ts';
import { pinTrack, type PinnedTrack, type TrackParts } from '@/scripts/motion/pinned-track.ts';
import { takeOverRail, type Direction } from './rail.ts';
import { clampTo, findReviews, unclamp, type Review } from './reviews.ts';

/** Drift of the quote marks across the window, in px each way. */
const MARK_DRIFT_PX = 24;
/** Progress within which an end of the rail counts as reached. */
const EDGE = 0.005;
/** Below this height of window the rail is not pinned. */
const MIN_ROOM_PX = 260;
function findParts(): TrackParts | undefined {
  const section = document.getElementById('testimonials');
  const stage = section?.querySelector<HTMLElement>('[data-rail-stage]');
  const window_ = section?.querySelector<HTMLElement>('[data-rail-window]');
  const track = section?.querySelector<HTMLElement>('[data-rail-track]');
  if (!section || !stage || !window_ || !track) return undefined;
  const panels = Array.from(section.querySelectorAll<HTMLElement>('[data-rail-panel]'));
  return { section, stage, window: window_, track, panels };
}

/** Laid out pinned, is the window tall enough for a quote? */
function hasRoom(parts: TrackParts): boolean {
  parts.section.dataset.pinned = '';
  const room = parts.window.clientHeight;
  delete parts.section.dataset.pinned;
  return room >= MIN_ROOM_PX;
}

/** Cuts short the reviews taller than the window (measured pinned, on every refresh). */
function clampReviews(parts: TrackParts, reviews: readonly Review[]): void {
  const rail = parts.track.querySelector<HTMLElement>('[data-rail]');
  const inset = rail === null ? 0 : Number.parseFloat(getComputedStyle(rail).paddingBlockStart);
  clampTo(reviews, parts.window.clientHeight - (inset || 0));
}

function driftMarks(parts: TrackParts, track: PinnedTrack): Cleanup {
  const context = gsap.context(() => {
    for (const mark of parts.track.querySelectorAll<HTMLElement>('[data-rail-mark]')) {
      gsap.fromTo(
        mark,
        { x: MARK_DRIFT_PX },
        {
          x: -MARK_DRIFT_PX,
          ease: 'none',
          scrollTrigger: {
            trigger: mark.parentElement ?? mark,
            containerAnimation: track.tween,
            start: 'left right',
            end: 'right left',
            scrub: true,
          },
        },
      );
    }
  });
  return () => context.revert();
}

export function pinTestimonials(): Cleanup {
  const parts = findParts();
  if (parts === undefined || parts.panels.length === 0 || !hasRoom(parts)) {
    return () => undefined;
  }
  const reviews = findReviews(parts.panels);
  const bar = parts.section.querySelector<HTMLElement>('[data-rail-progress]');
  let track: PinnedTrack | undefined;
  const step = (direction: Direction): void => {
    if (track === undefined) return;
    const index = stepIndex(track.centres(), track.scrollProgress(), direction);
    const centre = track.centres()[index];
    // An instant jump: the scrub glides the track there (Lenis follows a native scroll).
    if (centre !== undefined) {
      window.scrollTo({ top: track.scrollTopAt(centre), behavior: 'instant' });
    }
  };
  const takeover = takeOverRail(step);
  track = pinTrack(parts, {
    onMeasure: () => clampReviews(parts, reviews),
    onProgress(progress) {
      if (bar !== null) bar.style.transform = `scaleX(${progress})`;
      takeover?.setEdges(progress <= EDGE, progress >= 1 - EDGE);
    },
  });
  const stopDrift = driftMarks(parts, track);

  return () => {
    stopDrift();
    for (const review of reviews) unclamp(review);
    track?.kill();
    // After the reviews are whole again: the static rail cuts them to its own measure.
    takeover?.release();
    bar?.style.removeProperty('transform');
  };
}
