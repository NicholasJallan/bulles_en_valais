import { describe, expect, it } from 'vitest';
import { en } from './en.ts';
import { fr } from './fr.ts';
import { getDictionary, localePath } from './index.ts';
import { LOCALES } from './types.ts';

const META_DESCRIPTION_MAX_LENGTH = 155;

describe('getDictionary', () => {
  it('returns the dictionary of each locale', () => {
    expect(getDictionary('fr')).toBe(fr);
    expect(getDictionary('en')).toBe(en);
  });

  it.each(LOCALES)('keeps the %s meta description short enough for search results', (locale) => {
    const { description } = getDictionary(locale).meta;
    expect(description.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX_LENGTH);
  });
});

describe('localePath', () => {
  it('leaves paths of the default locale unprefixed', () => {
    expect(localePath('fr', '/')).toBe('/');
    expect(localePath('fr', '/#contact')).toBe('/#contact');
  });

  it('prefixes paths of the other locales', () => {
    expect(localePath('en', '/')).toBe('/en/');
    expect(localePath('en', '/privacy/')).toBe('/en/privacy/');
    expect(localePath('en', '/#contact')).toBe('/en/#contact');
  });

  it('rejects relative and protocol-relative paths', () => {
    expect(() => localePath('en', 'privacy/')).toThrow(/absolute path/);
    expect(() => localePath('fr', '//example.com/')).toThrow(/absolute path/);
  });
});
