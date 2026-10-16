import { describe, expect, it } from 'vitest';
import { INTERESTS } from './contact.ts';
import { fillPrices } from './courses.ts';
import { LANDINGS } from './landings.ts';
import { LOCALES } from '../i18n/types.ts';
import { localize } from '../i18n/index.ts';
import {
  blankStrings,
  htmlStrings,
  localizedIssues,
  stringEntries,
} from '../test/content-checks.ts';

describe('landings data integrity', () => {
  it('has no blank strings, HTML strings, or localization structural issues', () => {
    expect(blankStrings(LANDINGS)).toEqual([]);
    expect(htmlStrings(LANDINGS)).toEqual([]);
    expect(localizedIssues(LANDINGS, LOCALES)).toEqual([]);
  });

  for (const [key, landing] of Object.entries(LANDINGS)) {
    describe(`landing: ${key}`, () => {
      it('has primaryCourseId included in courseIds', () => {
        expect(landing.courseIds).toContain(landing.primaryCourseId);
      });

      it('does not contain any hardcoded "CHF" followed by a number', () => {
        const entries = stringEntries(landing);
        for (const [path, text] of entries) {
          expect(text, `hardcoded price at ${path}`).not.toMatch(/CHF[\s\u00a0]*\d+/);
        }
      });

      it('only references courseIds in price markers', () => {
        const entries = stringEntries(landing);
        for (const [path, text] of entries) {
          const markers = [...text.matchAll(/\{price:([a-z0-9-]+)\}/g)].map((m) => m[1]);
          for (const markerId of markers) {
            expect(landing.courseIds, `unexpected price marker in ${path}`).toContain(markerId);
          }
        }
      });

      it('has valid SEO meta title length (<= 60 chars) on filled text', () => {
        expect(fillPrices(localize(landing.meta.title, 'fr'), 'fr').length).toBeLessThanOrEqual(60);
        expect(fillPrices(localize(landing.meta.title, 'en'), 'en').length).toBeLessThanOrEqual(60);
      });

      it('has valid SEO meta description length (<= 155 chars) on filled text', () => {
        expect(
          fillPrices(localize(landing.meta.description, 'fr'), 'fr').length,
        ).toBeLessThanOrEqual(155);
        expect(
          fillPrices(localize(landing.meta.description, 'en'), 'en').length,
        ).toBeLessThanOrEqual(155);
      });

      it('uses an allowed contact interest', () => {
        expect(INTERESTS).toContain(landing.contactInterest);
      });

      it('has at least 3 highlights, 3 steps, and 2 FAQ items', () => {
        expect(landing.highlights.length).toBeGreaterThanOrEqual(3);
        expect(landing.steps.length).toBeGreaterThanOrEqual(3);
        expect(landing.faq.length).toBeGreaterThanOrEqual(2);
      });
    });
  }
});
