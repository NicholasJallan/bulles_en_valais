/** OKLCH colour: lightness and chroma as in CSS (`l` from 0 to 1), hue in degrees. */
export interface Oklch {
  readonly l: number;
  readonly c: number;
  readonly h: number;
}

/** Gamma-encoded sRGB, each channel from 0 to 1. */
export interface Rgb {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

/** WCAG 2.2 AA minimum contrast: body text, large text (≥ 24 px, or 18.66 px bold), UI parts. */
export const WCAG_MIN = { text: 4.5, large: 3, ui: 3 } as const;

const clip = (value: number): number => Math.min(1, Math.max(0, value));

const encodeGamma = (linear: number): number =>
  linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055;

const decodeGamma = (encoded: number): number =>
  encoded <= 0.04045 ? encoded / 12.92 : ((encoded + 0.055) / 1.055) ** 2.4;

/** OKLCH → OKLab → linear sRGB (Björn Ottosson's matrices). */
function oklchToLinearSrgb({ l, c, h }: Oklch): Rgb {
  const hue = (h * Math.PI) / 180;
  const a = c * Math.cos(hue);
  const b = c * Math.sin(hue);
  const long = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const medium = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const short = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return {
    r: 4.0767416621 * long - 3.3077115913 * medium + 0.2309699292 * short,
    g: -1.2684380046 * long + 2.6097574011 * medium - 0.3413193965 * short,
    b: -0.0041960863 * long - 0.7034186147 * medium + 1.707614701 * short,
  };
}

/** Linear-light tolerance: the CSS reference values of the primaries are rounded. */
const GAMUT_EPSILON = 0.001;

/** Whether the colour is displayable in sRGB as is, so that clipping cannot alter it. */
export function isInSrgbGamut(color: Oklch): boolean {
  const { r, g, b } = oklchToLinearSrgb(color);
  return [r, g, b].every((channel) => channel >= -GAMUT_EPSILON && channel <= 1 + GAMUT_EPSILON);
}

/** OKLCH → gamma-encoded sRGB, clipped to the sRGB gamut channel by channel. */
export function oklchToSrgb(color: Oklch): Rgb {
  const { r, g, b } = oklchToLinearSrgb(color);
  return { r: encodeGamma(clip(r)), g: encodeGamma(clip(g)), b: encodeGamma(clip(b)) };
}

/** CSS hexadecimal notation of a gamma-encoded sRGB colour. */
export function srgbToHex({ r, g, b }: Rgb): string {
  const channel = (value: number): string =>
    Math.round(clip(value) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

/** WCAG relative luminance of a gamma-encoded sRGB colour. */
export function relativeLuminance({ r, g, b }: Rgb): number {
  return 0.2126 * decodeGamma(r) + 0.7152 * decodeGamma(g) + 0.0722 * decodeGamma(b);
}

/** WCAG contrast ratio between two colours, from 1 to 21, whatever their order. */
export function contrastRatio(first: Oklch, second: Oklch): number {
  const [lighter, darker] = [first, second]
    .map((color) => relativeLuminance(oklchToSrgb(color)))
    .sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}
