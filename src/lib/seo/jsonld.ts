// Structured data of the home page (02-architecture.md §13) and of the landing pages: schema.org
// @graphs built from src/data. No postal address (I-08) and no AggregateRating: Google ignores,
// and may penalise, ratings a business publishes about itself.
import { BUSINESS, EMAIL, GOOGLE_PROFILE_URL, PHONE, SOCIAL_PROFILES } from '../../data/contact.ts';
import { COURSES, isOnRequest } from '../../data/courses.ts';
import { CREDENTIALS } from '../../data/credentials.ts';
import { routePath } from '../../i18n/routes.ts';
import { LANG_TAGS, type Locale } from '../../i18n/types.ts';
import { formatCHF } from '../format.ts';

export interface JsonLdInput {
  readonly locale: Locale;
  /** Origin of the site, without a trailing slash: `https://dive.bullesenvalais.ch`. */
  readonly site: string;
  readonly description: string;
  readonly labels: { readonly jobTitle: string; readonly catalogName: string };
  readonly faq?: readonly FaqEntry[];
}

export interface FaqEntry {
  readonly question: string;
  readonly answer: string;
}

/** Structured data of a landing page: its course, its FAQ and its place under the home page. */
export interface LandingJsonLdInput {
  readonly site: string;
  readonly locale: Locale;
  /** Canonical URL of the page. */
  readonly url: string;
  readonly name: string;
  readonly description: string;
  /** Price in CHF of the course the page offers. */
  readonly price: number;
  readonly faq: readonly FaqEntry[];
  /** Name of the home page in the breadcrumb. */
  readonly breadcrumbHome: string;
}

type Node = Readonly<Record<string, unknown>>;

const AREAS_SERVED = ['Valais', 'Vaud'];

function ids(site: string) {
  const id = (name: string) => ({ '@id': `${site}/#${name}` });
  return {
    website: id('website'),
    business: id('business'),
    person: id('nicholas'),
    catalog: id('courses'),
    faq: id('faq'),
  };
}

function catalog(input: JsonLdInput, ref: ReturnType<typeof ids>): Node {
  const offers = COURSES.flatMap((course) =>
    isOnRequest(course.price)
      ? []
      : [
          {
            '@type': 'Offer',
            price: course.price.amount,
            priceCurrency: course.price.currency,
            itemOffered: {
              '@type': 'Course',
              name: course.name[input.locale],
              provider: ref.business,
            },
          },
        ],
  );
  return {
    '@type': 'OfferCatalog',
    ...ref.catalog,
    name: input.labels.catalogName,
    itemListElement: offers,
  };
}

function faqPage(faq: readonly FaqEntry[], id: Node): Node {
  return {
    '@type': 'FAQPage',
    ...id,
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/** « CHF 80 – CHF 1090 »: the cheapest and dearest courses with a price (not on request). */
function priceRange(locale: Locale): string {
  const amounts = COURSES.flatMap((course) =>
    isOnRequest(course.price) ? [] : [course.price.amount],
  );
  return `${formatCHF(Math.min(...amounts), locale)} – ${formatCHF(Math.max(...amounts), locale)}`;
}

function person(input: JsonLdInput, ref: ReturnType<typeof ids>): Node {
  return {
    '@type': 'Person',
    ...ref.person,
    name: BUSINESS.owner,
    jobTitle: input.labels.jobTitle,
    worksFor: ref.business,
    hasCredential: CREDENTIALS.map((credential) => ({
      '@type': 'EducationalOccupationalCredential',
      name: `${credential.issuer} ${credential.detail}`,
      ...('verifyUrl' in credential ? { url: credential.verifyUrl } : {}),
    })),
  };
}

function business(input: JsonLdInput, ref: ReturnType<typeof ids>, url: string): Node {
  const { site, locale } = input;
  return {
    '@type': 'LocalBusiness',
    ...ref.business,
    name: BUSINESS.name,
    url,
    description: input.description,
    priceRange: priceRange(locale),
    currenciesAccepted: 'CHF',
    logo: `${site}/icon-512.png`,
    image: `${site}/og/og-${locale}.jpg`,
    telephone: PHONE.href.replace('tel:', ''),
    email: EMAIL,
    areaServed: AREAS_SERVED.map((name) => ({ '@type': 'AdministrativeArea', name })),
    founder: ref.person,
    hasOfferCatalog: ref.catalog,
    sameAs: [...SOCIAL_PROFILES.map((profile) => profile.url), GOOGLE_PROFILE_URL],
  };
}

export function buildJsonLd(input: JsonLdInput): Node {
  const ref = ids(input.site);
  const url = `${input.site}${routePath('home', input.locale)}`;
  const nodes: Node[] = [
    {
      '@type': 'WebSite',
      ...ref.website,
      url,
      name: BUSINESS.name,
      inLanguage: LANG_TAGS[input.locale],
      publisher: ref.business,
    },
    business(input, ref, url),
    person(input, ref),
    catalog(input, ref),
  ];
  if (input.faq && input.faq.length > 0) {
    nodes.push(faqPage(input.faq, ref.faq));
  }
  return {
    '@context': 'https://schema.org',
    '@graph': nodes,
  };
}

export function buildLandingJsonLd(input: LandingJsonLdInput): Node {
  const { site, locale, url } = input;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Course',
        '@id': `${url}#course`,
        name: input.name,
        description: input.description,
        // The business described once, on the home page: referenced, never declared again.
        provider: ids(site).business,
        offers: [
          {
            '@type': 'Offer',
            price: input.price,
            priceCurrency: 'CHF',
            availability: 'https://schema.org/InStock',
            url,
          },
        ],
      },
      faqPage(input.faq, { '@id': `${url}#faq` }),
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: input.breadcrumbHome,
            item: `${site}${routePath('home', locale)}`,
          },
          { '@type': 'ListItem', position: 2, name: input.name, item: url },
        ],
      },
    ],
  };
}

/** JSON for a `<script type="application/ld+json">`: `<` escaped, so it cannot close the script. */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}
