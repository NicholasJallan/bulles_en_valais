import { describe, expect, it } from 'vitest';
import { courseById, isOnRequest } from './courses.ts';
import { getActiveSpotlight, SPOTLIGHTS } from './season.ts';

describe('season spotlight', () => {
  it('covers all 12 months with exactly one spotlight per month', () => {
    const spotlights = Object.values(SPOTLIGHTS);
    const allMonths = spotlights.flatMap((s) => s.months);
    expect(allMonths).toHaveLength(12);
    expect(new Set(allMonths).size).toBe(12);
    for (let month = 0; month < 12; month++) {
      expect(allMonths).toContain(month);
    }
  });

  it('contains no emojis in badges, titles or CTAs', () => {
    const spotlights = Object.values(SPOTLIGHTS);
    const texts = spotlights.flatMap((s) => [
      s.badge.fr,
      s.badge.en,
      s.title.fr,
      s.title.en,
      s.cta.fr,
      s.cta.en,
    ]);
    for (const text of texts) {
      expect(text, `emoji detected in "${text}"`).not.toMatch(/\p{Extended_Pictographic}/u);
    }
  });

  it('uses valid, priced course IDs in price markers', () => {
    const spotlights = Object.values(SPOTLIGHTS);
    const texts = spotlights.flatMap((s) => [
      s.badge.fr,
      s.badge.en,
      s.title.fr,
      s.title.en,
      s.cta.fr,
      s.cta.en,
    ]);
    expect(SPOTLIGHTS.baptism.title.fr).toContain('{price:padi-dsd}');
    expect(SPOTLIGHTS.baptism.title.en).toContain('{price:padi-dsd}');
    for (const text of texts) {
      const markers = [...text.matchAll(/\{price:([a-z0-9-]+)\}/g)].map((m) => m[1]);
      for (const courseId of markers) {
        // @ts-expect-error courseId validity
        const course = courseById(courseId);
        expect(isOnRequest(course.price)).toBe(false);
      }
    }
  });

  it('selects baptism during summer months (May through September)', () => {
    // Month 4 is May, Month 8 is September
    expect(getActiveSpotlight(undefined, new Date('2026-05-01'))).toBe(SPOTLIGHTS.baptism);
    expect(getActiveSpotlight(undefined, new Date('2026-07-15'))).toBe(SPOTLIGHTS.baptism);
    expect(getActiveSpotlight(undefined, new Date('2026-09-30'))).toBe(SPOTLIGHTS.baptism);
  });

  it('selects dry suit during autumn/winter/spring months (October through April)', () => {
    expect(getActiveSpotlight(undefined, new Date('2026-10-01'))).toBe(SPOTLIGHTS.drysuit);
    expect(getActiveSpotlight(undefined, new Date('2026-12-25'))).toBe(SPOTLIGHTS.drysuit);
    expect(getActiveSpotlight(undefined, new Date('2026-01-15'))).toBe(SPOTLIGHTS.drysuit);
    expect(getActiveSpotlight(undefined, new Date('2026-04-30'))).toBe(SPOTLIGHTS.drysuit);
  });

  it('allows explicit override', () => {
    expect(getActiveSpotlight('baptism', new Date('2026-12-25'))).toBe(SPOTLIGHTS.baptism);
    expect(getActiveSpotlight('drysuit', new Date('2026-07-15'))).toBe(SPOTLIGHTS.drysuit);
  });
});
