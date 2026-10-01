import { describe, expect, it } from 'vitest';
import {
  formatCHF,
  formatCoordinates,
  formatDepth,
  formatDepthMarker,
  formatDuration,
  formatTemperature,
} from './format.ts';

const NBSP = '\u00a0';

describe('formatCHF', () => {
  it('puts the currency first, joined by a no-break space', () => {
    expect(formatCHF(690, 'fr')).toBe(`CHF${NBSP}690`);
    expect(formatCHF(90, 'en')).toBe(`CHF${NBSP}90`);
  });

  it('does not group four-digit amounts, like the current price lists', () => {
    expect(formatCHF(1090, 'fr')).toBe(`CHF${NBSP}1090`);
    expect(formatCHF(1090, 'en')).toBe(`CHF${NBSP}1090`);
  });

  // The separator itself comes from the CLDR data of the runtime (fr-CH: an apostrophe today).
  it('groups the thousands of five-digit amounts', () => {
    expect(formatCHF(12500, 'fr')).toMatch(new RegExp(`^CHF${NBSP}12\\D500$`));
    expect(formatCHF(12500, 'en')).toBe(`CHF${NBSP}12,500`);
  });

  it.each([0, -90, 89.5, Number.NaN, Number.POSITIVE_INFINITY])('rejects %s', (amount) => {
    expect(() => formatCHF(amount, 'fr')).toThrow(RangeError);
  });
});

describe('formatDepth', () => {
  it('writes whole metres by default', () => {
    expect(formatDepth(18, 'fr')).toBe(`18${NBSP}m`);
    expect(formatDepth(0, 'en')).toBe(`0${NBSP}m`);
  });

  it('uses the decimal separator of the locale', () => {
    expect(formatDepth(12.43, 'fr', 1)).toBe(`12,4${NBSP}m`);
    expect(formatDepth(12.43, 'en', 1)).toBe(`12.4${NBSP}m`);
  });

  it('keeps the requested number of decimals', () => {
    expect(formatDepth(5, 'fr', 1)).toBe(`5,0${NBSP}m`);
  });

  it('never writes a negative zero', () => {
    expect(formatDepth(-0, 'fr', 1)).toBe(`0,0${NBSP}m`);
  });

  it.each([-0.5, Number.NaN])('rejects %s', (metres) => {
    expect(() => formatDepth(metres, 'fr')).toThrow(RangeError);
  });

  it('rejects an invalid number of decimals', () => {
    expect(() => formatDepth(5, 'fr', -1)).toThrow(RangeError);
    expect(() => formatDepth(5, 'fr', 1.5)).toThrow(RangeError);
  });
});

describe('formatDepthMarker', () => {
  it('pads the depth to two digits, as on a dive computer', () => {
    expect(formatDepthMarker(5)).toBe(`05${NBSP}m`);
    expect(formatDepthMarker(0)).toBe(`00${NBSP}m`);
    expect(formatDepthMarker(40)).toBe(`40${NBSP}m`);
    expect(formatDepthMarker(120)).toBe(`120${NBSP}m`);
  });

  it.each([-5, 2.5, Number.NaN])('rejects %s', (metres) => {
    expect(() => formatDepthMarker(metres)).toThrow(RangeError);
  });
});

describe('formatTemperature', () => {
  it('writes degrees Celsius after a no-break space', () => {
    expect(formatTemperature(18, 'fr')).toBe(`18${NBSP}°C`);
    expect(formatTemperature(6, 'en')).toBe(`6${NBSP}°C`);
  });

  it('rounds to the nearest degree', () => {
    expect(formatTemperature(10.6, 'fr')).toBe(`11${NBSP}°C`);
  });

  it('writes negative temperatures with a minus sign', () => {
    expect(formatTemperature(-2, 'fr')).toBe(`−2${NBSP}°C`);
  });

  it('rejects a value that is not a number', () => {
    expect(() => formatTemperature(Number.NaN, 'fr')).toThrow(RangeError);
  });
});

describe('formatCoordinates', () => {
  it('writes degrees and whole minutes, like the current site', () => {
    expect(formatCoordinates({ lat: 46.0833, lng: 7.0667 }, 'fr')).toBe('46°05′N · 7°04′E');
    expect(formatCoordinates({ lat: 46.2333, lng: 7.3667 }, 'en')).toBe('46°14′N · 7°22′E');
    expect(formatCoordinates({ lat: 46.4, lng: 6.8333 }, 'fr')).toBe('46°24′N · 6°50′E');
  });

  it('carries 60 rounded minutes over to the next degree', () => {
    expect(formatCoordinates({ lat: 45.9999, lng: 7.9999 }, 'fr')).toBe('46°00′N · 8°00′E');
  });

  it('uses the hemisphere letters of the locale', () => {
    expect(formatCoordinates({ lat: -33.5, lng: -70.25 }, 'fr')).toBe('33°30′S · 70°15′O');
    expect(formatCoordinates({ lat: -33.5, lng: -70.25 }, 'en')).toBe('33°30′S · 70°15′W');
  });

  it.each([
    { lat: 91, lng: 0 },
    { lat: 0, lng: -181 },
    { lat: Number.NaN, lng: 0 },
  ])('rejects %o', (coords) => {
    expect(() => formatCoordinates(coords, 'fr')).toThrow(RangeError);
  });
});

describe('formatDuration', () => {
  it('writes minutes and seconds as mm:ss', () => {
    expect(formatDuration(180)).toBe('03:00');
    expect(formatDuration(5)).toBe('00:05');
    expect(formatDuration(0)).toBe('00:00');
  });

  it('drops the fraction of a second', () => {
    expect(formatDuration(59.9)).toBe('00:59');
  });

  it('keeps counting minutes past the hour, like a dive computer', () => {
    expect(formatDuration(3690)).toBe('61:30');
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])('rejects %s', (seconds) => {
    expect(() => formatDuration(seconds)).toThrow(RangeError);
  });
});
