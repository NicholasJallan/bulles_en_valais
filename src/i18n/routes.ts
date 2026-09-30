import { localePath } from './index.ts';
import { DEFAULT_LOCALE, LANG_TAGS, LOCALES, type Locale, type Localized } from './types.ts';

/** Path of each page per locale, before the locale prefix (used by the language switch). */
export const ROUTES = {
  home: { fr: '/', en: '/' },
} as const satisfies Readonly<Record<string, Localized>>;

export type RouteId = keyof typeof ROUTES;

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
