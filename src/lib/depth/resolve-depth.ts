// Narrative depth of the HUD (E3): which section the reader is in, and how deep that is.
// Pure: the motion module measures the sections once per refresh and calls this on scroll.

export interface MeasuredSection {
  readonly id: string;
  /** Top and bottom in document pixels. */
  readonly top: number;
  readonly bottom: number;
  /** Depths at the top and the bottom of the section, in metres. */
  readonly start: number;
  readonly end: number;
  /** The depth ladder shows its own gauge: the HUD hides itself there. */
  readonly hidden: boolean;
}

export interface DepthReading {
  readonly id: string;
  /** Position of the section in the list, for the dot of the dive profile. */
  readonly index: number;
  /** 0 at the top of the section, 1 at its bottom. */
  readonly progress: number;
  readonly depth: number;
  readonly hidden: boolean;
}

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/**
 * The line of the page whose depth the HUD shows: the top of the page at the top, its bottom at
 * the bottom, the middle of the viewport half-way. The first and last depths are thus reached.
 */
export function probeLine(scrollY: number, viewportHeight: number, scrollHeight: number): number {
  const maxScroll = scrollHeight - viewportHeight;
  if (maxScroll <= 0) return viewportHeight / 2;
  const ratio = clamp01(scrollY / maxScroll);
  return ratio * maxScroll + ratio * viewportHeight;
}

function reading(section: MeasuredSection, index: number, progress: number): DepthReading {
  return {
    id: section.id,
    index,
    progress,
    depth: section.start + (section.end - section.start) * progress,
    hidden: section.hidden,
  };
}

/**
 * Depth at a line of the page: interpolated through the section that contains it. Above the
 * first section, its start; in a gap between two sections (a thermocline) or below the last one,
 * the end of the section above. Sections are sorted from the top.
 */
export function resolveDepth(sections: readonly MeasuredSection[], probeY: number): DepthReading {
  const first = sections[0];
  if (first === undefined) throw new RangeError('resolveDepth needs at least one section');
  if (probeY < first.top) return reading(first, 0, 0);

  let index = 0;
  for (let next = 1; next < sections.length; next += 1) {
    if ((sections[next]?.top ?? Infinity) > probeY) break;
    index = next;
  }
  const section = sections[index] ?? first;
  const height = section.bottom - section.top;
  const progress = height <= 0 ? 1 : clamp01((probeY - section.top) / height);
  return reading(section, index, progress);
}
