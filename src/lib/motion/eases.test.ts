import { describe, expect, it, vi } from 'vitest';
import { easePath, registerEases } from './eases.ts';
import { EASINGS } from './tokens.ts';

describe('easePath', () => {
  it('turns a cubic-bezier into the SVG path CustomEase reads', () => {
    expect(easePath([0.16, 1, 0.3, 1])).toBe('M0,0 C0.16,1 0.3,1 1,1');
  });
});

describe('registerEases', () => {
  it('declares each easing once, under its token name', () => {
    const create = vi.fn();
    registerEases({ create });
    expect(create.mock.calls).toEqual(
      Object.entries(EASINGS).map(([name, curve]) => [name, easePath(curve)]),
    );
  });
});
