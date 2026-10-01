import { describe, expect, it } from 'vitest';
import { LOCALES } from '../i18n/types.ts';
import { blankStrings, localizedIssues } from '../test/content-checks.ts';
import { courseById } from './courses.ts';
import { SPECIALTIES, SPECIALTY_TABS } from './specialties.ts';

describe('SPECIALTIES', () => {
  it('has as many cards per tab as the current site', () => {
    const counts = Object.fromEntries(SPECIALTY_TABS.map((tab) => [tab, SPECIALTIES[tab].length]));
    expect(counts).toEqual({ sdi: 10, tdi: 4, padi: 10, ffessm: 6 });
  });

  it('keeps each card in the tab of its agency', () => {
    const agencyOf = (tab: string): string => (tab === 'sdi' || tab === 'tdi' ? 'sdi-tdi' : tab);
    for (const tab of SPECIALTY_TABS) {
      for (const card of SPECIALTIES[tab]) {
        expect(courseById(card.course).agency, card.course).toBe(agencyOf(tab));
      }
    }
  });

  it('numbers the cards of a tab without duplicates', () => {
    for (const tab of SPECIALTY_TABS) {
      const nums = SPECIALTIES[tab].map((card) => card.num);
      expect(new Set(nums).size, tab).toBe(nums.length);
    }
  });

  it('pairs every PADI card with a different SDI card', () => {
    const sdiCourses = SPECIALTIES.sdi.map((card) => card.course);
    const equivalents = SPECIALTIES.padi.map((card) => card.equivalent);
    expect([...equivalents].sort()).toEqual([...sdiCourses].sort());
  });

  it('gives an equivalent to PADI cards only', () => {
    for (const tab of SPECIALTY_TABS.filter((name) => name !== 'padi')) {
      expect(SPECIALTIES[tab].filter((card) => card.equivalent !== undefined)).toEqual([]);
    }
  });

  it('has its texts in every language', () => {
    expect(blankStrings(SPECIALTIES)).toEqual([]);
    expect(localizedIssues(SPECIALTIES, LOCALES)).toEqual([]);
  });
});
