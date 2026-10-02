// The Lac du Rosel as the hero photo sees it (E1): a pinhole camera above a flat lake, so that the
// ripples live on the water in metres and reach the screen through the same perspective as the
// photo. Mirrored in shaders/lake.glsl (lakeAt).
//
// Calibration (02.10.2026): Pixel 8 Pro, main camera, 24 mm equivalent, full 4080 × 3072 frame
// (EXIF of src/assets/original/rosel_2.jpg). The far waterline measured on the photo was fitted to
// the depths of the far shore on the SWISSIMAGE orthophoto (swisstopo), ray by ray, for a lens
// 1.4 to 2.2 m above the water (standing on the shore): camera on the east shore at 46.12718 N,
// 7.06000 E (where Nicholas placed it on the map), looking west (279°), 1.45 m above the water,
// the photo rolled by 0.59°. The far shore lies 140 to 220 m ahead; the residual is about a pixel.

export interface LakeView {
  /** Width / height of the photo. */
  readonly aspect: number;
  /** Focal length, in image heights. */
  readonly focal: number;
  /** The horizon, in image heights from the top, at the centre of the photo. */
  readonly horizon: number;
  /** Slope of the horizon, y down: negative when it rises to the right, as on the photo. */
  readonly roll: number;
  /** Height of the lens above the water, in metres. */
  readonly height: number;
}

const FULL_FRAME_DIAGONAL_MM = Math.hypot(36, 24);
const EQUIVALENT_FOCAL_MM = 24;
const ASPECT = 4080 / 3072;

export const LAKE_VIEW: LakeView = {
  aspect: ASPECT,
  // The 35 mm equivalent refers to the diagonal: here, Math.hypot(ASPECT, 1) image heights.
  focal: EQUIVALENT_FOCAL_MM / (FULL_FRAME_DIAGONAL_MM / Math.hypot(ASPECT, 1)),
  horizon: 0.4391,
  roll: Math.tan((-0.59 * Math.PI) / 180),
  height: 1.45,
};

/** Image UV in GL coordinates: 0 to 1, y up (what the shader samples). */
export interface ImagePoint {
  readonly x: number;
  readonly y: number;
}

/** A point of the water, in metres: x to the right, z away from the camera. */
export interface WaterPoint {
  readonly x: number;
  readonly z: number;
}

export interface SeenWater extends WaterPoint {
  /** Sine of the angle between the line of sight and the water: 0 at the horizon. */
  readonly grazing: number;
}

interface Frame {
  readonly cosRoll: number;
  readonly sinRoll: number;
  readonly sinPitch: number;
  readonly cosPitch: number;
}

function frame(view: LakeView): Frame {
  const cosRoll = 1 / Math.hypot(1, view.roll);
  const sinRoll = view.roll * cosRoll;
  // Once the roll is undone, the horizon is a level line, above the centre: the camera looks down.
  const levelled = (view.horizon - 0.5) * cosRoll;
  const pitch = Math.atan2(-levelled, view.focal);
  return { cosRoll, sinRoll, sinPitch: Math.sin(pitch), cosPitch: Math.cos(pitch) };
}

const FRAME = frame(LAKE_VIEW);
/** Lines of sight closer to the horizon than this never meet the water (rounding errors). */
const GRAZING_EPSILON = 1e-9;

/** Where the line of sight through a point of the photo meets the water, if it does. */
export function imageToWater(point: ImagePoint, view: LakeView = LAKE_VIEW): SeenWater | undefined {
  const { cosRoll, sinRoll, sinPitch, cosPitch } = view === LAKE_VIEW ? FRAME : frame(view);
  const across = (point.x - 0.5) * view.aspect;
  const down = 0.5 - point.y;
  const x = (across * cosRoll + down * sinRoll) / view.focal;
  const y = (-across * sinRoll + down * cosRoll) / view.focal;
  const descent = y * cosPitch + sinPitch;
  if (descent <= GRAZING_EPSILON) return undefined;
  const reach = view.height / descent;
  return {
    x: x * reach,
    z: (cosPitch - y * sinPitch) * reach,
    grazing: descent / Math.hypot(x, y, 1),
  };
}

/** Where a point of the water shows on the photo; undefined behind the camera. */
export function waterToImage(
  water: WaterPoint,
  view: LakeView = LAKE_VIEW,
): ImagePoint | undefined {
  const { cosRoll, sinRoll, sinPitch, cosPitch } = view === LAKE_VIEW ? FRAME : frame(view);
  const forward = view.height * sinPitch + water.z * cosPitch;
  if (forward <= 0) return undefined;
  const up = -view.height * cosPitch + water.z * sinPitch;
  const x = (water.x / forward) * view.focal;
  const y = (-up / forward) * view.focal;
  const across = x * cosRoll - y * sinRoll;
  const down = x * sinRoll + y * cosRoll;
  return { x: across / view.aspect + 0.5, y: 0.5 - down };
}

/**
 * The camera for the shader: uLakeLens (aspect, focal, roll) and uLakeCamera (height, sine and
 * cosine of the pitch, which holds the horizon).
 */
export function lakeUniforms(view: LakeView = LAKE_VIEW): {
  readonly lens: [number, number, number];
  readonly camera: [number, number, number];
} {
  const { sinPitch, cosPitch } = frame(view);
  return {
    lens: [view.aspect, view.focal, view.roll],
    camera: [view.height, sinPitch, cosPitch],
  };
}

// Dispersion of waves on deep water: ω² = g k + (σ / ρ) k³.
const GRAVITY = 9.81;
/** Surface tension over density of water, m³/s². */
const TENSION = 0.0728 / 1000;

const wavenumber = (wavelength: number): number => (2 * Math.PI) / wavelength;

/** Speed of the crests, in m/s. */
export function phaseSpeed(wavelength: number): number {
  const k = wavenumber(wavelength);
  return Math.sqrt(GRAVITY / k + TENSION * k);
}

/** Speed of a group of waves (the ring itself), in m/s. */
export function groupSpeed(wavelength: number): number {
  const k = wavenumber(wavelength);
  const omega = Math.sqrt(GRAVITY * k + TENSION * k ** 3);
  return (GRAVITY + 3 * TENSION * k ** 2) / (2 * omega);
}

/**
 * Wind ripples, three octaves from the longest. The valley wind comes from the north-west, from
 * the front right of the camera: the ripples drift towards the camera and to the left.
 */
export const WIND_WAVELENGTHS_M = [2.4, 0.7, 0.22] as const;

/** uWindWaves (wavelengths, m) and uWindDrift (speed of their crests, m/s). */
export function windUniforms(): {
  readonly wavelengths: [number, number, number];
  readonly drift: [number, number, number];
} {
  const [long, mid, short] = WIND_WAVELENGTHS_M;
  return {
    wavelengths: [long, mid, short],
    drift: [phaseSpeed(long), phaseSpeed(mid), phaseSpeed(short)],
  };
}

/** Past the far shore (220 m at most): a ring there would be smaller than a pixel. */
const MAX_RING_REACH_M = 250;
/** Half the mask is water: the pointer must be over the lake to make a ring. */
const ON_WATER = 0.5;

export interface Box {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

/** object-fit: cover of the photo (viewport.ts coverTransform), in GL coordinates. */
export interface Cover {
  readonly scale: readonly [number, number];
  readonly offset: readonly [number, number];
}

/** The point of the lake under a pointer (CSS pixels, y down), or undefined off the water. */
export function pointerToWater(
  pointer: { readonly x: number; readonly y: number },
  box: Box,
  cover: Cover,
  mask: MaskPixels,
): SeenWater | undefined {
  if (box.width <= 0 || box.height <= 0) return undefined;
  const onImage = {
    x: ((pointer.x - box.left) / box.width) * cover.scale[0] + cover.offset[0],
    y: (1 - (pointer.y - box.top) / box.height) * cover.scale[1] + cover.offset[1],
  };
  if (maskAt(mask, onImage) < ON_WATER) return undefined;
  const water = imageToWater(onImage);
  return water !== undefined && water.z <= MAX_RING_REACH_M ? water : undefined;
}

/** RGBA pixels of the water mask (an ImageData). */
export interface MaskPixels {
  readonly width: number;
  readonly height: number;
  readonly data: Uint8ClampedArray;
}

/** The mask (0 to 1, red channel) at a point of the photo; 0 outside it. */
export function maskAt(mask: MaskPixels, point: ImagePoint): number {
  if (point.x < 0 || point.x > 1 || point.y < 0 || point.y > 1) return 0;
  const column = Math.min(mask.width - 1, Math.floor(point.x * mask.width));
  const row = Math.min(mask.height - 1, Math.floor((1 - point.y) * mask.height));
  return (mask.data[(row * mask.width + column) * 4] ?? 0) / 255;
}
