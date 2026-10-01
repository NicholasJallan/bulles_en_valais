// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
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

// Fonts compared in the styleguide until Gate 1 (S02): pairing A = Fraunces + Switzer,
// B = Instrument Serif + Switzer, C = Zodiak + General Sans; HUD digits in Switzer (tabular) or
// in a mono subset. Licences: OFL 1.1 (Google), ITF Free Font License 2.0 (Fontshare: self-hosting
// allowed, subsetting and format conversion forbidden, so the Fontshare files are used as served).
const STYLES = /** @type {['normal', 'italic']} */ (['normal', 'italic']);
const LATIN = /** @type {['latin']} */ (['latin']);
// HUD glyphs only (digits, units, capitals, separators, and the no-break space between a
// number and its unit): the mono stays under 15 KB.
const HUD_GLYPHS = [
  '0123456789 ,.:/+-−–—°·▲%',
  String.fromCharCode(0xa0),
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'ms',
];

/**
 * Fraunces with its five axes weighs 118 KB (roman) + 146 KB (italic). Fixing the optical size
 * and the SOFT and WONK axes per style divides it by three (37 + 43 KB, weight stays variable):
 * a sturdy roman, a soft "liquid" italic. Both entries share the variable, so Astro merges them.
 * @param {'normal' | 'italic'} style
 * @param {{ SOFT: string, WONK: string }} axes
 */
const fraunces = (style, { SOFT, WONK }) => ({
  provider: fontProviders.google(),
  name: 'Fraunces',
  cssVariable: '--font-fraunces',
  weights: /** @type {['100 900']} */ (['100 900']),
  styles: /** @type {['normal' | 'italic']} */ ([style]),
  subsets: LATIN,
  fallbacks: ['Georgia', 'serif'],
  options: { experimental: { variableAxis: { opsz: ['72'], SOFT: [SOFT], WONK: [WONK] } } },
});

/**
 * @param {string} name
 * @param {string} cssVariable
 * @param {[string]} weights
 * @param {'serif' | 'sans-serif'} generic
 */
const fontshare = (name, cssVariable, weights, generic) => ({
  provider: fontProviders.fontshare(),
  name,
  cssVariable,
  weights,
  styles: STYLES,
  fallbacks: [generic === 'serif' ? 'Georgia' : 'Arial', generic],
});

/**
 * @param {string} name
 * @param {string} cssVariable
 * @param {[string]} weights
 */
const hudMono = (name, cssVariable, weights) => ({
  provider: fontProviders.google(),
  name,
  cssVariable,
  weights,
  styles: /** @type {['normal']} */ (['normal']),
  subsets: LATIN,
  fallbacks: ['monospace'],
  options: { experimental: { glyphs: HUD_GLYPHS } },
});

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
  // Written here, not in a constant: defineConfig infers the options of each provider from it.
  fonts: [
    fraunces('normal', { SOFT: '50', WONK: '0' }),
    fraunces('italic', { SOFT: '100', WONK: '1' }),
    fontshare('Switzer', '--font-switzer', ['100 900'], 'sans-serif'),
    {
      provider: fontProviders.google(),
      name: 'Instrument Serif',
      cssVariable: '--font-instrument-serif',
      weights: [400],
      styles: STYLES,
      subsets: LATIN,
      fallbacks: ['Georgia', 'serif'],
    },
    fontshare('Zodiak', '--font-zodiak', ['100 900'], 'serif'),
    fontshare('General Sans', '--font-general-sans', ['200 700'], 'sans-serif'),
    hudMono('JetBrains Mono', '--font-jetbrains-mono', ['100 800']),
    hudMono('Geist Mono', '--font-geist-mono', ['100 900']),
  ],
  integrations: [
    sitemap({
      i18n: { defaultLocale: DEFAULT_LOCALE, locales: { ...LANG_TAGS } },
      filter: (page) => !page.includes('/styleguide/'),
    }),
  ],
});
