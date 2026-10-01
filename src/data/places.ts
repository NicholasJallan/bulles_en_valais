// The three dive sites, in the order of the Rhône: Sion, then Martigny (Rosel), then Lake Geneva.
import type { Coordinates } from '../lib/format.ts';
import type { Localized } from '../i18n/types.ts';

export interface PlaceFacts {
  /** Maximum depth of the lake, in metres (I-03). */
  readonly maxDepth: number;
  /** A few of its dive sites, when it has several. */
  readonly sites?: readonly Localized[];
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
  readonly facts: PlaceFacts;
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
    facts: { maxDepth: 38 },
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
    facts: { maxDepth: 23 },
  },
  {
    id: 'leman',
    name: { fr: 'Léman', en: 'Lake Geneva' },
    area: { fr: 'De Rivaz à Hermance', en: 'From Rivaz to Hermance' },
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
    facts: {
      maxDepth: 300,
      sites: [
        { fr: 'Rivaz Gare', en: 'Rivaz Gare' },
        { fr: 'Château de Chillon', en: 'Chillon Castle' },
        { fr: 'Bikini', en: 'Bikini' },
        { fr: 'Hermance', en: 'Hermance' },
        { fr: 'Tougues', en: 'Tougues' },
      ],
    },
  },
] as const satisfies readonly Place[];

export type PlaceId = (typeof PLACES)[number]['id'];
