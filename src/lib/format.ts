// Formatting of the figures shown on the site: prices, depths, temperatures, coordinates, durations.
import { LANG_TAGS, type Locale } from '../i18n/types.ts';

const NO_BREAK_SPACE = '\u00a0';
const MINUS_SIGN = '\u2212';
const DEGREE = '°';
const PRIME = '′';

/** One formatter per locale and number of decimals: the HUD formats a depth on every frame. */
const numberFormats = new Map<string, Intl.NumberFormat>();

function numberFormat(locale: Locale, decimals: number): Intl.NumberFormat {
  const key = `${locale}:${decimals}`;
  const cached = numberFormats.get(key);
  if (cached !== undefined) return cached;
  const created = new Intl.NumberFormat(LANG_TAGS[locale], {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    // French typography groups thousands from five digits on: « CHF 1090 », as on the price lists.
    useGrouping: 'min2',
  });
  numberFormats.set(key, created);
  return created;
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

/** « CHF 690 »: whole francs, currency first, as on the price lists. */
export function formatCHF(amount: number, locale: Locale): string {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new RangeError(`A price is a positive whole number of francs, got ${amount}`);
  }
  return `CHF${NO_BREAK_SPACE}${numberFormat(locale, 0).format(amount)}`;
}

/** « 12,4 m » in French, « 12.4 m » in English. */
export function formatDepth(metres: number, locale: Locale, decimals = 0): string {
  if (!(metres >= 0)) throw new RangeError(`A depth is a number of metres ≥ 0, got ${metres}`);
  if (!Number.isInteger(decimals) || decimals < 0) {
    throw new RangeError(`Decimals must be a whole number ≥ 0, got ${decimals}`);
  }
  // + 0 turns -0 into 0, which Intl would print with a sign.
  return `${numberFormat(locale, decimals).format(metres + 0)}${NO_BREAK_SPACE}m`;
}

/** Depth marker of an eyebrow, padded like a dive computer: « 05 m ». */
export function formatDepthMarker(metres: number): string {
  if (!Number.isInteger(metres) || metres < 0) {
    throw new RangeError(`A depth marker is a whole number of metres ≥ 0, got ${metres}`);
  }
  return `${pad2(metres)}${NO_BREAK_SPACE}m`;
}

/** « 18 °C », rounded to the degree, with a true minus sign below zero. */
export function formatTemperature(celsius: number, locale: Locale): string {
  if (!Number.isFinite(celsius)) throw new RangeError(`A temperature is a number, got ${celsius}`);
  const rounded = Math.round(celsius) + 0;
  const sign = rounded < 0 ? MINUS_SIGN : '';
  return `${sign}${numberFormat(locale, 0).format(Math.abs(rounded))}${NO_BREAK_SPACE}${DEGREE}C`;
}

export interface Coordinates {
  /** Decimal degrees, north positive. */
  readonly lat: number;
  /** Decimal degrees, east positive. */
  readonly lng: number;
}

const HEMISPHERES: Readonly<Record<Locale, { readonly lat: string; readonly lng: string }>> = {
  fr: { lat: 'NS', lng: 'EO' },
  en: { lat: 'NS', lng: 'EW' },
};

/** « 46°05′N »: degrees and whole minutes, rounded, then the hemisphere letter. */
function formatAngle(value: number, max: number, letters: string): string {
  if (!(Math.abs(value) <= max))
    throw new RangeError(`Expected an angle within ±${max}°, got ${value}`);
  const minutes = Math.round(Math.abs(value) * 60);
  const letter = value < 0 ? letters.charAt(1) : letters.charAt(0);
  return `${Math.floor(minutes / 60)}${DEGREE}${pad2(minutes % 60)}${PRIME}${letter}`;
}

/** « 46°05′N · 7°04′E », as on the current site (O for west in French). */
export function formatCoordinates(coords: Coordinates, locale: Locale): string {
  const letters = HEMISPHERES[locale];
  return `${formatAngle(coords.lat, 90, letters.lat)} · ${formatAngle(coords.lng, 180, letters.lng)}`;
}

/** Dive time « mm:ss »: minutes keep counting past the hour, as on a dive computer. */
export function formatDuration(seconds: number): string {
  if (!(seconds >= 0) || !Number.isFinite(seconds)) {
    throw new RangeError(`A duration is a finite number of seconds ≥ 0, got ${seconds}`);
  }
  const whole = Math.floor(seconds);
  return `${pad2(Math.floor(whole / 60))}:${pad2(whole % 60)}`;
}
