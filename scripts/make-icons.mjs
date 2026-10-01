#!/usr/bin/env node
// @ts-check
// Favicons from the symbol of the logo (#mark of src/assets/brand/logo.svg):
//   public/favicon.svg            navy, foam when the browser is in dark mode
//   public/apple-touch-icon.png   180 px, foam symbol on a navy tile
//   public/icon-192.png, icon-512.png (site.webmanifest)
// Usage: node scripts/make-icons.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const LOGO = path.join(ROOT, 'src/assets/brand/logo.svg');
const PUBLIC = path.join(ROOT, 'public');
/** Navy of the logo, and the foam of the palette (--c-foam). */
const NAVY = '#141646';
const FOAM = '#f4f2ea';
/** Share of the tile left around the symbol (the safe zone of a maskable icon is 80 %). */
const TILE_PADDING = 0.16;
const FAVICON_PADDING = 0.02;

const logo = readFileSync(LOGO, 'utf8');
const viewBox = /viewBox="([^"]+)"/.exec(logo)?.[1];
const markPath = /<g id="mark"><path d="([^"]+)"\/><\/g>/.exec(logo)?.[1];
if (!viewBox || !markPath) throw new Error('logo.svg: viewBox or #mark not found');
const [, , width, height] = viewBox.split(' ').map(Number);

/** Bounding box of the symbol, measured on a rendering of it. */
async function markBox() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${width}" height="${height}"><path d="${markPath}"/></svg>`;
  const { info } = await sharp(Buffer.from(svg))
    .trim({ threshold: 1 })
    .toBuffer({ resolveWithObject: true });
  return {
    x: -(info.trimOffsetLeft ?? 0),
    y: -(info.trimOffsetTop ?? 0),
    w: info.width,
    h: info.height,
  };
}

/** Square viewBox centred on the symbol, with a padding ratio. */
function square(box, padding) {
  const side = Math.max(box.w, box.h) / (1 - 2 * padding);
  const x = box.x + box.w / 2 - side / 2;
  const y = box.y + box.h / 2 - side / 2;
  return [x, y, side, side].map((v) => Math.round(v)).join(' ');
}

const box = await markBox();

const favicon =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${square(box, FAVICON_PADDING)}">` +
  `<style>path{fill:${NAVY}}@media (prefers-color-scheme:dark){path{fill:${FOAM}}}</style>` +
  `<path d="${markPath}"/></svg>\n`;
writeFileSync(path.join(PUBLIC, 'favicon.svg'), favicon);

const tile = (/** @type {number} */ size) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${square(box, TILE_PADDING)}" width="${size}" height="${size}">` +
      `<rect x="-99999" y="-99999" width="199999" height="199999" fill="${NAVY}"/>` +
      `<path d="${markPath}" fill="${FOAM}"/></svg>`,
  );
for (const [name, size] of /** @type {const} */ ([
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
])) {
  await sharp(tile(size))
    .flatten({ background: NAVY })
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(PUBLIC, name));
}
console.log(
  `favicon.svg (${favicon.length} bytes), apple-touch-icon.png, icon-192.png, icon-512.png`,
);
