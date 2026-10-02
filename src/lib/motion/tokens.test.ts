import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { customProperties } from '../css/custom-properties.ts';
import { DURATIONS_MS, EASINGS, STAGGER_MS, cssCubicBezier, seconds } from './tokens.ts';

const ROOT = customProperties(
  readFileSync(new URL('../../styles/tokens.css', import.meta.url), 'utf8'),
  ':root',
);

const declaredWith = (prefix: string): Map<string, string> =>
  new Map([...ROOT].filter(([name]) => name.startsWith(prefix)));

describe('motion tokens', () => {
  it('keep the values of the art direction (01-direction-artistique.md §3)', () => {
    expect(DURATIONS_MS).toMatchObject({
      instant: 120,
      fast: 240,
      base: 480,
      slow: 900,
      drift: 1400,
      tide: 2400,
    });
    expect(EASINGS).toEqual({
      buoyant: [0.16, 1, 0.3, 1],
      surface: [0.22, 1, 0.36, 1],
      drift: [0.45, 0, 0.55, 1],
      sink: [0.55, 0, 0.75, 0.2],
    });
  });

  it('give the neutral-buoyancy titles (E5) their 1.1 s rise and 0.08 s stagger', () => {
    expect(DURATIONS_MS.rise).toBe(1100);
    expect(STAGGER_MS.line).toBe(80);
  });

  it('convert milliseconds to the seconds GSAP expects', () => {
    expect(seconds(DURATIONS_MS.rise)).toBe(1.1);
    expect(seconds(STAGGER_MS.line)).toBe(0.08);
  });

  it('write easings in the CSS notation', () => {
    expect(cssCubicBezier(EASINGS.sink)).toBe('cubic-bezier(0.55, 0, 0.75, 0.2)');
  });
});

describe('tokens.css', () => {
  it('declares every duration of the TypeScript mirror, and only those', () => {
    const expected = Object.entries(DURATIONS_MS).map(([name, ms]): [string, string] => [
      `--dur-${name}`,
      `${ms}ms`,
    ]);
    expect(declaredWith('--dur-')).toEqual(new Map(expected));
  });

  it('declares every easing of the TypeScript mirror, and only those', () => {
    const expected = Object.entries(EASINGS).map(([name, curve]): [string, string] => [
      `--ease-${name}`,
      cssCubicBezier(curve),
    ]);
    expect(declaredWith('--ease-')).toEqual(new Map(expected));
  });

  it('declares every stagger of the TypeScript mirror, and only those', () => {
    const expected = Object.entries(STAGGER_MS).map(([name, ms]): [string, string] => [
      `--stagger-${name}`,
      `${ms}ms`,
    ]);
    expect(declaredWith('--stagger-')).toEqual(new Map(expected));
  });
});
