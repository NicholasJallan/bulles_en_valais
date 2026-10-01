// @ts-check
// Text drawn as SVG paths, glyph by glyph, with the kerning of the font. Used to render the Open
// Graph images without system fonts (Pango uses CoreText on macOS and ignores bundled font files).
// - The outlines are scaled here from the raw commands of the glyphs: opentype.js 2.0 returns NaN
//   coordinates from Glyph.getPath() when the same glyph is drawn a second time.
// - One path per glyph: the SVG renderer of sharp silently truncates a `d` attribute of about 10 000
//   characters, which a single path for a whole line exceeds.

/**
 * The parts of an opentype.js Font this module needs.
 * @typedef {{ type: string, x?: number, y?: number, x1?: number, y1?: number, x2?: number, y2?: number }} Command
 * @typedef {{ advanceWidth?: number, path: { commands: readonly Command[] } }} Glyph
 * @typedef {{ unitsPerEm: number, charToGlyph: (char: string) => Glyph, getKerningValue: (left: Glyph, right: Glyph) => number }} Font
 */

/** @param {number} value */
const format = (value) => String(Math.round(value * 100) / 100);

/**
 * @param {readonly Command[]} commands outline in font units, y pointing up
 * @param {{ x: number, y: number, scale: number }} origin baseline origin in pixels, pixels per unit
 */
export function glyphPathData(commands, { x, y, scale }) {
  /** @param {number | undefined} px @param {number | undefined} py */
  const point = (px = 0, py = 0) => `${format(x + px * scale)} ${format(y - py * scale)}`;
  return commands
    .map((c) => {
      if (c.type === 'Z') return 'Z';
      if (c.type === 'Q') return `Q${point(c.x1, c.y1)} ${point(c.x, c.y)}`;
      if (c.type === 'C') return `C${point(c.x1, c.y1)} ${point(c.x2, c.y2)} ${point(c.x, c.y)}`;
      return `${c.type}${point(c.x, c.y)}`;
    })
    .join('');
}

/**
 * @param {readonly { text: string, font: Font }[]} runs consecutive pieces of text, each in one font
 * @param {{ x: number, y: number, size: number, tracking?: number }} options baseline origin, font size
 *   in pixels, letter spacing in pixels
 * @returns {{ paths: string[], width: number }} path data of each glyph, advance width of the line
 */
export function textPath(runs, { x, y, size, tracking = 0 }) {
  let cursor = x;
  /** @type {string[]} */
  const paths = [];
  let glyphs = 0;
  for (const { text, font } of runs) {
    const scale = size / font.unitsPerEm;
    /** @type {Glyph | undefined} */
    let previous;
    for (const char of text) {
      const glyph = font.charToGlyph(char);
      if (glyphs > 0) cursor += tracking;
      if (previous) cursor += font.getKerningValue(previous, glyph) * scale;
      if (glyph.path.commands.length > 0)
        paths.push(glyphPathData(glyph.path.commands, { x: cursor, y, scale }));
      cursor += (glyph.advanceWidth ?? 0) * scale;
      previous = glyph;
      glyphs++;
    }
  }
  return { paths, width: cursor - x };
}
