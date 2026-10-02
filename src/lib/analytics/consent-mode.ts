// Consent Mode v2 signals of the banner categories (02-architecture.md §12). public/js/
// consent-default.js applies the same mapping to the stored choice before the Google tag loads.

export const CONSENT_CATEGORIES = ['necessary', 'analytics', 'marketing'] as const;
export type ConsentCategory = (typeof CONSENT_CATEGORIES)[number];

type Signal = 'granted' | 'denied';

export interface ConsentState {
  readonly ad_storage: Signal;
  readonly ad_user_data: Signal;
  readonly ad_personalization: Signal;
  readonly analytics_storage: Signal;
}

const signal = (granted: boolean): Signal => (granted ? 'granted' : 'denied');

/** Signals for the accepted categories: analytics → analytics_storage, marketing → the ads ones. */
export function consentState(accepted: readonly string[]): ConsentState {
  const ads = signal(accepted.includes('marketing'));
  return {
    ad_storage: ads,
    ad_user_data: ads,
    ad_personalization: ads,
    analytics_storage: signal(accepted.includes('analytics')),
  };
}

export function isAnyGranted(state: ConsentState): boolean {
  return Object.values(state).includes('granted');
}
