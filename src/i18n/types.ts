// Also imported by astro.config.mjs: keep this file free of other imports.

export const LOCALES = ['fr', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'fr';

export type Localized<T = string> = Readonly<Record<Locale, T>>;

/** BCP 47 tags, for `html[lang]`, `hreflang` and the sitemap. */
export const LANG_TAGS: Localized = { fr: 'fr-CH', en: 'en' };

/** Heading with an emphasised part, rendered as `before <em>em</em> after`. */
export interface Emphasis {
  readonly before: string;
  readonly em: string;
  readonly after?: string;
}

/** Text with links, without any HTML in the strings. */
export type Rich = ReadonlyArray<
  | { readonly text: string }
  | {
      readonly link: { readonly label: string; readonly href: string; readonly external?: boolean };
    }
>;

// The Dictionary interface, which lists every text of the site, lives in dictionary.ts.
