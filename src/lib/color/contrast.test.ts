import { describe, expect, it } from 'vitest';
import {
  WCAG_MIN,
  compositeOver,
  contrastRatio,
  contrastRatioRgb,
  isInSrgbGamut,
  oklchToSrgb,
  relativeLuminance,
  srgbToHex,
  type Oklch,
  type Rgb,
} from './contrast.ts';

const BLACK: Oklch = { l: 0, c: 0, h: 0 };
const WHITE: Oklch = { l: 1, c: 0, h: 0 };

function expectRgb(actual: Rgb, expected: Rgb, precision = 2): void {
  expect(actual.r).toBeCloseTo(expected.r, precision);
  expect(actual.g).toBeCloseTo(expected.g, precision);
  expect(actual.b).toBeCloseTo(expected.b, precision);
}

describe('oklchToSrgb', () => {
  it('maps the ends of the lightness axis to black and white', () => {
    expectRgb(oklchToSrgb(BLACK), { r: 0, g: 0, b: 0 }, 6);
    expectRgb(oklchToSrgb(WHITE), { r: 1, g: 1, b: 1 }, 4);
  });

  it('matches the CSS Color 4 reference values of the sRGB primaries', () => {
    expectRgb(oklchToSrgb({ l: 0.628, c: 0.2577, h: 29.23 }), { r: 1, g: 0, b: 0 });
    expectRgb(oklchToSrgb({ l: 0.452, c: 0.313, h: 264.05 }), { r: 0, g: 0, b: 1 });
  });

  it('gamma-encodes an achromatic colour (OKLab L is the cube root of luminance)', () => {
    // sRGB 0.5 → linear 0.21404 → L = ∛0.21404 = 0.59814
    expectRgb(oklchToSrgb({ l: 0.59814, c: 0, h: 0 }), { r: 0.5, g: 0.5, b: 0.5 }, 3);
  });

  it('clips colours outside the sRGB gamut to [0, 1]', () => {
    const { r, g, b } = oklchToSrgb({ l: 0.7, c: 0.4, h: 150 });
    for (const channel of [r, g, b]) {
      expect(channel).toBeGreaterThanOrEqual(0);
      expect(channel).toBeLessThanOrEqual(1);
    }
    expect(r).toBe(0);
  });
});

describe('isInSrgbGamut', () => {
  it('accepts the greys and the primaries (within rounding)', () => {
    expect(isInSrgbGamut(BLACK)).toBe(true);
    expect(isInSrgbGamut(WHITE)).toBe(true);
    expect(isInSrgbGamut({ l: 0.628, c: 0.2577, h: 29.23 })).toBe(true);
  });

  it('rejects a colour that clipping would alter', () => {
    expect(isInSrgbGamut({ l: 0.7, c: 0.4, h: 150 })).toBe(false);
    expect(isInSrgbGamut({ l: 0.37, c: 0.065, h: 202 })).toBe(false);
  });
});

describe('relativeLuminance', () => {
  it('follows the WCAG definition', () => {
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBe(0);
    expect(relativeLuminance({ r: 1, g: 1, b: 1 })).toBeCloseTo(1, 10);
    expect(relativeLuminance({ r: 0.5, g: 0.5, b: 0.5 })).toBeCloseTo(0.214, 3);
  });

  it('weights green far more than blue', () => {
    expect(relativeLuminance({ r: 0, g: 1, b: 0 })).toBeCloseTo(0.7152, 4);
    expect(relativeLuminance({ r: 0, g: 0, b: 1 })).toBeCloseTo(0.0722, 4);
  });

  it('uses the linear segment of the sRGB curve for very dark values', () => {
    expect(relativeLuminance({ r: 0.04, g: 0.04, b: 0.04 })).toBeCloseTo(0.04 / 12.92, 6);
  });
});

describe('contrastRatio', () => {
  it('is 21 between black and white, 1 between a colour and itself', () => {
    expect(contrastRatio(BLACK, WHITE)).toBeCloseTo(21, 2);
    expect(contrastRatio(WHITE, WHITE)).toBeCloseTo(1, 10);
  });

  it('does not depend on the order of its arguments', () => {
    const torch: Oklch = { l: 0.6, c: 0.2, h: 30 };
    expect(contrastRatio(torch, WHITE)).toBeCloseTo(contrastRatio(WHITE, torch), 10);
  });

  it('gives the well-known 4.48:1 of #777 on white', () => {
    // #777777 → linear 0.1845 → L = ∛0.1845 = 0.5693
    expect(contrastRatio({ l: 0.5693, c: 0, h: 0 }, WHITE)).toBeCloseTo(4.48, 1);
  });
});

describe('compositeOver', () => {
  const white: Rgb = { r: 1, g: 1, b: 1 };
  const black: Rgb = { r: 0, g: 0, b: 0 };

  it('blends gamma-encoded channels, as browsers paint a translucent layer', () => {
    expectRgb(compositeOver(white, 0.5, black), { r: 0.5, g: 0.5, b: 0.5 }, 6);
    expectRgb(compositeOver({ r: 1, g: 0, b: 0 }, 0.25, white), { r: 1, g: 0.75, b: 0.75 }, 6);
  });

  it('keeps the bottom colour at alpha 0 and the top one at alpha 1', () => {
    expectRgb(compositeOver(white, 0, black), black, 6);
    expectRgb(compositeOver(white, 1, black), white, 6);
  });
});

describe('contrastRatioRgb', () => {
  it('measures two sRGB colours, whatever their order', () => {
    const grey: Rgb = { r: 0.5, g: 0.5, b: 0.5 };
    expect(contrastRatioRgb({ r: 0, g: 0, b: 0 }, { r: 1, g: 1, b: 1 })).toBeCloseTo(21, 6);
    expect(contrastRatioRgb(grey, { r: 1, g: 1, b: 1 })).toBeCloseTo(
      contrastRatioRgb({ r: 1, g: 1, b: 1 }, grey),
      10,
    );
  });
});

describe('srgbToHex', () => {
  it('writes the CSS hexadecimal notation, rounding each channel', () => {
    expect(srgbToHex({ r: 1, g: 0, b: 0 })).toBe('#ff0000');
    expect(srgbToHex({ r: 0.5, g: 0.5, b: 0.5 })).toBe('#808080');
    expect(srgbToHex(oklchToSrgb(BLACK))).toBe('#000000');
  });
});

describe('WCAG_MIN', () => {
  it('holds the AA thresholds for text, large text and interface parts', () => {
    expect(WCAG_MIN).toEqual({ text: 4.5, large: 3, ui: 3 });
  });
});
