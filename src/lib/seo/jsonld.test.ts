import { describe, expect, it } from 'vitest';
import { COURSES, isOnRequest } from '../../data/courses.ts';
import { CREDENTIALS } from '../../data/credentials.ts';
import { EMAIL, GOOGLE_PROFILE_URL, SOCIAL_PROFILES } from '../../data/contact.ts';
import { formatCHF } from '../format.ts';
import { routePath } from '../../i18n/routes.ts';
import { buildJsonLd, buildLandingJsonLd, serializeJsonLd, type JsonLdInput } from './jsonld.ts';

const SITE = 'https://dive.bullesenvalais.ch';

const input = (locale: 'fr' | 'en'): JsonLdInput => ({
  locale,
  site: SITE,
  description: 'Description',
  labels: { jobTitle: 'Instructeur', catalogName: 'Cours' },
});

type Node = Record<string, unknown>;

function nodeOfType(graph: readonly Node[], type: string): Node {
  const node = graph.find((item) => item['@type'] === type);
  if (node === undefined) throw new Error(`No ${type} node`);
  return node;
}

/** Every value of a JSON tree, keys excluded. */
function values(value: unknown): unknown[] {
  if (Array.isArray(value)) return value.flatMap(values);
  if (value !== null && typeof value === 'object') return Object.values(value).flatMap(values);
  return [value];
}

describe('buildJsonLd', () => {
  const ld = buildJsonLd(input('fr'));
  const graph = ld['@graph'] as Node[];

  it('is one schema.org graph of WebSite, LocalBusiness, Person and OfferCatalog', () => {
    expect(ld['@context']).toBe('https://schema.org');
    expect(graph.map((node) => node['@type'])).toEqual([
      'WebSite',
      'LocalBusiness',
      'Person',
      'OfferCatalog',
    ]);
  });

  it('links the nodes by @id on the site', () => {
    const ids = graph.map((node) => node['@id'] as string);
    for (const id of ids) expect(id.startsWith(`${SITE}/#`)).toBe(true);
    const business = nodeOfType(graph, 'LocalBusiness');
    expect(business.founder).toEqual({ '@id': `${SITE}/#nicholas` });
    expect(business.hasOfferCatalog).toEqual({ '@id': `${SITE}/#courses` });
    expect(nodeOfType(graph, 'WebSite').publisher).toEqual({ '@id': `${SITE}/#business` });
  });

  it('describes the business from src/data, without postal address nor rating', () => {
    const business = nodeOfType(graph, 'LocalBusiness');
    expect(business).toMatchObject({
      name: 'Bulles en Valais',
      url: `${SITE}/`,
      email: EMAIL,
      telephone: '+41794368112',
      description: 'Description',
      logo: `${SITE}/icon-512.png`,
      image: `${SITE}/og/og-fr.jpg`,
    });
    expect(business.areaServed).toEqual([
      { '@type': 'AdministrativeArea', name: 'Valais' },
      { '@type': 'AdministrativeArea', name: 'Vaud' },
    ]);
    expect(business.sameAs).toEqual([
      ...SOCIAL_PROFILES.map((profile) => profile.url),
      GOOGLE_PROFILE_URL,
    ]);
    expect(business).not.toHaveProperty('address');
    const priced = COURSES.flatMap((c) => (isOnRequest(c.price) ? [] : [c.price.amount]));
    const min = Math.min(...priced);
    const max = Math.max(...priced);
    expect(business.priceRange).toBe(`${formatCHF(min, 'fr')} – ${formatCHF(max, 'fr')}`);
    expect(JSON.stringify(ld)).not.toMatch(/Rating|review/i);
  });

  it('lists every credential of Nicholas', () => {
    const person = nodeOfType(graph, 'Person');
    expect(person).toMatchObject({ name: 'Nicholas Jallan', jobTitle: 'Instructeur' });
    expect(person.hasCredential).toHaveLength(CREDENTIALS.length);
    expect(person.hasCredential).toContainEqual({
      '@type': 'EducationalOccupationalCredential',
      name: 'DEJEPS 07425ED0350',
      url: 'https://recherche-educateur.sports.gouv.fr/CartePro/07425ED0350',
    });
  });

  it('offers every priced course in CHF, and only those', () => {
    const catalog = nodeOfType(graph, 'OfferCatalog');
    const offers = catalog.itemListElement as Node[];
    const priced = COURSES.filter((course) => !isOnRequest(course.price));
    expect(catalog.name).toBe('Cours');
    expect(offers).toHaveLength(priced.length);
    for (const offer of offers) {
      expect(offer['@type']).toBe('Offer');
      expect(offer.priceCurrency).toBe('CHF');
      expect(typeof offer.price).toBe('number');
      expect(offer.itemOffered).toMatchObject({
        '@type': 'Course',
        provider: { '@id': `${SITE}/#business` },
      });
    }
  });

  it('uses the English names, URL and image on the English page', () => {
    const en = buildJsonLd(input('en'))['@graph'] as Node[];
    expect(nodeOfType(en, 'WebSite')).toMatchObject({ url: `${SITE}/en/`, inLanguage: 'en' });
    expect(nodeOfType(en, 'LocalBusiness').image).toBe(`${SITE}/og/og-en.jpg`);
    const names = (nodeOfType(en, 'OfferCatalog').itemListElement as Node[]).map(
      (offer) => (offer.itemOffered as Node).name,
    );
    expect(names).toContain('TDI Advanced Nitrox');
  });

  it('contains no undefined, null or empty value', () => {
    for (const locale of ['fr', 'en'] as const) {
      for (const value of values(buildJsonLd(input(locale)))) {
        expect(value === undefined || value === null || value === '').toBe(false);
      }
    }
  });

  it('includes an FAQPage node when FAQ items are provided', () => {
    const withFaq = buildJsonLd({
      ...input('fr'),
      faq: [{ question: 'Q1', answer: 'A1' }],
    });
    const nodes = withFaq['@graph'] as Node[];
    expect(nodes.map((n) => n['@type'])).toContain('FAQPage');
    const faq = nodeOfType(nodes, 'FAQPage');
    expect(faq.mainEntity).toEqual([
      {
        '@type': 'Question',
        name: 'Q1',
        acceptedAnswer: { '@type': 'Answer', text: 'A1' },
      },
    ]);
  });
});

describe('buildLandingJsonLd', () => {
  const landingInput = {
    site: SITE,
    locale: 'fr' as const,
    url: `${SITE}/bapteme-plongee-valais/`,
    name: 'Baptême de plongée en Valais',
    description: 'Premier baptême de plongée en lac alpin',
    price: 90,
    faq: [{ question: 'Combien de temps ?', answer: '2 heures' }],
    breadcrumbHome: 'Accueil',
  };

  it('builds a graph containing Course, FAQPage, and BreadcrumbList', () => {
    const ld = buildLandingJsonLd(landingInput);
    const graph = ld['@graph'] as Node[];
    expect(ld['@context']).toBe('https://schema.org');
    expect(graph.map((n) => n['@type'])).toEqual(['Course', 'FAQPage', 'BreadcrumbList']);
  });

  it('references the main LocalBusiness as provider without redeclaring it', () => {
    const ld = buildLandingJsonLd(landingInput);
    const graph = ld['@graph'] as Node[];
    const course = nodeOfType(graph, 'Course');
    const homeBusiness = nodeOfType(buildJsonLd(input('fr'))['@graph'] as Node[], 'LocalBusiness');
    expect(course.provider).toEqual({ '@id': `${SITE}/#business` });
    expect(course.provider).toEqual({ '@id': homeBusiness['@id'] });
  });

  it('declares the offer with the course price in CHF and inStock availability', () => {
    const ld = buildLandingJsonLd(landingInput);
    const graph = ld['@graph'] as Node[];
    const course = nodeOfType(graph, 'Course');
    expect(course['@id']).toBe(`${landingInput.url}#course`);
    expect(course.name).toBe(landingInput.name);
    expect(course.description).toBe(landingInput.description);
    expect(course.offers).toEqual([
      {
        '@type': 'Offer',
        price: 90,
        priceCurrency: 'CHF',
        availability: 'https://schema.org/InStock',
        url: landingInput.url,
      },
    ]);
  });

  it('structures the FAQPage and BreadcrumbList', () => {
    const ld = buildLandingJsonLd(landingInput);
    const graph = ld['@graph'] as Node[];
    const faq = nodeOfType(graph, 'FAQPage');
    expect(faq['@id']).toBe(`${landingInput.url}#faq`);
    expect(faq.mainEntity).toEqual([
      {
        '@type': 'Question',
        name: 'Combien de temps ?',
        acceptedAnswer: { '@type': 'Answer', text: '2 heures' },
      },
    ]);

    const breadcrumbs = nodeOfType(graph, 'BreadcrumbList');
    expect(breadcrumbs.itemListElement).toEqual([
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: `${SITE}${routePath('home', 'fr')}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: landingInput.name,
        item: landingInput.url,
      },
    ]);
  });
});

describe('serializeJsonLd', () => {
  it('is valid JSON that cannot close its script element', () => {
    const text = serializeJsonLd({ name: '</script><script>alert(1)</script>' });
    expect(text).not.toContain('<');
    expect(JSON.parse(text)).toEqual({ name: '</script><script>alert(1)</script>' });
  });
});
