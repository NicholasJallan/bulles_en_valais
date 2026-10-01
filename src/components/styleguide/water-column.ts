// Bands of the styleguide water column: down to 40 m, then the slow ascent and the safety stop.
// Temperatures: I-05 (INPUTS-NICHOLAS.md), 21 °C at the surface and 8 °C at the bottom.
import { TONE_ROLES, colorProperty, type Tone } from '@/lib/color/palette.ts';

export interface Band {
  readonly depth: number;
  readonly tone: Tone;
  readonly temperature: number;
  readonly note: string;
}

export const WATER_COLUMN: readonly Band[] = [
  {
    depth: 0,
    tone: 'surface',
    temperature: 21,
    note: 'Surface. La lumière contient toutes les couleurs.',
  },
  { depth: 5, tone: 'surface', temperature: 20, note: 'Le rouge commence à disparaître.' },
  { depth: 10, tone: 'lagoon', temperature: 16, note: 'L’orange s’éteint, le bleu domine.' },
  {
    depth: 15,
    tone: 'emerald',
    temperature: 11,
    note: 'Thermocline : l’eau se refroidit d’un coup.',
  },
  { depth: 20, tone: 'emerald', temperature: 9, note: 'Le jaune s’efface à son tour.' },
  { depth: 30, tone: 'deep', temperature: 8, note: 'Ne restent que le vert et le bleu.' },
  { depth: 40, tone: 'abyss', temperature: 8, note: 'Seule la lampe se souvient des couleurs.' },
  { depth: 30, tone: 'deep', temperature: 8, note: 'Remontée lente.' },
  {
    depth: 20,
    tone: 'emerald',
    temperature: 9,
    note: 'Les couleurs reviennent dans l’ordre inverse.',
  },
  { depth: 10, tone: 'lagoon', temperature: 16, note: 'Le bleu, puis la chaleur.' },
  { depth: 5, tone: 'surface', temperature: 20, note: 'Palier de sécurité : 3 minutes à 5 m.' },
  { depth: 0, tone: 'surface', temperature: 21, note: 'Surface. On peut se parler.' },
];

/** CSS value of the background of a tone, for the thermocline gradients. */
export const toneBackground = (tone: Tone): string => `var(${colorProperty(TONE_ROLES[tone].bg)})`;
