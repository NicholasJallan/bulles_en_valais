// The dive profile of the one-page site (plans/refonte-la-descente/01-direction-artistique.md §2):
// section order, anchors, the depth of each eyebrow marker (« — 12 m · Cursus ») and the
// narrative depths the HUD interpolates between (data-depth-start / data-depth-end, S06).
import { fillHiddenDepths } from '@/lib/depth/profile.ts';

export interface DepthRange {
  readonly start: number;
  readonly end: number;
}

export interface SectionProfile {
  /** Anchor of the section (`#about`): historical anchors are kept for Google Ads links. */
  readonly id: string;
  /** Depth shown in the eyebrow, in metres. Absent for sections without an eyebrow. */
  readonly marker?: number;
  /** Depths the HUD runs through; `null` while the depth ladder hides the HUD. */
  readonly hud: DepthRange | null;
  /** Anchors of sub-blocks that must keep working (`#gear`, `#insurance`). */
  readonly subAnchors?: readonly string[];
}

export const DIVE_PROFILE = [
  { id: 'top', marker: 0, hud: { start: 0, end: 0 } },
  { id: 'manifesto', marker: 3, hud: { start: 0, end: 3 } },
  { id: 'about', marker: 5, hud: { start: 3, end: 8 } },
  { id: 'agencies', marker: 12, hud: { start: 8, end: 15 } },
  { id: 'interlude-descent', hud: { start: 15, end: 18 } },
  { id: 'depth', marker: 18, hud: null },
  { id: 'compare', marker: 40, hud: null },
  { id: 'interlude-light', hud: { start: 40, end: 40 } },
  { id: 'specialties', marker: 40, hud: { start: 40, end: 32 } },
  { id: 'places', marker: 30, hud: { start: 32, end: 22 } },
  { id: 'prepare', marker: 20, hud: { start: 22, end: 15 }, subAnchors: ['gear', 'insurance'] },
  { id: 'gifts', marker: 15, hud: { start: 15, end: 10 } },
  { id: 'testimonials', marker: 10, hud: { start: 10, end: 6 } },
  { id: 'faq', marker: 5, hud: { start: 5, end: 5 } },
  { id: 'contact', marker: 0, hud: { start: 5, end: 0 } },
] as const satisfies readonly SectionProfile[];

export type SectionId = (typeof DIVE_PROFILE)[number]['id'];

/**
 * Depths of every section for the HUD and its dive profile: the sections that hide the HUD run
 * from the depth before them to the depth after them, so that the reading never jumps.
 */
export const HUD_PROFILE = fillHiddenDepths(DIVE_PROFILE);

/** Anchors already used by links and Google Ads extensions (02-architecture.md §13). */
export const HISTORICAL_ANCHORS = [
  'top',
  'about',
  'agencies',
  'compare',
  'specialties',
  'places',
  'gear',
  'insurance',
  'testimonials',
  'faq',
  'contact',
] as const;

/** Depth of the eyebrow marker of a section. */
export function markerDepth(id: SectionId): number {
  const section: SectionProfile | undefined = DIVE_PROFILE.find((entry) => entry.id === id);
  if (section?.marker === undefined) throw new Error(`Section "${id}" has no depth marker`);
  return section.marker;
}
