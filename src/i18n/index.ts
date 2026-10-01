import { typeset, typesetDeep } from '../lib/typography.ts';
import type { Dictionary } from './dictionary.ts';
import { en } from './en.ts';
import { fr } from './fr.ts';
import { DEFAULT_LOCALE, LOCALES, type Locale, type Localized } from './types.ts';

const SOURCES: Readonly<Record<Locale, Dictionary>> = { fr, en };

/** Dictionaries as rendered: typeset once per locale (curly apostrophes, French spacing). */
const DICTIONARIES = Object.fromEntries(
  LOCALES.map((locale) => [locale, typesetDeep(SOURCES[locale], locale)]),
) as Readonly<Record<Locale, Dictionary>>;

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

/** Text of a localized label of src/data, typeset like the dictionaries. */
export function localize(value: Localized, locale: Locale): string {
  return typeset(value[locale], locale);
}

/** `/` → `/` in French, `/en/` in English: only the default locale has no prefix. */
export function localePath(locale: Locale, path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) {
    throw new Error(`localePath expects an absolute path, got "${path}"`);
  }
  return locale === DEFAULT_LOCALE ? path : `/${locale}${path}`;
}
