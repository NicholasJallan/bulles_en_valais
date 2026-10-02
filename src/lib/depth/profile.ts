// The dive profile of the HUD (E3): one waypoint per section on a U-shaped line, from the
// surface down to 40 m and back. Used at build time (the SVG) and at run time (the active dot).
import type { DepthRange } from '@/data/sections.ts';

export interface ProfileSection {
  readonly id: string;
  readonly start: number;
  readonly end: number;
  readonly hidden: boolean;
}

interface ProfileEntry {
  readonly id: string;
  readonly hud: DepthRange | null;
}

/**
 * Gives the sections that hide the HUD (`hud: null`, the depth ladder) depths of their own: the
 * run of hidden sections goes evenly from the depth before it to the depth after it.
 */
export function fillHiddenDepths(entries: readonly ProfileEntry[]): ProfileSection[] {
  return entries.map((entry, index) => {
    if (entry.hud !== null) return { id: entry.id, ...entry.hud, hidden: false };
    let first = index;
    while (first > 0 && entries[first - 1]?.hud === null) first -= 1;
    let last = index;
    while (last < entries.length - 1 && entries[last + 1]?.hud === null) last += 1;
    const before = entries[first - 1]?.hud?.end;
    const after = entries[last + 1]?.hud?.start;
    const from = before ?? after ?? 0;
    const to = after ?? before ?? 0;
    const steps = last - first + 1;
    const depthAt = (step: number): number => from + ((to - from) * step) / steps;
    return {
      id: entry.id,
      start: depthAt(index - first),
      end: depthAt(index - first + 1),
      hidden: true,
    };
  });
}

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface ProfileGeometry {
  /** Where each section starts. */
  readonly waypoints: readonly Point[];
  /** Back at the surface, after the last section. */
  readonly end: Point;
  readonly path: string;
  readonly padding: number;
  depthToY(depth: number): number;
}

const round = (value: number): number => Math.round(value * 100) / 100;

export function profileGeometry(
  sections: readonly ProfileSection[],
  box: { readonly width: number; readonly height: number },
  padding = 4,
): ProfileGeometry {
  const deepest = Math.max(1, ...sections.flatMap((section) => [section.start, section.end]));
  const depthToY = (depth: number): number =>
    round(padding + (Math.min(Math.max(depth, 0), deepest) / deepest) * (box.height - 2 * padding));
  const step = (box.width - 2 * padding) / Math.max(1, sections.length);
  const xAt = (slot: number): number => round(padding + slot * step);
  const waypoints = sections.map((section, index) => ({
    x: xAt(index),
    y: depthToY(section.start),
  }));
  const end = { x: xAt(sections.length), y: depthToY(sections.at(-1)?.end ?? 0) };
  const path = [...waypoints, end]
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`)
    .join(' ');
  return { waypoints, end, path, padding, depthToY };
}

/** The active dot: along the section being read, at the depth the HUD shows. */
export function profilePoint(
  geometry: ProfileGeometry,
  index: number,
  progress: number,
  depth: number,
): Point {
  const from = geometry.waypoints[index] ?? geometry.end;
  const to = geometry.waypoints[index + 1] ?? geometry.end;
  return { x: round(from.x + (to.x - from.x) * progress), y: geometry.depthToY(depth) };
}
