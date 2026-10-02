import { describe, expect, it } from 'vitest';
import { cascadeStagger } from './cascade.ts';

describe('cascadeStagger', () => {
  it('keeps the usual step when the cascade fits in the time allowed', () => {
    expect(cascadeStagger({ count: 3, step: 40, duration: 240, total: 600 })).toBe(40);
  });

  it('tightens the step so that the last item has settled within the total', () => {
    const step = cascadeStagger({ count: 10, step: 40, duration: 240, total: 600 });
    expect(step).toBeCloseTo(40);
    const long = cascadeStagger({ count: 31, step: 40, duration: 240, total: 600 });
    expect(long).toBeCloseTo(12);
    expect(240 + 30 * long).toBeCloseTo(600);
  });

  it('is 0 for a single item, or when the duration alone fills the total', () => {
    expect(cascadeStagger({ count: 1, step: 40, duration: 240, total: 600 })).toBe(0);
    expect(cascadeStagger({ count: 5, step: 40, duration: 700, total: 600 })).toBe(0);
  });
});
