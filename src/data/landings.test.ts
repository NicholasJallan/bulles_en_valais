import { describe, expect, it } from 'vitest';
import { INTERESTS } from './contact.ts';
import { LANDINGS } from './landings.ts';

describe('landings data integrity', () => {
  for (const [key, landing] of Object.entries(LANDINGS)) {
    describe(`landing: ${key}`, () => {
      it('has valid SEO meta title length (<= 60 chars)', () => {
        expect(landing.meta.title.fr.length).toBeLessThanOrEqual(60);
        expect(landing.meta.title.en.length).toBeLessThanOrEqual(60);
      });

      it('has valid SEO meta description length (<= 155 chars)', () => {
        expect(landing.meta.description.fr.length).toBeLessThanOrEqual(155);
        expect(landing.meta.description.en.length).toBeLessThanOrEqual(155);
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
