import type { RouteId } from '../i18n/routes.ts';
import type { Localized } from '../i18n/types.ts';

export type SeasonalKey = 'baptism' | 'drysuit';

export interface SeasonalSpotlight {
  readonly id: SeasonalKey;
  readonly route: RouteId;
  /** Months it is shown, 0 = January (Date#getMonth); every month belongs to one spotlight. */
  readonly months: readonly number[];
  readonly badge: Localized;
  readonly title: Localized;
  readonly cta: Localized;
}

export const SPOTLIGHTS: Readonly<Record<SeasonalKey, SeasonalSpotlight>> = {
  drysuit: {
    id: 'drysuit',
    route: 'drysuit',
    months: [0, 1, 2, 3, 9, 10, 11],
    badge: {
      fr: 'Saison froide · octobre à avril',
      en: 'Cold season · October to April',
    },
    title: {
      fr: "Plongez au chaud toute l'année avec la combinaison étanche",
      en: 'Dive warm year-round with the dry suit specialty',
    },
    cta: {
      fr: 'Découvrir la formation Étanche',
      en: 'Explore the Dry Suit course',
    },
  },
  baptism: {
    id: 'baptism',
    route: 'baptism',
    months: [4, 5, 6, 7, 8],
    badge: {
      fr: 'Belle saison · mai à septembre',
      en: 'Warm season · May to September',
    },
    title: {
      fr: 'Votre premier baptême de plongée en lac alpin dès {price:padi-dsd}',
      en: 'Your first try-dive in an alpine lake from {price:padi-dsd}',
    },
    cta: {
      fr: 'Découvrir le baptême',
      en: 'Explore try-dives',
    },
  },
};

/** Every spotlight, in the order the hero renders them (the page then shows one by month). */
export const SPOTLIGHT_LIST: readonly SeasonalSpotlight[] = Object.values(SPOTLIGHTS);

/**
 * The spotlight of a date's month (`months`), unless overridden. The hero renders them all and
 * picks the visible one in the browser (boot.js sets html[data-month]); this choice, made at build
 * time, is the one shown without JavaScript.
 */
export function getActiveSpotlight(
  override?: SeasonalKey,
  date: Date = new Date(),
): SeasonalSpotlight {
  if (override !== undefined) {
    return SPOTLIGHTS[override];
  }
  const month = date.getMonth();
  const spotlight = SPOTLIGHT_LIST.find((entry) => entry.months.includes(month));
  if (spotlight === undefined) throw new Error(`No seasonal spotlight for month ${month}`);
  return spotlight;
}
