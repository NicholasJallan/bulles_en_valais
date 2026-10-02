import { describe, expect, it } from 'vitest';
import { consentState, isAnyGranted } from './consent-mode.ts';

describe('consentState', () => {
  it('denies everything when only the necessary cookies are accepted', () => {
    expect(consentState(['necessary'])).toEqual({
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    });
  });

  it('grants analytics_storage for the analytics category only', () => {
    expect(consentState(['necessary', 'analytics'])).toEqual({
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'granted',
    });
  });

  it('grants the three advertising signals for the marketing category', () => {
    expect(consentState(['marketing'])).toEqual({
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'denied',
    });
  });

  it('ignores unknown categories', () => {
    expect(isAnyGranted(consentState(['necessary', 'functional']))).toBe(false);
  });
});

describe('isAnyGranted', () => {
  it('is true as soon as one signal is granted', () => {
    expect(isAnyGranted(consentState(['analytics']))).toBe(true);
    expect(isAnyGranted(consentState([]))).toBe(false);
  });
});
