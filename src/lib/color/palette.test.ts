import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { customProperties } from '../css/custom-properties.ts';
import {
  WCAG_MIN,
  compositeOver,
  contrastRatio,
  contrastRatioRgb,
  isInSrgbGamut,
  oklchToSrgb,
} from './contrast.ts';
import {
  COLORS,
  CONTRAST_PAIRS,
  ROLE_PROPERTIES,
  TONES,
  TONE_ROLES,
  VEILS,
  VEIL_PAIRS,
  colorProperty,
  formatOklch,
  veilCss,
  veilProperty,
  type ColorName,
  type Tone,
  type ToneRole,
  type VeilName,
} from './palette.ts';

const SRC = new URL('../../', import.meta.url);
const TOKENS_CSS = readFileSync(new URL('styles/tokens.css', SRC), 'utf8');

/** Every stylesheet and component of src/, as [path, text]. */
const STYLE_SOURCES: Array<[string, string]> = readdirSync(SRC, {
  recursive: true,
  encoding: 'utf8',
})
  .filter((path) => /\.(css|astro)$/.test(path))
  .map((path) => [path, readFileSync(new URL(path, SRC), 'utf8')]);

/** Number of declarations of a custom property (`--bg:` but not `--bg-panel:` nor `var(--bg)`). */
function declarationCount(text: string, property: string): number {
  return text.match(new RegExp(`(?<![\\w-])${property}\\s*:`, 'g'))?.length ?? 0;
}

const srgbOf = (tone: Tone, role: ToneRole) => oklchToSrgb(COLORS[TONE_ROLES[tone][role]]);

describe('formatOklch', () => {
  it('writes the CSS notation, lightness in percent without float noise', () => {
    expect(formatOklch({ l: 0.975, c: 0.008, h: 85 })).toBe('oklch(97.5% 0.008 85)');
    expect(formatOklch({ l: 0.14, c: 0.03, h: 245 })).toBe('oklch(14% 0.03 245)');
  });
});

describe('veilCss', () => {
  it('writes a translucent mix of a role, as CSS color-mix', () => {
    expect(veilCss('hover')).toBe('color-mix(in oklch, var(--fg) 7%, transparent)');
    expect(veilProperty('hover')).toBe('--veil-hover');
  });
});

describe('palette', () => {
  it.each(Object.entries(COLORS))('%s is displayable in sRGB without clipping', (_, color) => {
    expect(isInSrgbGamut(color)).toBe(true);
  });

  it('checks the alert colour as text: the HUD writes its alarms with it', () => {
    expect(CONTRAST_PAIRS).toContainEqual(['alert', 'bg', 'text']);
    expect(CONTRAST_PAIRS).toContainEqual(['alert', 'bgPanel', 'text']);
  });

  it("keeps the cards of the abyss readable out of the lamp's beam (E8, --torch-dim)", () => {
    const dim = Number(customProperties(TOKENS_CSS, ':root').get('--torch-dim'));
    expect(dim).toBeGreaterThan(0);
    expect(dim).toBeLessThan(1);
    const abyss = oklchToSrgb(COLORS.abyss);
    for (const text of ['foam', 'foam-soft'] as const) {
      const dimmed = compositeOver(oklchToSrgb(COLORS[text]), dim, abyss);
      expect(contrastRatioRgb(dimmed, abyss)).toBeGreaterThanOrEqual(WCAG_MIN.text);
    }
  });

  describe.each(TONES)('tone %s', (tone) => {
    it.each(CONTRAST_PAIRS)('%s on %s meets the WCAG minimum for %s', (front, back, use) => {
      const roles = TONE_ROLES[tone];
      const ratio = contrastRatio(COLORS[roles[front]], COLORS[roles[back]]);
      expect(ratio).toBeGreaterThanOrEqual(WCAG_MIN[use]);
    });

    it.each(VEIL_PAIRS)(
      '%s on the %s veil over %s meets the minimum for %s',
      (front, veil, back, use) => {
        const { role, percent } = VEILS[veil];
        const under = compositeOver(srgbOf(tone, role), percent / 100, srgbOf(tone, back));
        expect(contrastRatioRgb(srgbOf(tone, front), under)).toBeGreaterThanOrEqual(WCAG_MIN[use]);
      },
    );
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

  it.each(Object.keys(VEILS) as VeilName[])('derives the %s veil in every tone', (name) => {
    const derived = customProperties(TOKENS_CSS, '[data-tone]');
    expect(derived.get(veilProperty(name))).toBe(veilCss(name));
  });

  // The tests above read selected blocks: a later declaration elsewhere would win the cascade.
  it.each(Object.values(ROLE_PROPERTIES))(
    'declares %s in the five tone blocks of tokens.css only',
    (property) => {
      for (const [path, text] of STYLE_SOURCES) {
        const expected = path.endsWith('styles/tokens.css') ? TONES.length : 0;
        expect(declarationCount(text, property), path).toBe(expected);
      }
    },
  );

  it.each(Object.keys(VEILS) as VeilName[])('declares the %s veil once, in tokens.css', (name) => {
    for (const [path, text] of STYLE_SOURCES) {
      const expected = path.endsWith('styles/tokens.css') ? 1 : 0;
      expect(declarationCount(text, veilProperty(name)), path).toBe(expected);
    }
  });

  it('finds the stylesheets and components to scan', () => {
    expect(STYLE_SOURCES.map(([path]) => path)).toEqual(
      expect.arrayContaining([
        'styles/tokens.css',
        'styles/global.css',
        'components/ui/Button.astro',
      ]),
    );
  });
});
