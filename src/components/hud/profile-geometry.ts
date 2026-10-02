// One geometry for the profile line of the gauge, of the dive profile and for the HUD's dot.
import { HUD_PROFILE } from '@/data/sections.ts';
import { profileGeometry } from '@/lib/depth/profile.ts';

export const PROFILE_BOX = { width: 160, height: 56 } as const;

export const PROFILE_GEOMETRY = profileGeometry(HUD_PROFILE, PROFILE_BOX);

/** Position of a section on the profile line (the HUD reads sections by their anchor). */
export const profileIndex = (id: string): number =>
  HUD_PROFILE.findIndex((section) => section.id === id);
