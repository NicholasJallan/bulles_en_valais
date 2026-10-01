import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { customProperties } from '../css/custom-properties.ts';
import { WCAG_MIN, contrastRatio, isInSrgbGamut } from './contrast.ts';
import {
  COLORS,
  CONTRAST_PAIRS,
  ROLE_PROPERTIES,
  TONES,
  TONE_ROLES,
  colorProperty,
  formatOklch,
  type ColorName,
  type ToneRole,
} from './palette.ts';

const TOKENS_CSS = readFileSync(new URL('../../styles/tokens.css', import.meta.url), 'utf8');

describe('formatOklch', () => {
  it('writes the CSS notation, lightness in percent without float noise', () => {
    expect(formatOklch({ l: 0.975, c: 0.008, h: 85 })).toBe('oklch(97.5% 0.008 85)');
    expect(formatOklch({ l: 0.14, c: 0.03, h: 245 })).toBe('oklch(14% 0.03 245)');
  });
});

describe('palette', () => {
  it.each(Object.entries(COLORS))('%s is displayable in sRGB without clipping', (_, color) => {
    expect(isInSrgbGamut(color)).toBe(true);
  });

  describe.each(TONES)('tone %s', (tone) => {
    it.each(CONTRAST_PAIRS)('%s on %s meets the WCAG minimum for %s', (front, back, use) => {
      const roles = TONE_ROLES[tone];
      const ratio = contrastRatio(COLORS[roles[front]], COLORS[roles[back]]);
      expect(ratio).toBeGreaterThanOrEqual(WCAG_MIN[use]);
    });
  });
});

describe('tokens.css', () => {
  it('declares every raw colour of the palette, and nothing else under --c-*', () => {
    const declared = [...customProperties(TOKENS_CSS, ':root')].filter(([name]) =>
      name.startsWith('--c-'),
    );
    const expected = Object.entries(COLORS).map(([name, color]): [string, string] => [
      colorProperty(name as ColorName),
      formatOklch(color),
    ]);
    expect(new Map(declared)).toEqual(new Map(expected));
  });

  it.each(TONES)('maps the roles of the %s tone to the palette', (tone) => {
    const block = customProperties(TOKENS_CSS, `[data-tone='${tone}']`);
    const roles = Object.entries(TONE_ROLES[tone]) as Array<[ToneRole, ColorName]>;
    for (const [role, color] of roles) {
      expect(block.get(ROLE_PROPERTIES[role]), `${tone} ${role}`).toBe(
        `var(${colorProperty(color)})`,
      );
    }
  });

  it('makes the surface tone the default of the page', () => {
    const root = customProperties(TOKENS_CSS, ':root');
    expect(root.get(ROLE_PROPERTIES.bg)).toBe(`var(${colorProperty(TONE_ROLES.surface.bg)})`);
  });
});
