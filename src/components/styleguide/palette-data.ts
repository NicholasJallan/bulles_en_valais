// Palette and contrast figures shown by the styleguide, computed at build time from the sources.
import { WCAG_MIN, contrastRatio, oklchToSrgb, srgbToHex } from '@/lib/color/contrast.ts';
import {
  COLORS,
  CONTRAST_PAIRS,
  TONE_ROLES,
  colorProperty,
  formatOklch,
  type ColorName,
  type Tone,
  type ToneRole,
} from '@/lib/color/palette.ts';

export interface Swatch {
  readonly name: ColorName;
  readonly property: string;
  readonly oklch: string;
  readonly hex: string;
}

export interface RatioRow {
  readonly pair: string;
  readonly ratio: string;
  readonly level: 'AAA' | 'AA';
}

const ROLE_LABELS: Readonly<Record<ToneRole, string>> = {
  bg: 'fond',
  bgPanel: 'panneau',
  fg: 'texte',
  fgSoft: 'texte doux',
  accentDeco: 'italique décorative',
  action: 'action',
  actionInk: 'texte sur action',
  actionText: 'lien',
  alert: 'alerte',
};

/** AAA: 7:1 for text, 4.5:1 for large text; interface parts have no AAA level. */
const AAA_MIN = { text: 7, large: 4.5, ui: Number.POSITIVE_INFINITY } as const;

export const COLOR_GROUPS: ReadonlyArray<{ readonly title: string; readonly names: ColorName[] }> =
  [
    {
      title: 'L’eau, de la surface à l’abysse',
      names: ['surface', 'surface-2', 'lagoon', 'lagoon-ink', 'emerald', 'leman', 'deep', 'abyss'],
    },
    {
      title: 'Panneaux',
      names: ['surface-raised', 'lagoon-raised', 'deep-raised', 'abyss-raised'],
    },
    { title: 'Encre et écume', names: ['ink', 'ink-soft', 'foam', 'foam-soft'] },
    { title: 'La lampe : les actions', names: ['torch-deep', 'torch', 'torch-pale', 'torch-glow'] },
    { title: 'Alerte', names: ['alert-deep', 'alert'] },
    {
      title: 'Lumière décorative : 0, 10, 20, 30 et 40 m',
      names: ['deco-surface', 'deco-lagoon', 'deco-emerald', 'deco-deep', 'deco-abyss'],
    },
  ];

export function swatch(name: ColorName): Swatch {
  const color = COLORS[name];
  return {
    name,
    property: colorProperty(name),
    oklch: formatOklch(color),
    hex: srgbToHex(oklchToSrgb(color)),
  };
}

const formatRatio = (ratio: number): string => `${ratio.toFixed(1).replace('.', ',')}:1`;

/** Measured contrast of every checked pair of a tone. */
export function toneRatios(tone: Tone): RatioRow[] {
  const roles = TONE_ROLES[tone];
  return CONTRAST_PAIRS.map(([front, back, use]) => {
    const ratio = contrastRatio(COLORS[roles[front]], COLORS[roles[back]]);
    if (ratio < WCAG_MIN[use]) throw new Error(`${tone}: ${front} on ${back} is below AA`);
    return {
      pair: `${ROLE_LABELS[front]} / ${ROLE_LABELS[back]}`,
      ratio: formatRatio(ratio),
      level: ratio >= AAA_MIN[use] ? 'AAA' : 'AA',
    };
  });
}

export const TONE_INFO: Readonly<
  Record<Tone, { readonly name: string; readonly depth: string; readonly light: string }>
> = {
  surface: { name: 'Surface', depth: '0 à 5 m', light: 'toutes les couleurs sont là.' },
  lagoon: { name: 'Lagon', depth: '5 à 15 m', light: 'le rouge s’éteint, l’orange pâlit.' },
  emerald: { name: 'Émeraude', depth: '15 à 22 m', light: 'l’eau verdit et se refroidit.' },
  deep: { name: 'Profond', depth: '22 à 32 m', light: 'le jaune a disparu.' },
  abyss: { name: 'Abysse', depth: '32 à 40 m', light: 'seule la lampe se souvient des couleurs.' },
};
