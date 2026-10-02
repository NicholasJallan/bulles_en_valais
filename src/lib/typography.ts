// Typography of the visible texts, applied when they are read (getDictionary, localized()): the
// sources keep straight apostrophes and plain spaces, so they stay easy to edit.
import type { Locale } from '../i18n/types.ts';

const NO_BREAK_SPACE = '\u00a0';
const NARROW_NO_BREAK_SPACE = '\u202f';

type Rule = readonly [RegExp, string];

const COMMON_RULES: readonly Rule[] = [
  // Apostrophe inside a word: l'école, it's.
  [/(?<=\p{L})'(?=\p{L})/gu, '’'],
  // A number stays with its unit, an amount with its currency.
  [/(?<=\d) (?=(?:%|m|km|°C|€|h|min)(?![\p{L}\d]))/gu, NO_BREAK_SPACE],
  [/(?<=\bCHF) (?=\d)/g, NO_BREAK_SPACE],
  // No line starts with a dash.
  [/ (?=—)/g, NO_BREAK_SPACE],
];

/** French spacing: thin before ? ! ;, regular before :, and inside guillemets. */
const FRENCH_RULES: readonly Rule[] = [
  [/ (?=[?!;])/g, NARROW_NO_BREAK_SPACE],
  [/ (?=:)/g, NO_BREAK_SPACE],
  [/« /g, `«${NO_BREAK_SPACE}`],
  [/ »/g, `${NO_BREAK_SPACE}»`],
];

const RULES: Readonly<Record<Locale, readonly Rule[]>> = {
  fr: [...COMMON_RULES, ...FRENCH_RULES],
  en: COMMON_RULES,
};

/** Applies the typographic rules of a language to a text. */
export function typeset(text: string, locale: Locale): string {
  return RULES[locale].reduce(
    (result, [pattern, replacement]) => result.replace(pattern, replacement),
    text,
  );
}

/** Link targets are addresses, not texts. */
const UNTOUCHED_KEYS: ReadonlySet<string> = new Set(['href']);

/** A copy of a structure (dictionary, localized data) with every text typeset. */
export function typesetDeep<T>(value: T, locale: Locale): T {
  if (typeof value === 'string') return typeset(value, locale) as T;
  if (Array.isArray(value)) return value.map((item: unknown) => typesetDeep(item, locale)) as T;
  if (value === null || typeof value !== 'object') return value;
  const entries = Object.entries(value).map(([key, item]) => [
    key,
    UNTOUCHED_KEYS.has(key) ? item : typesetDeep(item, locale),
  ]);
  return Object.fromEntries(entries) as T;
}
