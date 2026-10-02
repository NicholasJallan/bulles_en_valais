import { describe, expect, it } from 'vitest';
import { TEMPERATURE_PROFILE, temperatureAt } from './temperature.ts';

describe('temperatureAt (I-05: 21 °C at the surface, 8 °C at the bottom)', () => {
  it('reads the table at its depths', () => {
    for (const [depth, celsius] of TEMPERATURE_PROFILE) expect(temperatureAt(depth)).toBe(celsius);
  });

  it('interpolates between two depths of the table', () => {
    expect(temperatureAt(2.5)).toBeCloseTo(20.5);
    expect(temperatureAt(12.5)).toBeCloseTo(13.5);
  });

  it('drops sharply through the thermocline (10 to 15 m)', () => {
    expect(temperatureAt(10) - temperatureAt(15)).toBeGreaterThanOrEqual(5);
  });

  it('holds the bottom temperature below the table and the surface one above it', () => {
    expect(temperatureAt(120)).toBe(8);
    expect(temperatureAt(-1)).toBe(21);
  });

  it('never warms up on the way down', () => {
    for (let depth = 0; depth < 60; depth += 0.5) {
      expect(temperatureAt(depth + 0.5)).toBeLessThanOrEqual(temperatureAt(depth));
    }
  });

  it('refuses a depth that is not a number', () => {
    expect(() => temperatureAt(Number.NaN)).toThrow(RangeError);
  });
});
