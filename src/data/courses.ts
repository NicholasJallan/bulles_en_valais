// Every course and its price, once (prices migrated as is from legacy/components/i18n.jsx, S03).
// The Cursus panels list the courses with a `cursus` role, in this order; the specialty tabs
// reference them from specialties.ts; the depth ladder shows those `inLadder` at `maxDepth`.
import type { Localized } from '../i18n/types.ts';
import type { Interest } from './contact.ts';

export const AGENCIES = ['sdi-tdi', 'padi', 'ffessm'] as const;
export type AgencyId = (typeof AGENCIES)[number];

export type Price =
  { readonly amount: number; readonly currency: 'CHF' } | { readonly onRequest: true };

export interface Course {
  readonly id: string;
  readonly agency: AgencyId;
  readonly group: 'core' | 'specialty' | 'tech' | 'federal';
  /** Name in the price lists, also the card title unless specialties.ts overrides it. */
  readonly name: Localized;
  /** Short line under the name in the Cursus price list. */
  readonly meta?: Localized;
  readonly price: Price;
  /** Place in the Cursus panel of the agency: a row of the price list, or a line under it. */
  readonly cursus?: 'row' | 'extra';
  /** Maximum depth in metres, for the depth ladder (I-04). */
  readonly maxDepth?: number;
  readonly inLadder?: boolean;
  /** Value preselected in the contact form when someone asks about this course. */
  readonly formInterest?: Interest;
}

const chf = (amount: number): Price => ({ amount, currency: 'CHF' });
const ON_REQUEST: Price = { onRequest: true };

/** Same name in every language (international programme names). */
const same = (name: string): Localized => ({ fr: name, en: name });

const SDI_TDI_COURSES = [
  {
    id: 'sdi-owsd',
    agency: 'sdi-tdi',
    group: 'core',
    name: same('Open Water Scuba Diver'),
    meta: { fr: 'Équivalent OWD', en: 'OWD equivalent' },
    price: chf(690),
    cursus: 'row',
    maxDepth: 18,
    inLadder: true,
    formInterest: 'sdi-owd',
  },
  {
    id: 'sdi-aad',
    agency: 'sdi-tdi',
    group: 'core',
    name: same('Advanced Adventure Diver'),
    meta: { fr: 'Équivalent AOWD', en: 'AOWD equivalent' },
    price: chf(450),
    cursus: 'row',
    maxDepth: 30,
    inLadder: true,
    formInterest: 'sdi-aowd',
  },
  {
    id: 'sdi-rescue',
    agency: 'sdi-tdi',
    group: 'core',
    name: same('Rescue Diver'),
    meta: { fr: 'Secours et sauvetage', en: 'Rescue and safety' },
    price: chf(890),
    cursus: 'row',
    formInterest: 'sdi-rescue',
  },
  {
    id: 'sdi-dm',
    agency: 'sdi-tdi',
    group: 'core',
    name: same('Divemaster'),
    meta: { fr: '30 séances · avec votre équipement', en: '30 sessions · your own gear' },
    price: chf(990),
    cursus: 'row',
    formInterest: 'sdi-dm',
  },
  {
    id: 'tdi-advanced-nitrox',
    agency: 'sdi-tdi',
    group: 'tech',
    name: { fr: 'TDI Nitrox avancé', en: 'TDI Advanced Nitrox' },
    meta: { fr: 'Mélanges enrichis', en: 'Enriched mixes' },
    price: chf(290),
    cursus: 'row',
    formInterest: 'tdi',
  },
  {
    id: 'tdi-deco',
    agency: 'sdi-tdi',
    group: 'tech',
    name: same('TDI Decompression Procedures'),
    meta: { fr: 'Plongée avec paliers', en: 'Staged decompression' },
    price: chf(250),
    cursus: 'row',
    maxDepth: 45,
    inLadder: true,
    formInterest: 'tdi',
  },
  {
    id: 'tdi-nitrox',
    agency: 'sdi-tdi',
    group: 'tech',
    name: same('TDI Enriched Air Nitrox'),
    price: chf(290),
    formInterest: 'tdi',
  },
  {
    id: 'tdi-dpv',
    agency: 'sdi-tdi',
    group: 'tech',
    name: same('TDI DPV Diver'),
    price: chf(150),
    formInterest: 'tdi',
  },
] as const satisfies readonly Course[];

const PADI_COURSES = [
  {
    id: 'padi-dsd',
    agency: 'padi',
    group: 'core',
    name: same('Discover Scuba Diving'),
    meta: { fr: '2 heures · baptême', en: '2 hours · intro dive' },
    price: chf(90),
    cursus: 'row',
    maxDepth: 6,
    inLadder: true,
    formInterest: 'baptism',
  },
  {
    id: 'padi-owd',
    agency: 'padi',
    group: 'core',
    name: same('Open Water Diver'),
    meta: { fr: '3 jours min · −10 % à deux', en: '3 days min · −10% for two' },
    price: chf(790),
    cursus: 'row',
    maxDepth: 18,
    inLadder: true,
    formInterest: 'padi-owd',
  },
  {
    id: 'padi-aowd',
    agency: 'padi',
    group: 'core',
    name: same('Advanced Open Water'),
    meta: { fr: '2 jours min · −10 % à deux', en: '2 days min · −10% for two' },
    price: chf(550),
    cursus: 'row',
    maxDepth: 30,
    inLadder: true,
    formInterest: 'padi-aowd',
  },
  {
    id: 'padi-rescue',
    agency: 'padi',
    group: 'core',
    name: same('Rescue Diver + EFR'),
    meta: { fr: '3 jours min', en: '3 days min' },
    price: chf(990),
    cursus: 'row',
    formInterest: 'padi-rescue',
  },
  {
    id: 'padi-dm',
    agency: 'padi',
    group: 'core',
    name: same('Divemaster'),
    meta: { fr: '30 séances · avec votre équipement', en: '30 sessions · your own gear' },
    price: chf(1090),
    cursus: 'row',
    formInterest: 'padi-dm',
  },
  {
    id: 'padi-reactivate',
    agency: 'padi',
    group: 'core',
    name: { fr: 'Refresher course (ReActivate)', en: 'Refresher course (ReActivate)' },
    meta: { fr: 'Environ 2 heures', en: 'About 2 hours' },
    price: chf(80),
    cursus: 'extra',
    formInterest: 'refresher',
  },
  {
    id: 'padi-dld',
    agency: 'padi',
    group: 'core',
    name: same('Discover Local Diving'),
    meta: { fr: '½ journée', en: '½ day' },
    price: chf(80),
    cursus: 'extra',
  },
] as const satisfies readonly Course[];

/** SDI specialties: the same ten courses as PADI, under their SDI names. */
const SDI_SPECIALTIES = [
  {
    id: 'sdi-nitrox',
    agency: 'sdi-tdi',
    group: 'specialty',
    name: same('Enriched Air Nitrox'),
    price: chf(290),
    formInterest: 'specialty',
  },
  {
    id: 'sdi-deep',
    agency: 'sdi-tdi',
    group: 'specialty',
    name: same('Deep Diver'),
    price: chf(290),
    maxDepth: 40,
    inLadder: true,
    formInterest: 'specialty',
  },
  {
    id: 'sdi-navigation',
    agency: 'sdi-tdi',
    group: 'specialty',
    name: same('Underwater Navigation'),
    price: chf(250),
    formInterest: 'specialty',
  },
  {
    id: 'sdi-altitude',
    agency: 'sdi-tdi',
    group: 'specialty',
    name: same('Altitude'),
    price: chf(250),
    formInterest: 'specialty',
  },
  {
    id: 'sdi-drysuit',
    agency: 'sdi-tdi',
    group: 'specialty',
    name: same('Dry Suit'),
    price: chf(250),
    formInterest: 'specialty',
  },
  {
    id: 'sdi-dsmb',
    agency: 'sdi-tdi',
    group: 'specialty',
    name: same('DSMB'),
    price: chf(190),
    formInterest: 'specialty',
  },
  {
    id: 'sdi-search-recovery',
    agency: 'sdi-tdi',
    group: 'specialty',
    name: same('Search & Recovery'),
    price: chf(190),
    formInterest: 'specialty',
  },
  {
    id: 'sdi-night',
    agency: 'sdi-tdi',
    group: 'specialty',
    name: same('Night Diver'),
    price: chf(250),
    formInterest: 'specialty',
  },
  {
    id: 'sdi-wreck',
    agency: 'sdi-tdi',
    group: 'specialty',
    name: same('Wreck'),
    price: chf(290),
    formInterest: 'specialty',
  },
  {
    id: 'sdi-buoyancy',
    agency: 'sdi-tdi',
    group: 'specialty',
    name: same('Buoyancy Diver'),
    price: chf(250),
    formInterest: 'specialty',
  },
] as const satisfies readonly Course[];

/** PADI specialties: same content and instructor as SDI, under the PADI names. */
const PADI_SPECIALTIES = [
  {
    id: 'padi-nitrox',
    agency: 'padi',
    group: 'specialty',
    name: same('Enriched Air'),
    price: chf(340),
    formInterest: 'specialty',
  },
  {
    id: 'padi-deep',
    agency: 'padi',
    group: 'specialty',
    name: same('Deep Diving'),
    price: chf(340),
    maxDepth: 40,
    inLadder: true,
    formInterest: 'specialty',
  },
  {
    id: 'padi-navigation',
    agency: 'padi',
    group: 'specialty',
    name: same('Underwater Navigator'),
    price: chf(300),
    formInterest: 'specialty',
  },
  {
    id: 'padi-altitude',
    agency: 'padi',
    group: 'specialty',
    name: same('Altitude'),
    price: chf(300),
    formInterest: 'specialty',
  },
  {
    id: 'padi-drysuit',
    agency: 'padi',
    group: 'specialty',
    name: same('Dry Suit'),
    price: chf(300),
    formInterest: 'specialty',
  },
  {
    id: 'padi-dsmb',
    agency: 'padi',
    group: 'specialty',
    name: same('DSMB'),
    price: chf(240),
    formInterest: 'specialty',
  },
  {
    id: 'padi-search-recovery',
    agency: 'padi',
    group: 'specialty',
    name: same('Search & Recovery'),
    price: chf(240),
    formInterest: 'specialty',
  },
  {
    id: 'padi-night',
    agency: 'padi',
    group: 'specialty',
    name: same('Night Dive'),
    price: chf(300),
    formInterest: 'specialty',
  },
  {
    id: 'padi-wreck',
    agency: 'padi',
    group: 'specialty',
    name: same('Wreck'),
    price: chf(340),
    formInterest: 'specialty',
  },
  {
    id: 'padi-buoyancy',
    agency: 'padi',
    group: 'specialty',
    name: same('Peak Buoyancy'),
    price: chf(300),
    formInterest: 'specialty',
  },
] as const satisfies readonly Course[];

// N1 to N4 show the prices of the FFESSM specialty tab everywhere (I-10 a); N5, PTH70 and PTH120
// are on request. Prerogatives as defined by the federation (I-10 b): N1 supervised to 20 m (PE20),
// N2 autonomous to 20 m and supervised to 40 m, N3 autonomous to 60 m.
const FFESSM_COURSES = [
  {
    id: 'ffessm-n1',
    agency: 'ffessm',
    group: 'federal',
    name: same('Niveau 1 (N1)'),
    meta: { fr: 'Plongée encadrée à 20 m', en: 'Supervised diving to 20 m' },
    price: chf(390),
    cursus: 'row',
    maxDepth: 20,
    inLadder: true,
    formInterest: 'ffessm',
  },
  {
    id: 'ffessm-n2',
    agency: 'ffessm',
    group: 'federal',
    name: same('Niveau 2 (N2)'),
    meta: {
      fr: 'Autonomie à 20 m · encadré à 40 m',
      en: 'Autonomous to 20 m · supervised to 40 m',
    },
    price: chf(490),
    cursus: 'row',
    maxDepth: 40,
    inLadder: true,
    formInterest: 'ffessm',
  },
  {
    id: 'ffessm-n3',
    agency: 'ffessm',
    group: 'federal',
    name: same('Niveau 3 (N3)'),
    meta: { fr: 'Plongée en autonomie 60 m', en: 'Autonomous diving to 60 m' },
    price: chf(690),
    cursus: 'row',
    maxDepth: 60,
    inLadder: true,
    formInterest: 'ffessm',
  },
  {
    id: 'ffessm-n4',
    agency: 'ffessm',
    group: 'federal',
    name: same('Niveau 4 (N4)'),
    meta: {
      fr: 'Guide de Palanquée — préparation (hors examen fédéral)',
      en: 'Guide de Palanquée / dive leader — preparation (federal exam not included)',
    },
    price: chf(990),
    cursus: 'row',
    formInterest: 'ffessm',
  },
  {
    id: 'ffessm-pth70',
    agency: 'ffessm',
    group: 'federal',
    name: same('PTH70'),
    meta: {
      fr: "Trimix hypoxique · jusqu'à 70 m, avant le PTH120",
      en: 'Hypoxic trimix · to 70 m, before PTH120',
    },
    price: ON_REQUEST,
    cursus: 'row',
    maxDepth: 70,
    inLadder: true,
    formInterest: 'ffessm',
  },
  {
    id: 'ffessm-pth120',
    agency: 'ffessm',
    group: 'federal',
    name: same('PTH120'),
    meta: {
      fr: "Trimix Hélium · formation 0–80 m, évolution jusqu'à 120 m",
      en: 'Trimix (Helium) · training 0–80 m, progression to 120 m',
    },
    price: ON_REQUEST,
    cursus: 'row',
    maxDepth: 120,
    inLadder: true,
    formInterest: 'ffessm',
  },
  {
    id: 'ffessm-n5',
    agency: 'ffessm',
    group: 'federal',
    name: { fr: 'Niveau 5 (N5)', en: 'Niveau 5 (N5)' },
    price: ON_REQUEST,
    formInterest: 'ffessm',
  },
] as const satisfies readonly Course[];

export const COURSES = [
  ...SDI_TDI_COURSES,
  ...PADI_COURSES,
  ...SDI_SPECIALTIES,
  ...PADI_SPECIALTIES,
  ...FFESSM_COURSES,
] as const satisfies readonly Course[];

export type CourseId = (typeof COURSES)[number]['id'];

export function courseById(id: CourseId): Course {
  const course: Course | undefined = COURSES.find((entry) => entry.id === id);
  if (course === undefined) throw new Error(`Unknown course "${id}"`);
  return course;
}

/** Courses of the Cursus panel of an agency, in the order of the price list. */
export function cursusCourses(agency: AgencyId, role: 'row' | 'extra'): readonly Course[] {
  return COURSES.filter((course: Course) => course.agency === agency && course.cursus === role);
}

export type LadderCourse = Course & { readonly maxDepth: number };

function isOnLadder(course: Course): course is LadderCourse {
  return course.inLadder === true && course.maxDepth !== undefined;
}

/** Courses of the depth ladder, from the shallowest to the deepest. */
export function ladderCourses(): readonly LadderCourse[] {
  const all: readonly Course[] = COURSES;
  return all.filter(isOnLadder).toSorted((a, b) => a.maxDepth - b.maxDepth);
}

export function isOnRequest(price: Price): price is { readonly onRequest: true } {
  return 'onRequest' in price;
}
