// @ts-check
// Water mask of the hero (effect E1): a grayscale image, white where the shader may ripple the water.
// Polygons are hand-tuned on the hero, in normalised coordinates (0 to 1, origin top left). Points on
// the frame may overshoot it by up to MARGIN, so that the feather does not darken the borders.

/** @typedef {readonly (readonly [number, number])[]} Polygon */

/**
 * @param {number} sourceWidth
 * @param {number} sourceHeight
 * @param {number} width
 */
export function maskSize(sourceWidth, sourceHeight, width) {
  if (!(sourceWidth > 0 && sourceHeight > 0 && width > 0))
    throw new Error('mask sizes must be positive');
  return { width, height: Math.round((width * sourceHeight) / sourceWidth) };
}

export const MARGIN = 0.05;

/** @param {number} value */
const round = (value) => Math.round(value * 10) / 10;

/**
 * @param {Polygon} points
 * @param {number} width
 * @param {number} height
 */
export function polygonPath(points, width, height) {
  if (points.length < 3) throw new Error('a polygon needs at least three points');
  const inside = (/** @type {number} */ v) => Number.isFinite(v) && v >= -MARGIN && v <= 1 + MARGIN;
  const bad = points.find(([x, y]) => !inside(x) || !inside(y));
  if (bad) throw new Error(`point ${bad.join(', ')} is outside the image`);
  const commands = points.map(
    ([x, y], i) => `${i === 0 ? 'M' : 'L'}${round(x * width)} ${round(y * height)}`,
  );
  return `${commands.join('')}Z`;
}

/**
 * The canvas extends `pad` pixels around the mask, so that the blur is not clipped by the frame:
 * crop the rendered image by `pad` on each side.
 * @param {{ width: number, height: number, water: Polygon, holes?: readonly Polygon[], feather: number, pad?: number }} options
 */
export function waterMaskSvg({ width, height, water, holes = [], feather, pad = 0 }) {
  const d = [water, ...holes].map((polygon) => polygonPath(polygon, width, height)).join('');
  const blur =
    feather > 0
      ? `<defs><filter id="f" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${feather}"/></filter></defs>`
      : '';
  const filter = feather > 0 ? ' filter="url(#f)"' : '';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width + 2 * pad}" height="${height + 2 * pad}" ` +
    `viewBox="${-pad} ${-pad} ${width + 2 * pad} ${height + 2 * pad}">` +
    `${blur}<rect x="${-pad}" y="${-pad}" width="${width + 2 * pad}" height="${height + 2 * pad}" fill="#000"/>` +
    `<path d="${d}" fill="#fff" fill-rule="evenodd"${filter}/></svg>`
  );
}
