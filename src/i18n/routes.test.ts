import { describe, expect, it } from 'vitest';
import { alternates, ROUTES, routePath } from './routes.ts';
import { LOCALES } from './types.ts';

describe('routePath', () => {
  it('resolves the home page in every locale', () => {
    expect(routePath('home', 'fr')).toBe('/');
    expect(routePath('home', 'en')).toBe('/en/');
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
