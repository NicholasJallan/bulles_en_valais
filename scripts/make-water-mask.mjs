#!/usr/bin/env node
// @ts-check
// Water mask of the hero for effect E1 (S07): src/assets/textures/water-mask.png, 512 px wide,
// grayscale, white = water, feathered edge. Also writes a semi-transparent overlay of the mask on the
// hero into the gate folder, to check the alignment.
// Usage: node scripts/make-water-mask.mjs [hero id, default: rosel]
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { maskSize, waterMaskSvg } from './lib/water-mask.mjs';

/** @typedef {import('./lib/water-mask.mjs').Polygon} Polygon */

const ROOT = path.resolve(import.meta.dirname, '..');
const MASK_WIDTH = 512;
const FEATHER = 3;
const OVERLAY_WIDTH = 1200;

/**
 * Shoreline hand-tuned on the hero (normalised coordinates), Gate 3: option A.
 * @type {Record<'rosel', { src: string, water: Polygon, holes: readonly Polygon[] }>}
 */
const HEROES = {
  rosel: {
    src: 'src/assets/images/hero/rosel.jpg',
    // from the left shore along the far bank, down the gravel beach on the right
    water: [
      [-0.02, 0.447],
      [0.15, 0.449],
      [0.5, 0.443],
      [1.02, 0.438],
      [1.02, 0.882],
      [0.983, 0.894],
      [0.931, 0.91],
      [0.862, 0.929],
      [0.794, 0.946],
      [0.69, 0.974],
      [0.6, 1.02],
      [-0.02, 1.02],
    ],
    // the rock that breaks the surface in the foreground
    holes: [
      [
        [0.503, 0.893],
        [0.53, 0.873],
        [0.57, 0.866],
        [0.6, 0.875],
        [0.62, 0.9],
        [0.612, 0.922],
        [0.55, 0.918],
        [0.52, 0.905],
      ],
    ],
  },
};

const id = process.argv[2] ?? 'rosel';
if (!Object.hasOwn(HEROES, id))
  throw new Error(`unknown hero "${id}" (${Object.keys(HEROES).join(', ')})`);
const hero = HEROES[/** @type {keyof typeof HEROES} */ (id)];

const source = await sharp(path.join(ROOT, hero.src)).metadata();
const { width, height } = maskSize(source.width, source.height, MASK_WIDTH);
const pad = 4 * FEATHER;
const svg = waterMaskSvg({
  width,
  height,
  water: hero.water,
  holes: hero.holes,
  feather: FEATHER,
  pad,
});
const mask = await sharp(
  await sharp(Buffer.from(svg)).flatten({ background: '#000' }).greyscale().png().toBuffer(),
)
  .extract({ left: pad, top: pad, width, height })
  .png()
  .toBuffer();

const textures = path.join(ROOT, 'src/assets/textures');
mkdirSync(textures, { recursive: true });
await sharp(mask)
  .toColourspace('b-w')
  .png({ compressionLevel: 9 })
  .toFile(path.join(textures, 'water-mask.png'));

// control overlay: the water tinted in torch red at 45 % over the hero
const overlayHeight = Math.round((OVERLAY_WIDTH * height) / width);
const tint = await sharp({
  create: { width: OVERLAY_WIDTH, height: overlayHeight, channels: 3, background: '#e0452b' },
})
  .joinChannel(await sharp(mask).resize(OVERLAY_WIDTH, overlayHeight).linear(0.45, 0).toBuffer())
  .png()
  .toBuffer();
const gate = path.join(ROOT, 'plans/refonte-la-descente/gates/gate-3');
mkdirSync(gate, { recursive: true });
await sharp(path.join(ROOT, hero.src))
  .resize(OVERLAY_WIDTH, overlayHeight)
  .composite([{ input: tint }])
  .jpeg({ quality: 80, mozjpeg: true })
  .toFile(path.join(gate, `water-mask-${id}.jpg`));

console.log(`water-mask.png ${width}×${height} (${id}), overlay in ${path.relative(ROOT, gate)}`);
