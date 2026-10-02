import { TONE_ROLES, colorProperty, type Tone } from '@/lib/color/palette.ts';

/** CSS value of the water of a tone (its background). */
export const toneWater = (tone: Tone): string => `var(${colorProperty(TONE_ROLES[tone].bg)})`;
