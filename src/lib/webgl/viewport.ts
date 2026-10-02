// Geometry of the hero surface (E1): the shader samples the photo exactly as the <img> shows it.

export interface Size {
  readonly width: number;
  readonly height: number;
}

/** CSS object-position, 0 to 1 from the left and from the top. */
export interface FocalPoint {
  readonly x: number;
  readonly y: number;
}

export interface CoverTransform {
  /** imageUv = screenUv × scale + offset, both in GL coordinates (0 to 1, y up). */
  readonly scale: readonly [number, number];
  readonly offset: readonly [number, number];
}

const CENTRE: FocalPoint = { x: 0.5, y: 0.5 };

/** The part of the image that `object-fit: cover` shows in the box. */
export function coverTransform(
  image: Size,
  box: Size,
  position: FocalPoint = CENTRE,
): CoverTransform {
  if (box.width <= 0 || box.height <= 0 || image.width <= 0 || image.height <= 0) {
    return { scale: [1, 1], offset: [0, 0] };
  }
  const ratio = box.width / box.height / (image.width / image.height);
  const sx = Math.min(1, ratio);
  const sy = Math.min(1, 1 / ratio);
  const fromTop = (1 - sy) * position.y;
  return { scale: [sx, sy], offset: [(1 - sx) * position.x, 1 - sy - fromTop] };
}

const MAX_DPR = 1.5;
const MOBILE_RESOLUTION = 0.75;

/** Pixel ratio of the canvas: at most 1.5, and 3/4 of it on phones. */
export function surfaceDpr(deviceDpr: number, mobile: boolean): number {
  const dpr = Number.isFinite(deviceDpr) && deviceDpr > 0 ? Math.min(deviceDpr, MAX_DPR) : 1;
  return mobile ? dpr * MOBILE_RESOLUTION : dpr;
}

const percent = (token: string | undefined): number | undefined => {
  const match = /^(-?\d+(?:\.\d+)?)%$/.exec(token ?? '');
  return match === null ? undefined : Number(match[1]) / 100;
};

/** A computed `object-position` (« 50% 60% »); anything but percentages reads as centred. */
export function parseObjectPosition(value: string): FocalPoint {
  const [x, y] = value.trim().split(/\s+/);
  return { x: percent(x) ?? CENTRE.x, y: percent(y) ?? CENTRE.y };
}
