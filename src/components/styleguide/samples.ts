// Real content for the styleguide specimens, copied from legacy/components/i18n.jsx (French).
// Exception to « visible texts live in src/i18n/ »: the styleguide is noindex, French only, and
// removed in S13; S03 owns the dictionaries meanwhile.
import type { Emphasis } from '@/i18n/types.ts';

export interface PriceRow {
  readonly name: string;
  readonly meta: string;
  readonly price: string;
}

export const SECTION = {
  depth: 12,
  eyebrow: 'Cursus',
  title: { before: 'Trois écoles,', em: 'un instructeur.' } satisfies Emphasis,
  lead: 'SDI/TDI et PADI partagent exactement les mêmes standards RSTC — même contenu, même reconnaissance. FFESSM dépend de la CMAS. Vous pouvez suivre un cursus unique, ou mélanger les trois (criss-cross) pour plonger sans restriction partout où vous irez.',
  body: "Je forme des plongeurs, pas des certifiés. La différence tient dans l'aisance, la lecture du milieu, et cette économie de geste qui ne vient qu'avec des heures d'immersion. Mes cours se tiennent en petit comité — souvent en un-à-un, rarement plus de trois élèves. Chacun progresse à son rythme, et le contenu s'adapte au profil, pas l'inverse.",
} as const;

export const PRICES = {
  title: 'Cours & tarifs · SDI / TDI',
  rows: [
    { name: 'Open Water Scuba Diver', meta: 'Équivalent OWD', price: 'CHF 690' },
    { name: 'Advanced Adventure Diver', meta: 'Équivalent AOWD', price: 'CHF 450' },
    { name: 'Rescue Diver', meta: 'Secours et sauvetage', price: 'CHF 890' },
    { name: 'TDI Nitrox avancé', meta: 'Mélanges enrichis', price: 'CHF 250' },
    { name: 'TDI Decompression Procedures', meta: 'Plongée avec paliers', price: 'CHF 250' },
  ] satisfies PriceRow[],
  note: 'Tarifs de base ci-dessus. Les formations les plus avancées (Trimix, recycleur, caverne) se construisent sur mesure.',
} as const;

export const HERO = {
  eyebrow: 'Surface',
  lead: 'Cours multi-écoles SDI/TDI, PADI et FFESSM au lac du Rosel, aux Îles de Sion et sur le Léman. Un instructeur, trois certifications, votre rythme.',
  primary: 'Planifier une session',
  secondary: 'Découvrir les cursus',
} as const;

export const MANIFESTO: Emphasis = { before: 'Je forme des plongeurs,', em: 'pas des certifiés.' };

export const CARDS = {
  course: {
    name: 'Deep Diver',
    sub: '40 m',
    desc: "Prérogatives jusqu'à 40 mètres, gestion de la profondeur et de la narcose.",
    price: 'CHF 290',
  },
  place: {
    name: 'Rosel',
    coords: '46°05′N · 7°04′E',
    desc: "À deux pas de Martigny, un plan d'eau clair, calme, et parfaitement adapté à la formation initiale.",
  },
  quote: {
    text: 'Une franche réussite, son accompagnement permet une vraie progression !',
    author: 'Alexandre F.',
    course: 'PADI Open Water',
  },
} as const;

export const FORM = {
  interests: [
    { value: 'sdi-owd', label: 'SDI Open Water Scuba Diver' },
    { value: 'padi-owd', label: 'PADI Open Water Diver' },
    { value: 'ffessm', label: 'FFESSM (N1 à N4, Trimix)' },
    { value: 'other', label: 'Autre — je précise ci-dessous' },
  ],
} as const;

/** Interludes and the return to the surface, for the motion demos. */
export const QUOTES = {
  light: 'À quarante mètres, le rouge a disparu. Seule la lampe se souvient des couleurs.',
  surface: { before: 'Sous l’eau, on ne parle pas.', em: 'Remontons.' } satisfies Emphasis,
} as const;
