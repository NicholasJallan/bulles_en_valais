// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { alternates, findRoute } from './src/i18n/routes.ts';
import { DEFAULT_LOCALE, LOCALES } from './src/i18n/types.ts';

// The dev server serves any file of the project: refuse the secrets (Vite 8 defaults first).
const DEV_SERVER_DENY = [
  '.env',
  '.env.*',
  '*.{crt,pem,key,p12,pfx,cer,der}',
  '.npmrc',
  '.yarnrc.yml',
  '**/.git/**',
  'mail-config.php',
  'settings.json',
];

// Fonts chosen at Gate 1 (S02): Instrument Serif for titles and quotes, Switzer for text, the
// interface and the HUD digits (tabular). Licences: OFL 1.1 (Instrument Serif, Google) and ITF Free
// Font License 2.0 (Switzer, Fontshare: self-hosting allowed, subsetting and format conversion
// forbidden, so its files are used as served and never committed).
const STYLES = /** @type {['normal', 'italic']} */ (['normal', 'italic']);

const SITE = 'https://dive.bullesenvalais.ch';

/**
 * hreflang alternates of a sitemap entry, from src/i18n/routes.ts: the integration's own i18n
 * option only pairs identical paths, so it missed the legal pages (/confidentialite/ ↔
 * /en/privacy/).
 * @param {import('@astrojs/sitemap').SitemapItem} item
 */
function withAlternates(item) {
  const match = findRoute(new URL(item.url).pathname);
  if (match === undefined) return item;
  const links = alternates(match.route).map(({ hreflang, path }) => ({
    lang: hreflang,
    url: new URL(path, SITE).href,
  }));
  return { ...item, links };
}

// https://astro.build/config
export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'never' },
  vite: {
    // CSP: Astro would inline scripts under this size, Vite would turn small assets into data: URIs.
    build: { assetsInlineLimit: 0 },
    server: { fs: { deny: DEV_SERVER_DENY } },
  },
  i18n: {
    defaultLocale: DEFAULT_LOCALE,
    locales: [...LOCALES],
    routing: { prefixDefaultLocale: false },
  },
  // Written here, not in a constant: defineConfig infers the options of each provider from it.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Instrument Serif',
      cssVariable: '--font-instrument-serif',
      weights: [400],
      styles: STYLES,
      subsets: ['latin'],
      fallbacks: ['Georgia', 'serif'],
    },
    {
      provider: fontProviders.fontshare(),
      name: 'Switzer',
      cssVariable: '--font-switzer',
      weights: ['100 900'],
      styles: STYLES,
      fallbacks: ['Arial', 'sans-serif'],
    },
  ],
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/styleguide/'),
      serialize: withAlternates,
    }),
  ],
});
