import { describe, expect, it } from 'vitest';
import { getDictionary } from '../i18n/index.ts';
import type { Dictionary } from '../i18n/dictionary.ts';
import {
  DIVE_PROFILE,
  HISTORICAL_ANCHORS,
  HUD_PROFILE,
  markerDepth,
  type SectionId,
} from './sections.ts';

/** Section of the page that renders each block of the dictionary with an eyebrow. */
const EYEBROW_SECTIONS = {
  hero: 'top',
  manifesto: 'manifesto',
  instructor: 'about',
  courses: 'agencies',
  depthLadder: 'depth',
  compare: 'compare',
  specialties: 'specialties',
  places: 'places',
  prepare: 'prepare',
  gifts: 'gifts',
  testimonials: 'testimonials',
  faq: 'faq',
  contact: 'contact',
} as const satisfies Partial<Record<keyof Dictionary, SectionId>>;

describe('DIVE_PROFILE', () => {
  const ids = DIVE_PROFILE.map((section) => section.id);

  it('starts at the surface with the hero and ends at the surface with the contact', () => {
    expect(ids.at(0)).toBe('top');
    expect(ids.at(-1)).toBe('contact');
    expect(markerDepth('top')).toBe(0);
    expect(markerDepth('contact')).toBe(0);
  });

  it('has unique anchors', () => {
    const anchors = DIVE_PROFILE.flatMap((section) => [
      section.id,
      ...('subAnchors' in section ? section.subAnchors : []),
    ]);
    expect(new Set(anchors).size).toBe(anchors.length);
  });

  it('keeps every historical anchor (links, Google Ads extensions)', () => {
    const anchors = new Set(
      DIVE_PROFILE.flatMap((section) => [
        section.id,
        ...('subAnchors' in section ? section.subAnchors : []),
      ]),
    );
    for (const anchor of HISTORICAL_ANCHORS) expect(anchors.has(anchor), anchor).toBe(true);
  });

  it('uses whole, non-negative depths', () => {
    for (const section of DIVE_PROFILE) {
      const depths = [
        ...('marker' in section ? [section.marker] : []),
        ...(section.hud === null ? [] : [section.hud.start, section.hud.end]),
      ];
      for (const depth of depths) expect(Number.isInteger(depth) && depth >= 0).toBe(true);
    }
  });

  it('places the eyebrows quoted in the art direction', () => {
    expect(markerDepth('about')).toBe(5);
    expect(markerDepth('agencies')).toBe(12);
    expect(markerDepth('specialties')).toBe(40);
    expect(markerDepth('faq')).toBe(5);
  });

  it('gives a depth marker to every eyebrow of the dictionary', () => {
    const dictionary = getDictionary('fr');
    for (const [key, id] of Object.entries(EYEBROW_SECTIONS)) {
      expect(dictionary[key as keyof typeof EYEBROW_SECTIONS].eyebrow, key).toBeTruthy();
      expect(() => markerDepth(id), id).not.toThrow();
    }
  });

  it('refuses the marker of a section without eyebrow', () => {
    expect(() => markerDepth('interlude-descent')).toThrow(/has no depth marker/);
  });
});

describe('HUD_PROFILE', () => {
  it('gives every section of the profile a start and an end depth', () => {
    expect(HUD_PROFILE.map((section) => section.id)).toEqual(DIVE_PROFILE.map((s) => s.id));
    for (const section of HUD_PROFILE) {
      expect(Number.isFinite(section.start) && Number.isFinite(section.end)).toBe(true);
    }
  });

  it('hides the HUD exactly where the dive profile says so', () => {
    expect(HUD_PROFILE.filter((s) => s.hidden).map((s) => s.id)).toEqual(['depth', 'compare']);
  });
});
