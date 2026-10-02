// Also imported by astro.config.mjs (sitemap): keep this file free of imports other than types.ts.
import { DEFAULT_LOCALE, LANG_TAGS, LOCALES, type Locale, type Localized } from './types.ts';

/** Path of each page per locale, before the locale prefix (used by the language switch). */
export const ROUTES = {
  home: { fr: '/', en: '/' },
  privacy: { fr: '/confidentialite/', en: '/privacy/' },
  legalNotice: { fr: '/mentions-legales/', en: '/legal-notice/' },
} as const satisfies Readonly<Record<string, Localized>>;

export type RouteId = keyof typeof ROUTES;

/** `/` → `/` in French, `/en/` in English: only the default locale has no prefix. */
export function localePath(locale: Locale, path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) {
    throw new Error(`localePath expects an absolute path, got "${path}"`);
  }
  return locale === DEFAULT_LOCALE ? path : `/${locale}${path}`;
}

export interface Alternate {
  readonly hreflang: string;
  readonly path: string;
}

export function routePath(route: RouteId, locale: Locale): string {
  return localePath(locale, ROUTES[route][locale]);
}

/** `hreflang` alternates of a page: every locale, then `x-default` (the default locale). */
export function alternates(route: RouteId): readonly Alternate[] {
  return [
    ...LOCALES.map((locale) => ({ hreflang: LANG_TAGS[locale], path: routePath(route, locale) })),
    { hreflang: 'x-default', path: routePath(route, DEFAULT_LOCALE) },
  ];
}

/** The page and locale of a path, as the sitemap lists them; undefined outside the routes. */
export function findRoute(path: string): { route: RouteId; locale: Locale } | undefined {
  for (const route of Object.keys(ROUTES) as RouteId[]) {
    const locale = LOCALES.find((candidate) => routePath(route, candidate) === path);
    if (locale !== undefined) return { route, locale };
  }
  return undefined;
}
