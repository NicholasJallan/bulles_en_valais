#!/usr/bin/env node
// @ts-check
// Traces src/assets/brand/LogoFull.png (Nicholas's logo, navy on transparent and white) into
// src/assets/brand/logo.svg, with named groups for the animations (E15):
//   #mark      the circle, the Matterhorn and the bubbles fused to the circle
//   #bubbles   the free bubbles, one <path class="bubble"> each, from the circle upwards
//   #wordmark  "Bulles en Valais"
// The paths use currentColor: the colour comes from CSS. Only the navy strokes are traced; the white
// fills of the PNG become transparent. Stopgap until the vector original (.ai) is available (I-02).
// Requires potrace (brew install potrace). Usage: node scripts/trace-logo.mjs, then npx svgo.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SOURCE = path.join(ROOT, 'src/assets/brand/LogoFull.png');
const TARGET = path.join(ROOT, 'src/assets/brand/logo.svg');
/** Positions are expressed in units of a logo 650 px wide (the reference used to tune them). */
const REF_WIDTH = 650;
/** The wordmark lies right of x = 375 and below y = 190 (bubbles are above or left of it). */
const WORDMARK = { minX: 375, minY: 190 };
/** Highlight arcs drawn inside the bubbles fused to the circle: they belong to #mark. */
const FUSED_ARCS = [
  [140, 175],
  [262, 209],
  [57, 220],
  [230, 243],
  [330, 260],
];
const MARK_MIN_PIXELS = 200_000;

const { data, info } = await sharp(SOURCE)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;
const k = REF_WIDTH / W;

/** Dark, opaque pixels only: the navy strokes. */
const ink = new Uint8Array(W * H);
for (let i = 0; i < W * H; i++) {
  ink[i] = data[4 * i + 3] > 127 && data[4 * i] + data[4 * i + 1] + data[4 * i + 2] < 384 ? 1 : 0;
}

/** @typedef {{ id: number, px: number[], cx: number, cy: number, x0: number, x1: number, y0: number, y1: number }} Component */
/** @returns {Component[]} 4-connected components of the ink */
function components() {
  const label = new Int32Array(W * H).fill(-1);
  /** @type {Component[]} */
  const found = [];
  for (let i = 0; i < W * H; i++) {
    if (!ink[i] || label[i] >= 0) continue;
    const id = found.length;
    const px = [];
    const stack = [i];
    label[i] = id;
    while (stack.length > 0) {
      const p = /** @type {number} */ (stack.pop());
      px.push(p);
      const x = p % W;
      for (const q of [p - 1, p + 1, p - W, p + W]) {
        if (q >= 0 && q < W * H && ink[q] && label[q] < 0 && Math.abs((q % W) - x) <= 1) {
          label[q] = id;
          stack.push(q);
        }
      }
    }
    let [sx, sy, x0, x1, y0, y1] = [0, 0, W, 0, H, 0];
    for (const p of px) {
      const x = p % W;
      const y = Math.floor(p / W);
      sx += x;
      sy += y;
      [x0, x1, y0, y1] = [Math.min(x0, x), Math.max(x1, x), Math.min(y0, y), Math.max(y1, y)];
    }
    found.push({ id, px, cx: sx / px.length, cy: sy / px.length, x0, x1, y0, y1 });
  }
  return found;
}

/** @param {number[]} pixels @param {string} dir */
function trace(pixels, dir) {
  const rowBytes = Math.ceil(W / 8);
  const body = Buffer.alloc(rowBytes * H);
  for (const p of pixels) {
    const x = p % W;
    body[Math.floor(p / W) * rowBytes + (x >> 3)] |= 0x80 >> (x & 7);
  }
  const pbm = path.join(dir, 'in.pbm');
  const svg = path.join(dir, 'out.svg');
  writeFileSync(pbm, Buffer.concat([Buffer.from(`P4\n${W} ${H}\n`), body]));
  execFileSync('potrace', [
    pbm,
    '-b',
    'svg',
    '--flat',
    '-u',
    '1',
    '-a',
    '1.0',
    '-O',
    '0.4',
    '-o',
    svg,
  ]);
  return [...readFileSync(svg, 'utf8').matchAll(/ d="([^"]+)"/g)].map((m) => m[1]).join(' ');
}

const all = components();
const mark = all.filter((c) => c.px.length > MARK_MIN_PIXELS);
const wordmark = all.filter(
  (c) => !mark.includes(c) && c.cx * k > WORDMARK.minX && c.cy * k > WORDMARK.minY,
);
const free = all.filter((c) => !mark.includes(c) && !wordmark.includes(c));
// a highlight arc inside a free bubble is traced with that bubble
/** @param {Component} a @param {Component} b */
const inside = (a, b) =>
  a !== b && a.cx > b.x0 && a.cx < b.x1 && a.cy > b.y0 && a.cy < b.y1 && a.px.length < b.px.length;
const roots = free.filter((c) => !free.some((o) => inside(c, o)));
const fused = roots.filter((c) =>
  FUSED_ARCS.some(([x, y]) => Math.hypot(c.cx * k - x, c.cy * k - y) < 4),
);
if (fused.length !== FUSED_ARCS.length)
  throw new Error(`expected ${FUSED_ARCS.length} fused arcs, found ${fused.length}`);
const bubbles = roots.filter((c) => !fused.includes(c)).sort((a, b) => b.cy - a.cy);

const dir = mkdtempSync(path.join(tmpdir(), 'logo-'));
try {
  const flip = `translate(0 ${H}) scale(1 -1)`;
  const markPath = trace(
    [...mark, ...fused].flatMap((c) => c.px),
    dir,
  );
  const bubblePaths = bubbles.map((root) =>
    trace(
      [root, ...free.filter((c) => inside(c, root))].flatMap((c) => c.px),
      dir,
    ),
  );
  const wordPath = trace(
    wordmark.flatMap((c) => c.px),
    dir,
  );
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" fill="currentColor">` +
    `<g id="mark" transform="${flip}"><path d="${markPath}"/></g>` +
    `<g id="bubbles" transform="${flip}">${bubblePaths.map((d) => `<path class="bubble" d="${d}"/>`).join('')}</g>` +
    `<g id="wordmark" transform="${flip}"><path d="${wordPath}"/></g></svg>\n`;
  writeFileSync(TARGET, svg);
  console.log(`logo.svg: ${bubbles.length} bubbles, ${svg.length} bytes`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
