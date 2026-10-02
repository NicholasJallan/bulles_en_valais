// The route of the Rhône in motion (E10, S09): with motion (phones included), the stage of Places
// is pinned while the header and the three sites slide to the left, like the river towards the lake;
// the map beside them draws the river as far as the site in view and marks its station. The HUD
// runs from 32 to 22 m over the section, pin included (data-depth-*, depth.ts). A link focused in
// a site out of view brings that site into the window (pinned-track.ts, shared with the
// Testimonials). Without motion, Places stays static.
import type { Cleanup } from '@/lib/controllers.ts';
import { interpolate, nearestIndex, type Knot } from '@/lib/motion/track.ts';
import { pinTrack, type TrackParts } from '@/scripts/motion/pinned-track.ts';

interface Parts extends TrackParts {
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

/** The intro shows the river undrawn; each site draws it down to its own station. */
function riverKnots(parts: Parts, centres: readonly number[]): Knot[] {
  const last = centres.length - 1;
  return centres.map((centre, index) => {
    const place = parts.panels[index]?.dataset.place;
    const station = parts.stations.find((item) => item.dataset.station === place);
    return [centre, index === last ? 1 : Number(station?.dataset.fraction ?? 0)];
  });
}

export function pinPlaces(): Cleanup {
  const parts = findParts();
  if (parts === undefined || parts.panels.length === 0) return () => undefined;
  let knots: Knot[] = [];
  let centres: readonly number[] = [];
  let active = -1;
  if (parts.river !== null) parts.river.style.strokeDasharray = '1 2';

  // The river drawn to the progress of the track, and the station of the panel in view.
  const follow = (progress: number): void => {
    if (parts.river !== null && knots.length > 0) {
      parts.river.style.strokeDashoffset = String(1 - interpolate(knots, progress));
    }
    const index = nearestIndex(centres, progress);
    if (index === active) return;
    active = index;
    const place = parts.panels[index]?.dataset.place;
    for (const station of parts.stations) {
      station.toggleAttribute('data-active', station.dataset.station === place);
    }
  };
  const track = pinTrack(parts, {
    onMeasure(measured) {
      centres = measured;
      knots = riverKnots(parts, measured);
    },
    onProgress: follow,
  });

  return () => {
    track.kill();
    parts.river?.style.removeProperty('stroke-dasharray');
    parts.river?.style.removeProperty('stroke-dashoffset');
    for (const station of parts.stations) station.removeAttribute('data-active');
  };
}
