import { describe, expect, it } from 'vitest';
import { coverTransform, parseObjectPosition, surfaceDpr } from './viewport.ts';

const close = (values: readonly number[]) => values.map((value) => Number(value.toFixed(4)));

describe('coverTransform (object-fit: cover in the shader)', () => {
  it('maps the screen onto the whole image when the ratios match', () => {
    const { scale, offset } = coverTransform(
      { width: 400, height: 300 },
      { width: 800, height: 600 },
    );
    expect(close(scale)).toEqual([1, 1]);
    expect(close(offset)).toEqual([0, 0]);
  });

  it('crops the height of a 4:3 image in a wide box, at the object-position', () => {
    // Box 2:1, image 4:3: the box shows 2/3 of the height; 60 % from the top leaves 0.2 above.
    const { scale, offset } = coverTransform(
      { width: 4, height: 3 },
      { width: 2, height: 1 },
      { x: 0.5, y: 0.6 },
    );
    expect(close(scale)).toEqual([1, 0.6667]);
    // GL coordinates (y up): the bottom of the screen samples 1 − 2/3 − 0.2 of the image.
    expect(close(offset)).toEqual([0, 0.1333]);
  });

  it('crops the width of a 4:3 image in a portrait box, centred', () => {
    const { scale, offset } = coverTransform(
      { width: 4, height: 3 },
      { width: 3, height: 6 },
      { x: 0.5, y: 0.5 },
    );
    // The box shows (3/6) / (4/3) = 3/8 of the width.
    expect(close(scale)).toEqual([0.375, 1]);
    expect(close(offset)).toEqual([0.3125, 0]);
  });

  it('keeps the full image for an empty box', () => {
    const { scale, offset } = coverTransform({ width: 4, height: 3 }, { width: 0, height: 0 });
    expect(scale).toEqual([1, 1]);
    expect(offset).toEqual([0, 0]);
  });
});

describe('surfaceDpr', () => {
  it('caps the pixel ratio at 1.5', () => {
    expect(surfaceDpr(3, false)).toBe(1.5);
    expect(surfaceDpr(1, false)).toBe(1);
  });

  it('renders at 3/4 of the resolution on phones', () => {
    expect(surfaceDpr(3, true)).toBe(1.125);
    expect(surfaceDpr(1, true)).toBe(0.75);
  });

  it('falls back to 1 for a missing or broken ratio', () => {
    expect(surfaceDpr(0, false)).toBe(1);
    expect(surfaceDpr(Number.NaN, false)).toBe(1);
  });
});

describe('parseObjectPosition', () => {
  it('reads the percentages of a computed object-position', () => {
    expect(parseObjectPosition('50% 60%')).toEqual({ x: 0.5, y: 0.6 });
    expect(parseObjectPosition('0% 100%')).toEqual({ x: 0, y: 1 });
  });

  it('falls back to the centre for what it cannot read', () => {
    expect(parseObjectPosition('')).toEqual({ x: 0.5, y: 0.5 });
    expect(parseObjectPosition('left 10px top')).toEqual({ x: 0.5, y: 0.5 });
    expect(parseObjectPosition('20% 3px')).toEqual({ x: 0.2, y: 0.5 });
  });
});
