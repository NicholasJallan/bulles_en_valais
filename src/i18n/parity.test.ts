import { describe, expect, it } from 'vitest';
import { blankStrings, htmlStrings, structureIssues, todoIssues } from '../test/content-checks.ts';
import { getDictionary } from './index.ts';
import { DEFAULT_LOCALE, LOCALES } from './types.ts';

// Generic checks (src/test/content-checks.ts): they know nothing about the Dictionary type, so
// they keep working as sections and locales are added.

const OTHER_LOCALES = LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);
const META_TITLE_MAX_LENGTH = 60;
const META_DESCRIPTION_MAX_LENGTH = 155;

describe('dictionaries', () => {
  it.each(LOCALES)('%s contains no empty string', (locale) => {
    expect(blankStrings(getDictionary(locale))).toEqual([]);
  });

  it.each(LOCALES)('%s contains no HTML (links go through Rich)', (locale) => {
    expect(htmlStrings(getDictionary(locale))).toEqual([]);
  });

  it.each(OTHER_LOCALES)(`%s mirrors the structure of ${DEFAULT_LOCALE}`, (locale) => {
    expect(structureIssues(getDictionary(DEFAULT_LOCALE), getDictionary(locale))).toEqual([]);
  });

  it.each(OTHER_LOCALES)(
    `%s has the TODO(I-xx) markers of ${DEFAULT_LOCALE}, at the same places`,
    (locale) => {
      expect(todoIssues(getDictionary(DEFAULT_LOCALE), getDictionary(locale))).toEqual([]);
    },
  );
});

describe.each(LOCALES)('%s meta tags', (locale) => {
  const { meta, legal } = getDictionary(locale);
  const pages = [meta, legal.privacy.meta, legal.legalNotice.meta];

  it('keeps every title short enough for search results', () => {
    for (const { title } of pages) expect(title.length).toBeLessThanOrEqual(META_TITLE_MAX_LENGTH);
  });

  it('keeps every description short enough for search results', () => {
    for (const { description } of pages) {
      expect(description.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX_LENGTH);
    }
  });
});
