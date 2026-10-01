import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LOCALES } from '../i18n/types.ts';
import { formatCoordinates } from '../lib/format.ts';
import { blankStrings, localizedIssues } from '../test/content-checks.ts';
import { PLACES } from './places.ts';

describe('PLACES', () => {
  it('follows the Rhône downstream: Sion, then the Rosel (Martigny), then Lake Geneva', () => {
    expect(PLACES.map((place) => place.id)).toEqual(['sion', 'rosel', 'leman']);
  });

  it('keeps the coordinates shown on the current site', () => {
    const labels = Object.fromEntries(
      PLACES.map((place) => [place.id, formatCoordinates(place.coords, 'fr')]),
    );
    expect(labels).toEqual({
      sion: '46°14′N · 7°22′E',
      rosel: '46°05′N · 7°04′E',
      leman: '46°24′N · 6°50′E',
    });
  });

  it('only shows photos that exist', () => {
    for (const { photo } of PLACES) {
      const file = new URL(`../assets/images/${photo.file}`, import.meta.url);
      expect(existsSync(file), photo.file).toBe(true);
    }
  });

  it('gives the depth of each lake and a few sites of Lake Geneva (I-03)', () => {
    const facts = Object.fromEntries(PLACES.map((place) => [place.id, place.facts.maxDepth]));
    expect(facts).toEqual({ sion: 38, rosel: 23, leman: 300 });
    const leman = PLACES.find((place) => place.id === 'leman');
    expect(leman !== undefined && 'sites' in leman.facts ? leman.facts.sites.length : 0).toBe(5);
  });

  it('has its texts in every language', () => {
    expect(blankStrings(PLACES)).toEqual([]);
    expect(localizedIssues(PLACES, LOCALES)).toEqual([]);
  });
});
