import { describe, expect, it } from 'vitest';
import { alternates, findRoute, ROUTES, routePath } from './routes.ts';
import { LOCALES } from './types.ts';

describe('routePath', () => {
  it('resolves the home page in every locale', () => {
    expect(routePath('home', 'fr')).toBe('/');
    expect(routePath('home', 'en')).toBe('/en/');
  });

  it('resolves the legal pages under their translated paths', () => {
    expect(routePath('privacy', 'fr')).toBe('/confidentialite/');
    expect(routePath('privacy', 'en')).toBe('/en/privacy/');
    expect(routePath('legalNotice', 'fr')).toBe('/mentions-legales/');
    expect(routePath('legalNotice', 'en')).toBe('/en/legal-notice/');
  });

  it('resolves the landing pages under their translated paths', () => {
    expect(routePath('baptism', 'fr')).toBe('/bapteme-plongee-valais/');
    expect(routePath('baptism', 'en')).toBe('/en/try-scuba-diving-valais/');
    expect(routePath('drysuit', 'fr')).toBe('/combinaison-etanche-valais/');
    expect(routePath('drysuit', 'en')).toBe('/en/dry-suit-diving-valais/');
    expect(routePath('openwater', 'fr')).toBe('/cours-open-water-valais/');
    expect(routePath('openwater', 'en')).toBe('/en/open-water-diver-valais/');
  });
});

describe('alternates', () => {
  it('lists every locale, then x-default pointing to French', () => {
    expect(alternates('home')).toEqual([
      { hreflang: 'fr-CH', path: '/' },
      { hreflang: 'en', path: '/en/' },
      { hreflang: 'x-default', path: '/' },
    ]);
  });
});

describe('ROUTES', () => {
  it('only holds absolute paths ending with a slash (trailingSlash: always)', () => {
    for (const paths of Object.values(ROUTES)) {
      for (const locale of LOCALES) {
        expect(paths[locale]).toMatch(/^\/(?:[a-z0-9-]+\/)*$/);
      }
    }
  });
});

describe('findRoute', () => {
  it('finds the page and locale of every route path', () => {
    for (const route of Object.keys(ROUTES) as (keyof typeof ROUTES)[]) {
      for (const locale of LOCALES) {
        expect(findRoute(routePath(route, locale))).toEqual({ route, locale });
      }
    }
  });

  it('knows nothing of the other paths', () => {
    expect(findRoute('/404/')).toBeUndefined();
    expect(findRoute('/en/confidentialite/')).toBeUndefined();
  });
});
