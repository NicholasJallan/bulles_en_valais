import { describe, expect, it } from 'vitest';
import { glyphPathData, textPath } from './text-path.mjs';

/** A fake font: 1000 units per em, every glyph 500 units wide and drawn as a triangle 1000 high,
 * "A" then "V" kern by -100, and a space without outline. */
function fakeFont() {
  const triangle = [
    { type: 'M', x: 0, y: 0 },
    { type: 'L', x: 500, y: 0 },
    { type: 'L', x: 250, y: 1000 },
    { type: 'Z' },
  ];
  return {
    unitsPerEm: 1000,
    charToGlyph: (char) => ({
      char,
      advanceWidth: 500,
      path: { commands: char === ' ' ? [] : triangle },
    }),
    getKerningValue: (left, right) => (left.char === 'A' && right.char === 'V' ? -100 : 0),
  };
}

describe('glyphPathData', () => {
  it('scales the outline from font units, flips it (font y points up) and moves it to the origin', () => {
    const commands = [
      { type: 'M', x: 0, y: 0 },
      { type: 'Q', x1: 100, y1: 200, x: 300, y: 0 },
      { type: 'C', x1: 1, y1: 2, x2: 3, y2: 4, x: 5, y: 6 },
      { type: 'L', x: 333, y: 1000 },
      { type: 'Z' },
    ];
    expect(glyphPathData(commands, { x: 10, y: 50, scale: 0.1 })).toBe(
      'M10 50Q20 30 40 50C10.1 49.8 10.3 49.6 10.5 49.4L43.3 -50Z',
    );
  });
});

describe('textPath', () => {
  it('places the glyphs one after the other, scaled to the font size', () => {
    const { paths, width } = textPath([{ text: 'ab', font: fakeFont() }], {
      x: 10,
      y: 50,
      size: 20,
    });
    expect(paths).toEqual(['M10 50L20 50L15 30Z', 'M20 50L30 50L25 30Z']);
    expect(width).toBe(20);
  });

  it('applies the kerning of the font', () => {
    const { width } = textPath([{ text: 'AV', font: fakeFont() }], { x: 0, y: 0, size: 10 });
    expect(width).toBe(9);
  });

  it('chains runs in different fonts (roman then italic) without kerning across them', () => {
    const { width } = textPath(
      [
        { text: 'A', font: fakeFont() },
        { text: 'V', font: fakeFont() },
      ],
      { x: 0, y: 0, size: 10 },
    );
    expect(width).toBe(10);
  });

  it('adds the letter spacing between glyphs', () => {
    const { width } = textPath([{ text: 'abc', font: fakeFont() }], {
      x: 0,
      y: 0,
      size: 10,
      tracking: 2,
    });
    expect(width).toBe(19);
  });

  it('draws the same glyph identically wherever it appears', () => {
    const { paths } = textPath([{ text: 'aa', font: fakeFont() }], { x: 0, y: 0, size: 10 });
    expect(paths[1]).toBe('M5 0L10 0L7.5 -10Z');
  });

  it('skips the glyphs without outline (spaces) but keeps their width', () => {
    expect(
      textPath([{ text: 'a b', font: fakeFont() }], { x: 0, y: 0, size: 10 }).paths,
    ).toHaveLength(2);
    expect(textPath([{ text: 'a b', font: fakeFont() }], { x: 0, y: 0, size: 10 }).width).toBe(15);
  });

  it('measures an empty text as zero wide', () => {
    expect(textPath([{ text: '', font: fakeFont() }], { x: 0, y: 0, size: 10 })).toEqual({
      paths: [],
      width: 0,
    });
  });
});
