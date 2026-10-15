import { describe, expect, it } from 'vitest';
import { getActiveSpotlight, SPOTLIGHTS } from './season.ts';

describe('season spotlight', () => {
  it('selects baptism during summer months (May through September)', () => {
    // Month 4 is May, Month 8 is September
    expect(getActiveSpotlight(undefined, new Date('2026-05-01'))).toBe(SPOTLIGHTS.baptism);
    expect(getActiveSpotlight(undefined, new Date('2026-07-15'))).toBe(SPOTLIGHTS.baptism);
    expect(getActiveSpotlight(undefined, new Date('2026-09-30'))).toBe(SPOTLIGHTS.baptism);
  });

  it('selects dry suit during autumn/winter/spring months (October through April)', () => {
    expect(getActiveSpotlight(undefined, new Date('2026-10-01'))).toBe(SPOTLIGHTS.drysuit);
    expect(getActiveSpotlight(undefined, new Date('2026-12-25'))).toBe(SPOTLIGHTS.drysuit);
    expect(getActiveSpotlight(undefined, new Date('2026-01-15'))).toBe(SPOTLIGHTS.drysuit);
    expect(getActiveSpotlight(undefined, new Date('2026-04-30'))).toBe(SPOTLIGHTS.drysuit);
  });

  it('allows explicit override', () => {
    expect(getActiveSpotlight('baptism', new Date('2026-12-25'))).toBe(SPOTLIGHTS.baptism);
    expect(getActiveSpotlight('drysuit', new Date('2026-07-15'))).toBe(SPOTLIGHTS.drysuit);
  });
});
