#!/usr/bin/env node
// @ts-check
// Open Graph images: public/og/og-fr.jpg and og-en.jpg, 1200×630, ≤ 200 KB. A crop of the hero, the
// logo in foam and the hero title in Instrument Serif (scripts/fonts/, OFL 1.1), read from the
// dictionaries and drawn as paths. Usage: node scripts/make-og.mjs (after changing the hero or its title).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import opentype from 'opentype.js';
import sharp from 'sharp';
import { getDictionary } from '../src/i18n/index.ts';
import { textPath } from './lib/text-path.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const HERO = path.join(ROOT, 'src/assets/images/hero/rosel.jpg');
/** Top of the crop, as a share of the hero height: keeps the peaks and the clear water. */
const HERO_TOP = 0.1;
const LOGO = path.join(ROOT, 'src/assets/brand/logo.svg');
const LOGO_HEIGHT = 178;
const OUT = path.join(ROOT, 'public/og');
const W = 1200;
const H = 630;
const MARGIN = 64;
const TITLE = { size: 80, leading: 1.04 };
const EYEBROW = { size: 24, tracking: 3, gap: 26 };
const FOAM = '#f4f2ea';
const ABYSS = '#010a15';
const MAX_BYTES = 200 * 1024;

/** @param {string} file */
const loadFont = (file) =>
  opentype.parse(new Uint8Array(readFileSync(path.join(ROOT, 'scripts/fonts', file))).buffer);
const roman = loadFont('InstrumentSerif-Regular.ttf');
const italic = loadFont('InstrumentSerif-Italic.ttf');

const shade =
  `<defs><linearGradient id="l" x1="0" x2="1"><stop offset="0" stop-color="${ABYSS}" stop-opacity=".72"/>` +
  `<stop offset=".62" stop-color="${ABYSS}" stop-opacity="0"/></linearGradient>` +
  `<linearGradient id="b" x1="0" x2="0" y1="0" y2="1"><stop offset=".45" stop-color="${ABYSS}" stop-opacity="0"/>` +
  `<stop offset="1" stop-color="${ABYSS}" stop-opacity=".6"/></linearGradient></defs>` +
  `<rect width="${W}" height="${H}" fill="url(#l)"/><rect width="${W}" height="${H}" fill="url(#b)"/>`;

/** @param {string} svg */
function inFoam(svg) {
  const foam = svg.replace('fill="currentColor"', `fill="${FOAM}"`);
  if (foam === svg) throw new Error('logo.svg: fill="currentColor" not found');
  return foam;
}

/** @param {import('../src/i18n/types.ts').Locale} locale */
function overlay(locale) {
  const { hero } = getDictionary(locale);
  const { before = '', em, after = '' } = hero.title;
  const lineHeight = TITLE.size * TITLE.leading;
  const second = H - MARGIN - TITLE.size * 0.22;
  const first = second - lineHeight;
  const eyebrowBaseline = first - TITLE.size * 0.78 - EYEBROW.gap;
  const lines = [
    textPath(
      [
        { text: before ? `${before} ` : '', font: roman },
        { text: em, font: italic },
      ],
      { x: MARGIN, y: first, size: TITLE.size },
    ),
    textPath([{ text: after, font: roman }], { x: MARGIN, y: second, size: TITLE.size }),
    textPath([{ text: hero.eyebrow.toUpperCase(), font: roman }], {
      x: MARGIN,
      y: eyebrowBaseline,
      size: EYEBROW.size,
      tracking: EYEBROW.tracking,
    }),
  ];
  const widest = Math.max(...lines.map(({ width }) => width));
  if (widest > W - 2 * MARGIN)
    throw new Error(`og-${locale}: the title is ${Math.round(widest)} px wide`);
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${shade}` +
      `<g fill="${FOAM}">${lines.flatMap(({ paths }) => paths.map((d) => `<path d="${d}"/>`)).join('')}</g></svg>`,
  );
}

/** @param {import('../src/i18n/types.ts').Locale} locale */
async function makeOg(locale) {
  const meta = await sharp(HERO).metadata();
  const cropHeight = Math.round((meta.width * H) / W);
  const background = await sharp(HERO)
    .extract({
      left: 0,
      top: Math.round(meta.height * HERO_TOP),
      width: meta.width,
      height: cropHeight,
    })
    .resize(W, H)
    .toBuffer();
  const logo = await sharp(Buffer.from(inFoam(readFileSync(LOGO, 'utf8'))))
    .resize({ height: LOGO_HEIGHT })
    .png()
    .toBuffer();
  const flat = await sharp(background)
    .composite([{ input: overlay(locale) }, { input: logo, left: MARGIN, top: MARGIN - 8 }])
    .toBuffer();
  for (let quality = 86; quality >= 60; quality -= 4) {
    const jpeg = await sharp(flat).jpeg({ quality, mozjpeg: true }).toBuffer();
    if (jpeg.length <= MAX_BYTES) {
      writeFileSync(path.join(OUT, `og-${locale}.jpg`), jpeg);
      return `og-${locale}.jpg ${Math.round(jpeg.length / 1024)} KB (q${quality})`;
    }
  }
  throw new Error(`og-${locale}.jpg stays above ${MAX_BYTES} bytes`);
}

mkdirSync(OUT, { recursive: true });
for (const locale of /** @type {const} */ (['fr', 'en'])) console.log(await makeOg(locale));
