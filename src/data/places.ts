// The three dive sites, in the order of the Rhône: Sion, then Martigny (Rosel), then Lake Geneva.
import type { Coordinates } from '../lib/format.ts';
import type { Localized } from '../i18n/types.ts';

export interface PlaceFacts {
  /** Metres. */
  readonly maxDepth: number;
  /** °C at the surface and at the bottom, in summer and in winter. */
  readonly temperatures: {
    readonly summer: { readonly surface: number; readonly bottom: number };
    readonly winter: { readonly surface: number; readonly bottom: number };
  };
  readonly visibility: Localized;
  readonly access: Localized;
  readonly level: Localized;
  readonly season: Localized;
}

export interface Place {
  readonly id: string;
  readonly name: Localized;
  /** Town or shore, shown under the name. */
  readonly area: Localized;
  /** Decimal degrees, rounded to the minute like the labels of the current site. */
  readonly coords: Coordinates;
  readonly description: Localized;
  readonly photo: { readonly file: string; readonly alt: Localized };
  /** Data of the site (I-03); `null` until Nicholas provides it. */
  readonly facts: PlaceFacts | null;
}

export const PLACES = [
  {
    id: 'sion',
    name: { fr: 'Les Îles', en: 'Les Îles' },
    area: { fr: 'Sion', en: 'Sion' },
    coords: { lat: 46.2333, lng: 7.3667 },
    description: {
      fr: "Le site fétiche pour les plongées d'entraînement — accès simple, conditions prévisibles toute l'année.",
      en: 'My go-to site for training dives — easy access, predictable conditions year-round.',
    },
    photo: {
      file: 'dive_sion.jpg',
      alt: {
        fr: "Le plan d'eau des Îles, à Sion, au coucher du soleil.",
        en: 'The lake at Les Îles, in Sion, at sunset.',
      },
    },
    facts: null, // TODO(I-03)
  },
  {
    id: 'rosel',
    name: { fr: 'Lac du Rosel', en: 'Lac du Rosel' },
    area: { fr: 'Martigny', en: 'Martigny' },
    coords: { lat: 46.0833, lng: 7.0667 },
    description: {
      fr: "À deux pas de Martigny, un plan d'eau clair, calme, et parfaitement adapté à la formation initiale.",
      en: 'A short drive from Martigny — clear, calm, and perfectly suited to initial training.',
    },
    photo: {
      file: 'dive_rosel.jpg',
      alt: {
        fr: 'Du matériel de plongée posé sur la rive du lac du Rosel.',
        en: 'Dive gear laid out on the shore of Lac du Rosel.',
      },
    },
    facts: null, // TODO(I-03)
  },
  {
    id: 'leman',
    name: { fr: 'Léman', en: 'Lake Geneva' },
    area: { fr: 'Rive sud-est', en: 'South-east shore' },
    coords: { lat: 46.4, lng: 6.8333 },
    description: {
      fr: 'Le grand bleu alpin. Des plongées plus profondes, des parois, des épaves, et ce silence unique des grands lacs.',
      en: 'The great alpine blue. Deeper dives, walls, wrecks — and the unique silence of large lakes.',
    },
    photo: {
      file: 'dive_leman.jpg',
      alt: {
        fr: 'Le château de Chillon, au bord du Léman.',
        en: 'Chillon Castle, on the shore of Lake Geneva.',
      },
    },
    facts: null, // TODO(I-03)
  },
] as const satisfies readonly Place[];

export type PlaceId = (typeof PLACES)[number]['id'];
