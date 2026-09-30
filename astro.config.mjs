// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { DEFAULT_LOCALE, LANG_TAGS, LOCALES } from './src/i18n/types.ts';

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

// https://astro.build/config
export default defineConfig({
  site: 'https://dive.bullesenvalais.ch',
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
  integrations: [
    sitemap({
      i18n: { defaultLocale: DEFAULT_LOCALE, locales: { ...LANG_TAGS } },
      filter: (page) => !page.includes('/styleguide/'),
    }),
  ],
});
