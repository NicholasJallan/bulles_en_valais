import type { RouteId } from '../i18n/routes.ts';
import type { Localized } from '../i18n/types.ts';

export type SeasonalKey = 'baptism' | 'drysuit';

export interface SeasonalSpotlight {
  readonly id: SeasonalKey;
  readonly route: RouteId;
  readonly badge: Localized;
  readonly title: Localized;
  readonly cta: Localized;
}

export const SPOTLIGHTS: Readonly<Record<SeasonalKey, SeasonalSpotlight>> = {
  drysuit: {
    id: 'drysuit',
    route: 'drysuit',
    badge: {
      fr: '❄️ Saison Automne / Hiver',
      en: '❄️ Autumn / Winter Season',
    },
    title: {
      fr: 'Plongez au chaud toute l’année avec la combinaison étanche',
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
    badge: {
      fr: '☀️ Saison Printemps / Été',
      en: '☀️ Spring / Summer Season',
    },
    title: {
      fr: 'Votre premier baptême de plongée en lac alpin dès CHF 90',
      en: 'Your first try-dive in an alpine lake from CHF 90',
    },
    cta: {
      fr: 'Découvrir le baptême',
      en: 'Explore try-dives',
    },
  },
};

/**
 * Returns the active seasonal spotlight.
 * May to September (months 4-8) = Summer / Baptism
 * October to April = Winter / Dry Suit
 * Can be explicitly overridden with an override parameter.
 */
export function getActiveSpotlight(
  override?: SeasonalKey,
  date: Date = new Date(),
): SeasonalSpotlight {
  if (override !== undefined) {
    return SPOTLIGHTS[override];
  }
  const month = date.getMonth(); // 0: Jan ... 9: Oct, 11: Dec
  const isSummer = month >= 4 && month <= 8;
  return isSummer ? SPOTLIGHTS.baptism : SPOTLIGHTS.drysuit;
}
