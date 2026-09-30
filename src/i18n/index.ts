import { en } from './en.ts';
import { fr } from './fr.ts';
import { DEFAULT_LOCALE, type Dictionary, type Locale } from './types.ts';

const DICTIONARIES: Readonly<Record<Locale, Dictionary>> = { fr, en };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

/** `/` → `/` in French, `/en/` in English: only the default locale has no prefix. */
export function localePath(locale: Locale, path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) {
    throw new Error(`localePath expects an absolute path, got "${path}"`);
  }
  return locale === DEFAULT_LOCALE ? path : `/${locale}${path}`;
}
