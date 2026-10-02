// Structured data of the home page (02-architecture.md §13): one schema.org @graph built from
// src/data. No postal address (I-08) and no AggregateRating: Google ignores, and may penalise,
// ratings a business publishes about itself.
import { BUSINESS, EMAIL, GOOGLE_PROFILE_URL, PHONE, SOCIAL_PROFILES } from '../../data/contact.ts';
import { COURSES, isOnRequest } from '../../data/courses.ts';
import { CREDENTIALS } from '../../data/credentials.ts';
import { routePath } from '../../i18n/routes.ts';
import { LANG_TAGS, type Locale } from '../../i18n/types.ts';

export interface JsonLdInput {
  readonly locale: Locale;
  /** Origin of the site, without a trailing slash: `https://dive.bullesenvalais.ch`. */
  readonly site: string;
  readonly description: string;
  readonly labels: { readonly jobTitle: string; readonly catalogName: string };
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
  return {
    '@context': 'https://schema.org',
    '@graph': [
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
    ],
  };
}

/** JSON for a `<script type="application/ld+json">`: `<` escaped, so it cannot close the script. */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}
