// Real content for the styleguide specimens, read from the dictionaries and the data (French).
// The styleguide is noindex, French only, and removed in S13.
import { INTEREST_LABELS, type Interest } from '@/data/contact.ts';
import {
  type Course,
  type CourseId,
  courseById,
  cursusCourses,
  isOnRequest,
} from '@/data/courses.ts';
import { PLACES } from '@/data/places.ts';
import { markerDepth } from '@/data/sections.ts';
import { SPECIALTIES } from '@/data/specialties.ts';
import { getDictionary, localize } from '@/i18n/index.ts';
import type { Emphasis, Localized } from '@/i18n/types.ts';
import { formatCHF, formatCoordinates } from '@/lib/format.ts';

export interface PriceRow {
  readonly name: string;
  readonly meta: string;
  readonly price: string;
}

const LOCALE = 'fr';
const t = getDictionary(LOCALE);
const text = (value: Localized): string => localize(value, LOCALE);

function priceOf(course: Course): string {
  return isOnRequest(course.price) ? t.courses.onRequest : formatCHF(course.price.amount, LOCALE);
}

function found<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new Error(`Styleguide sample not found: ${what}`);
  return value;
}

export const SECTION = {
  depth: markerDepth('agencies'),
  eyebrow: t.courses.eyebrow,
  title: t.courses.title,
  lead: t.courses.lead,
  body: `${t.manifesto.body} ${t.instructor.body[0]}`,
};

const sdiTdi = t.courses.agencies['sdi-tdi'];

export const PRICES = {
  title: `${t.courses.priceListTitle} · ${sdiTdi.label}`,
  rows: cursusCourses('sdi-tdi', 'row').map((course): PriceRow => ({
    name: text(course.name),
    meta: course.meta === undefined ? '' : text(course.meta),
    price: priceOf(course),
  })),
  note: sdiTdi.note ?? '',
};

export const HERO = {
  eyebrow: t.hero.eyebrow,
  lead: t.hero.lead,
  primary: t.hero.primaryCta,
  secondary: t.hero.secondaryCta,
};

export const MANIFESTO: Emphasis = t.manifesto.title;

const DEEP: CourseId = 'sdi-deep';
const deepCard = found(
  SPECIALTIES.sdi.find((card) => card.course === DEEP),
  DEEP,
);
const rosel = found(
  PLACES.find((place) => place.id === 'rosel'),
  'rosel',
);
const review = found(
  t.testimonials.items.find((item) => item.author === 'Florent Q.'),
  'Florent Q.',
);

export const CARDS = {
  course: {
    name: text(courseById(DEEP).name),
    sub: text(deepCard.sub),
    desc: text(deepCard.description),
    price: priceOf(courseById(DEEP)),
  },
  place: {
    name: text(rosel.name),
    coords: formatCoordinates(rosel.coords, LOCALE),
    desc: text(rosel.description),
  },
  quote: { text: review.text.join(' '), author: review.author, course: review.course },
};

const FORM_INTERESTS: readonly Interest[] = ['sdi-owd', 'padi-owd', 'ffessm', 'other'];

export const FORM = {
  interests: FORM_INTERESTS.map((value) => ({ value, label: text(INTEREST_LABELS[value]) })),
};

/** Interludes and the return to the surface, for the motion demos. */
export const QUOTES = {
  light: t.interludes.light.quote,
  surface: t.contact.title,
};
