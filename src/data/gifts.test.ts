import { describe, expect, it } from 'vitest';
import { getDictionary } from '../i18n/index.ts';
import { LOCALES } from '../i18n/types.ts';
import { courseById } from './courses.ts';
import { GIFT_OFFERS } from './gifts.ts';

describe('GIFT_OFFERS', () => {
  it('has unique ids', () => {
    const ids = GIFT_OFFERS.map((offer) => offer.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('shows the price of the try-dive from the catalogue', () => {
    const [baptism] = GIFT_OFFERS;
    expect(baptism.id).toBe('baptism');
    expect(courseById(baptism.course).price).toEqual({ amount: 90, currency: 'CHF' });
  });

  it.each(LOCALES)('has a title and a text in %s for every offer', (locale) => {
    const { offers } = getDictionary(locale).gifts;
    expect(Object.keys(offers).sort()).toEqual(GIFT_OFFERS.map((offer) => offer.id).sort());
  });
});
