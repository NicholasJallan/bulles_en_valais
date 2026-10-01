// Single source of the colours (plans/refonte-la-descente/01-direction-artistique.md §4):
// src/styles/tokens.css mirrors it, palette.test.ts checks both and every contrast.
import type { Oklch, WCAG_MIN } from './contrast.ts';

const oklch = (lightness: number, c: number, h: number): Oklch => ({ l: lightness / 100, c, h });

export const TONES = ['surface', 'lagoon', 'emerald', 'deep', 'abyss'] as const;
export type Tone = (typeof TONES)[number];

/** Raw colours, declared in tokens.css as `--c-<name>`. */
export const COLORS = {
  surface: oklch(97.5, 0.008, 85), // foam: main light background
  'surface-2': oklch(94, 0.014, 85), // limestone: sunken areas
  'surface-raised': oklch(99.3, 0.004, 85),
  lagoon: oklch(90, 0.035, 195),
  'lagoon-raised': oklch(94.5, 0.024, 195),
  'lagoon-ink': oklch(45, 0.075, 200), // Rosel turquoise: cold accents (0.08 is outside sRGB)
  emerald: oklch(37, 0.056, 200), // glacial; darker than the first proposal (42 %) for contrast
  leman: oklch(32, 0.055, 230), // also the panels of the emerald tone: deeper water
  deep: oklch(22, 0.045, 240),
  'deep-raised': oklch(27, 0.048, 238),
  abyss: oklch(14, 0.03, 245),
  'abyss-raised': oklch(19, 0.035, 243),
  ink: oklch(21, 0.03, 240), // text on light tones
  'ink-soft': oklch(38, 0.025, 235),
  foam: oklch(96, 0.01, 90), // text on dark tones
  'foam-soft': oklch(80, 0.02, 220),
  torch: oklch(70, 0.17, 36), // the lamp, lit: actions on dark tones
  'torch-deep': oklch(51, 0.19, 31), // the lamp in daylight: actions on light tones
  'torch-pale': oklch(82, 0.1, 40), // links on emerald
  'torch-glow': oklch(76, 0.15, 50), // halo of the actions
  alert: oklch(82, 0.15, 85), // dive-computer warning amber (the red belongs to the actions)
  'alert-deep': oklch(50, 0.1, 70), // the same warning on light tones
  // Decorative warmth fades with depth like daylight: red goes first, then orange, then yellow.
  'deco-surface': oklch(58, 0.13, 58),
  'deco-lagoon': oklch(50, 0.085, 80),
  'deco-emerald': oklch(74, 0.06, 115),
  'deco-deep': oklch(70, 0.03, 190),
  'deco-abyss': oklch(62, 0.015, 235),
} as const satisfies Record<string, Oklch>;

export type ColorName = keyof typeof COLORS;

export interface ToneRoles {
  readonly bg: ColorName;
  readonly bgPanel: ColorName;
  readonly fg: ColorName;
  readonly fgSoft: ColorName;
  readonly accentDeco: ColorName;
  readonly action: ColorName;
  readonly actionInk: ColorName;
  readonly actionText: ColorName;
  readonly alert: ColorName;
}
export type ToneRole = keyof ToneRoles;

/** CSS custom property of each role, set by `[data-tone]` blocks. */
export const ROLE_PROPERTIES: Readonly<Record<ToneRole, `--${string}`>> = {
  bg: '--bg',
  bgPanel: '--bg-panel',
  fg: '--fg',
  fgSoft: '--fg-soft',
  accentDeco: '--accent-deco',
  action: '--action',
  actionInk: '--action-ink',
  actionText: '--action-text',
  alert: '--alert',
};

const LIGHT_ACTIONS = {
  action: 'torch-deep',
  actionInk: 'foam',
  actionText: 'torch-deep',
  alert: 'alert-deep',
} as const;
const DARK_ACTIONS = {
  action: 'torch',
  actionInk: 'ink',
  actionText: 'torch',
  alert: 'alert',
} as const;

export const TONE_ROLES: Readonly<Record<Tone, ToneRoles>> = {
  surface: {
    bg: 'surface',
    bgPanel: 'surface-raised',
    fg: 'ink',
    fgSoft: 'ink-soft',
    accentDeco: 'deco-surface',
    ...LIGHT_ACTIONS,
  },
  lagoon: {
    bg: 'lagoon',
    bgPanel: 'lagoon-raised',
    fg: 'ink',
    fgSoft: 'ink-soft',
    accentDeco: 'deco-lagoon',
    ...LIGHT_ACTIONS,
  },
  emerald: {
    bg: 'emerald',
    bgPanel: 'leman',
    fg: 'foam',
    fgSoft: 'foam-soft',
    accentDeco: 'deco-emerald',
    ...DARK_ACTIONS,
    actionText: 'torch-pale',
  },
  deep: {
    bg: 'deep',
    bgPanel: 'deep-raised',
    fg: 'foam',
    fgSoft: 'foam-soft',
    accentDeco: 'deco-deep',
    ...DARK_ACTIONS,
  },
  abyss: {
    bg: 'abyss',
    bgPanel: 'abyss-raised',
    fg: 'foam',
    fgSoft: 'foam-soft',
    accentDeco: 'deco-abyss',
    ...DARK_ACTIONS,
  },
};

/** Pairs every tone must keep readable: foreground role, background role, kind of use. */
export const CONTRAST_PAIRS: ReadonlyArray<readonly [ToneRole, ToneRole, keyof typeof WCAG_MIN]> = [
  ['fg', 'bg', 'text'],
  ['fg', 'bgPanel', 'text'],
  ['fgSoft', 'bg', 'text'],
  ['fgSoft', 'bgPanel', 'text'],
  ['accentDeco', 'bg', 'large'],
  ['accentDeco', 'bgPanel', 'large'],
  ['action', 'bg', 'ui'],
  ['action', 'bgPanel', 'ui'],
  ['actionInk', 'action', 'text'],
  ['actionText', 'bg', 'text'],
  ['actionText', 'bgPanel', 'text'],
  ['alert', 'bg', 'ui'],
  ['alert', 'bgPanel', 'ui'],
];

export const colorProperty = (name: ColorName): `--c-${ColorName}` => `--c-${name}`;

/** CSS notation of a colour, as written in tokens.css. */
export function formatOklch({ l, c, h }: Oklch): string {
  return `oklch(${Number((l * 100).toFixed(2))}% ${c} ${h})`;
}
