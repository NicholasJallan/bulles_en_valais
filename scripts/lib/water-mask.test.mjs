import { describe, expect, it } from 'vitest';
import { maskSize, polygonPath, waterMaskSvg } from './water-mask.mjs';

const SQUARE = [
  [0, 0.5],
  [1, 0.5],
  [1, 1],
  [0, 1],
];

describe('maskSize', () => {
  it('keeps the aspect ratio of the hero, rounded to whole pixels', () => {
    expect(maskSize(4080, 3072, 512)).toEqual({ width: 512, height: 386 });
    expect(maskSize(3200, 1800, 512)).toEqual({ width: 512, height: 288 });
  });

  it('refuses sizes that are not positive', () => {
    expect(() => maskSize(0, 100, 512)).toThrow(/positive/);
    expect(() => maskSize(100, 100, -1)).toThrow(/positive/);
  });
});

describe('polygonPath', () => {
  it('scales normalised points to the mask and closes the path', () => {
    expect(polygonPath(SQUARE, 200, 100)).toBe('M0 50L200 50L200 100L0 100Z');
  });

  it('rounds coordinates to a tenth of a pixel', () => {
    expect(
      polygonPath(
        [
          [0.12345, 0.5],
          [1, 0.5],
          [1, 1],
        ],
        100,
        100,
      ),
    ).toBe('M12.3 50L100 50L100 100Z');
  });

  it('accepts points that overshoot the frame by the margin, so the feather keeps the borders white', () => {
    expect(
      polygonPath(
        [
          [-0.05, 0.5],
          [1.05, 0.5],
          [1.05, 1.05],
        ],
        100,
        100,
      ),
    ).toBe('M-5 50L105 50L105 105Z');
  });

  it('refuses fewer than three points or points outside the image', () => {
    expect(() =>
      polygonPath(
        [
          [0, 0],
          [1, 1],
        ],
        10,
        10,
      ),
    ).toThrow(/three points/);
    expect(() =>
      polygonPath(
        [
          [0, 0],
          [1.2, 1],
          [0, 1],
        ],
        10,
        10,
      ),
    ).toThrow(/outside/);
    expect(() =>
      polygonPath(
        [
          [0, 0],
          [Number.NaN, 1],
          [0, 1],
        ],
        10,
        10,
      ),
    ).toThrow(/outside/);
  });
});

describe('waterMaskSvg', () => {
  it('draws the water in white on black, blurred by the feather', () => {
    const svg = waterMaskSvg({ width: 200, height: 100, water: SQUARE, feather: 3 });
    expect(svg).toContain('width="200" height="100" viewBox="0 0 200 100"');
    expect(svg).toContain('<rect x="0" y="0" width="200" height="100" fill="#000"/>');
    expect(svg).toContain('d="M0 50L200 50L200 100L0 100Z"');
    expect(svg).toContain('fill="#fff"');
    expect(svg).toContain('stdDeviation="3"');
  });

  it('cuts the holes (rocks above the surface) out of the water with even-odd filling', () => {
    const hole = [
      [0.4, 0.7],
      [0.6, 0.7],
      [0.5, 0.9],
    ];
    const svg = waterMaskSvg({ width: 100, height: 100, water: SQUARE, holes: [hole], feather: 1 });
    expect(svg).toContain('fill-rule="evenodd"');
    expect(svg).toContain('d="M0 50L100 50L100 100L0 100ZM40 70L60 70L50 90Z"');
  });

  it('extends the canvas by the padding so the blur is not clipped by the frame', () => {
    const svg = waterMaskSvg({ width: 200, height: 100, water: SQUARE, feather: 3, pad: 10 });
    expect(svg).toContain('width="220" height="120" viewBox="-10 -10 220 120"');
    expect(svg).toContain('<rect x="-10" y="-10" width="220" height="120" fill="#000"/>');
  });

  it('omits the blur filter when there is no feather', () => {
    expect(waterMaskSvg({ width: 10, height: 10, water: SQUARE, feather: 0 })).not.toContain(
      'filter',
    );
  });
});
