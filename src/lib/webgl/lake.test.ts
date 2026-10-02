import { describe, expect, it } from 'vitest';
import {
  LAKE_VIEW,
  WIND_WAVELENGTHS_M,
  groupSpeed,
  imageToWater,
  lakeUniforms,
  maskAt,
  phaseSpeed,
  pointerToWater,
  waterToImage,
  windUniforms,
} from './lake.ts';

// Image UV in GL coordinates (y up), from a position measured on the photo (from the top).
const fromTop = (x: number, y: number) => ({ x, y: 1 - y });

describe('the Lac du Rosel seen from the hero photo', () => {
  it('sees no water above the horizon, nor exactly on it', () => {
    expect(imageToWater(fromTop(0.5, 0.42))).toBeUndefined();
    expect(imageToWater(fromTop(0.5, LAKE_VIEW.horizon))).toBeUndefined();
  });

  it('puts the far shore 140 to 220 m ahead, nearer on the left (swisstopo orthophoto)', () => {
    // Waterline measured on the photo; depths measured on SWISSIMAGE from the camera: 138, 214, 197 m.
    const left = imageToWater(fromTop(0.025, 0.455));
    const centre = imageToWater(fromTop(0.5, 0.4455));
    const right = imageToWater(fromTop(0.83, 0.441));
    expect(left?.z).toBeGreaterThan(120);
    expect(left?.z).toBeLessThan(160);
    expect(centre?.z).toBeGreaterThan(185);
    expect(centre?.z).toBeLessThan(245);
    expect(right?.z).toBeGreaterThan(170);
    expect(right?.z).toBeLessThan(225);
  });

  it('finds the rock of the foreground about 3 m away and half a metre wide', () => {
    const leftEdge = imageToWater(fromTop(0.5, 0.9));
    const rightEdge = imageToWater(fromTop(0.62, 0.9));
    expect(leftEdge?.z).toBeGreaterThan(2.5);
    expect(leftEdge?.z).toBeLessThan(3.5);
    const width = (rightEdge?.x ?? 0) - (leftEdge?.x ?? 0);
    expect(width).toBeGreaterThan(0.35);
    expect(width).toBeLessThan(0.7);
  });

  it('rolls with the photo: the horizon sits higher on the right', () => {
    expect(imageToWater(fromTop(0.99, 0.437))).toBeDefined();
    expect(imageToWater(fromTop(0.01, 0.437))).toBeUndefined();
  });

  it('looks down more steeply at the near water: grazing angle from 30° to almost 0°', () => {
    const near = imageToWater(fromTop(0.5, 1));
    const far = imageToWater(fromTop(0.5, 0.45));
    expect(near?.grazing).toBeGreaterThan(0.45);
    expect(far?.grazing).toBeLessThan(0.02);
  });

  it('projects a point of the water back where it was seen', () => {
    for (const [x, y] of [
      [0.1, 0.95],
      [0.5, 0.6],
      [0.9, 0.47],
    ] as const) {
      const water = imageToWater(fromTop(x, y));
      expect(water).toBeDefined();
      const back = waterToImage(water ?? { x: 0, z: 0 });
      expect(back?.x).toBeCloseTo(x, 6);
      expect(back?.y).toBeCloseTo(1 - y, 6);
    }
  });

  it('has no image for a point behind the camera', () => {
    expect(waterToImage({ x: 0, z: -2 })).toBeUndefined();
  });

  it('hands the camera to the shader', () => {
    const { lens, camera } = lakeUniforms();
    expect(lens[0]).toBeCloseTo(4080 / 3072, 6);
    expect(lens[1]).toBe(LAKE_VIEW.focal);
    expect(lens[2]).toBe(LAKE_VIEW.roll);
    expect(camera[0]).toBe(LAKE_VIEW.height);
    // sin² + cos² of the pitch
    expect((camera[1] ?? 0) ** 2 + (camera[2] ?? 0) ** 2).toBeCloseTo(1, 9);
  });
});

describe('waves on the water (dispersion of gravity-capillary waves)', () => {
  it('moves a 12 cm ripple at about 0.44 m/s, its rings at half that', () => {
    expect(phaseSpeed(0.12)).toBeCloseTo(0.437, 2);
    expect(groupSpeed(0.12)).toBeCloseTo(0.227, 2);
  });

  it('carries long waves at half their phase speed, and capillaries faster than their crests', () => {
    expect(groupSpeed(5) / phaseSpeed(5)).toBeCloseTo(0.5, 2);
    expect(groupSpeed(0.005)).toBeGreaterThan(phaseSpeed(0.005));
  });
});

describe('windUniforms (wind ripples, uWindWaves and uWindDrift)', () => {
  it('drifts each octave at the speed of its crests, longest first', () => {
    const { wavelengths, drift } = windUniforms();
    expect(wavelengths).toEqual([...WIND_WAVELENGTHS_M]);
    expect(drift).toEqual(WIND_WAVELENGTHS_M.map(phaseSpeed));
    expect(drift[0]).toBeGreaterThan(drift[1] ?? 0);
  });
});

describe('pointerToWater (a ring where the pointer shows the lake)', () => {
  // 1 × 2 mask: water in the bottom row only.
  const mask = {
    width: 1,
    height: 2,
    data: Uint8ClampedArray.from([0, 0, 0, 255, 255, 255, 255, 255]),
  };
  const box = { left: 100, top: 50, width: 400, height: 300 };
  const whole = { scale: [1, 1], offset: [0, 0] } as const;

  it('finds the point of the lake under the pointer, the screen y pointing down', () => {
    const water = pointerToWater({ x: 300, y: 50 + 300 * 0.9 }, box, whole, mask);
    expect(water).toEqual(imageToWater(fromTop(0.5, 0.9)));
  });

  it('follows the cropping of the photo (object-fit: cover)', () => {
    const cropped = { scale: [0.5, 0.5], offset: [0.25, 0] } as const;
    // The bottom of the box shows the bottom of the image, half as wide, centred.
    const water = pointerToWater({ x: 300, y: 350 }, box, cropped, mask);
    expect(water).toEqual(imageToWater({ x: 0.5, y: 0 }));
  });

  it('makes no ring on land, above the horizon, past the far shore or in an empty box', () => {
    expect(pointerToWater({ x: 300, y: 80 }, box, whole, mask)).toBeUndefined();
    const allWater = { width: 1, height: 1, data: Uint8ClampedArray.from([255, 255, 255, 255]) };
    expect(pointerToWater({ x: 300, y: 50 + 300 * 0.3 }, box, whole, allWater)).toBeUndefined();
    expect(pointerToWater({ x: 300, y: 50 + 300 * 0.4395 }, box, whole, allWater)).toBeUndefined();
    const empty = { ...box, width: 0 };
    expect(pointerToWater({ x: 300, y: 300 }, empty, whole, allWater)).toBeUndefined();
  });
});

describe('maskAt (the water mask read on the CPU)', () => {
  // 2 × 2 grey image, rows from the top: [0, 255] / [128, 0], one byte per channel (RGBA).
  const mask = {
    width: 2,
    height: 2,
    data: Uint8ClampedArray.from([
      0, 0, 0, 255, 255, 255, 255, 255, 128, 128, 128, 255, 0, 0, 0, 255,
    ]),
  };

  it('reads the nearest pixel, in GL coordinates (y up)', () => {
    expect(maskAt(mask, { x: 0.75, y: 0.75 })).toBe(1);
    expect(maskAt(mask, { x: 0.25, y: 0.25 })).toBeCloseTo(128 / 255, 6);
    expect(maskAt(mask, { x: 0.25, y: 0.75 })).toBe(0);
  });

  it('reads nothing outside the image', () => {
    expect(maskAt(mask, { x: -0.1, y: 0.5 })).toBe(0);
    expect(maskAt(mask, { x: 0.5, y: 1.2 })).toBe(0);
  });
});
