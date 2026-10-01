import type { Localized } from '../i18n/types.ts';

/** Public contact details of Nicholas. */
export const PHONE = { href: 'tel:+41794368112', display: '+41 79 436 81 12' } as const;
/** E.164 without the `+`, as wa.me expects it. */
export const WHATSAPP_NUMBER = '41794368112';
export const EMAIL = 'nicholas@bullesenvalais.ch';

/** Public profiles (I-14): footer links and `sameAs` of the JSON-LD (S11). */
export const SOCIAL_PROFILES = [
  {
    id: 'instagram',
    label: 'Instagram',
    handle: '@nicho_dive',
    url: 'https://www.instagram.com/nicho_dive/',
  },
  // TODO(I-14): address of the Facebook page « Bulles en Valais ».
] as const;

/** wa.me link, with an optional message written in advance in the chat box. */
export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  const text = message?.trim() ?? '';
  return text === '' ? base : `${base}?text=${encodeURIComponent(text)}`;
}

/**
 * Values of the « interest » field of the contact form. Each one must be in
 * `ALLOWED_INTERESTS` of public/api/contact.php (checked by contact.test.ts).
 */
export const INTERESTS = [
  'baptism',
  'sdi-owd',
  'sdi-aowd',
  'sdi-rescue',
  'tdi',
  'padi-owd',
  'padi-aowd',
  'padi-rescue',
  'padi-dm',
  'ffessm',
  'specialty',
  'refresher',
  'gift',
  'other',
] as const;

export type Interest = (typeof INTERESTS)[number];

/** Selected when the form opens without a prefilled interest (SDI/TDI first since S00). */
export const DEFAULT_INTEREST: Interest = 'sdi-owd';

export const INTEREST_LABELS: Readonly<Record<Interest, Localized>> = {
  baptism: { fr: 'Baptême — Discover Scuba', en: 'Try dive — Discover Scuba' },
  'sdi-owd': { fr: 'SDI Open Water Scuba Diver', en: 'SDI Open Water Scuba Diver' },
  'sdi-aowd': { fr: 'SDI Advanced Adventure Diver', en: 'SDI Advanced Adventure Diver' },
  'sdi-rescue': { fr: 'SDI Rescue Diver', en: 'SDI Rescue Diver' },
  tdi: { fr: 'TDI (filière technique)', en: 'TDI (technical path)' },
  'padi-owd': { fr: 'PADI Open Water Diver', en: 'PADI Open Water Diver' },
  'padi-aowd': { fr: 'PADI Advanced Open Water', en: 'PADI Advanced Open Water' },
  'padi-rescue': { fr: 'PADI Rescue + EFR', en: 'PADI Rescue + EFR' },
  'padi-dm': { fr: 'PADI Divemaster', en: 'PADI Divemaster' },
  ffessm: { fr: 'FFESSM (N1 à N4, Trimix)', en: 'FFESSM (N1 to N4, Trimix)' },
  specialty: { fr: 'Une spécialité (SDI, TDI ou PADI)', en: 'A specialty (SDI, TDI or PADI)' },
  refresher: { fr: 'Refresher / ReActivate', en: 'Refresher / ReActivate' },
  gift: { fr: 'Un bon cadeau', en: 'A gift voucher' },
  other: { fr: 'Autre — je précise ci-dessous', en: "Other — I'll specify below" },
};
