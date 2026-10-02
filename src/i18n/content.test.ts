import { describe, expect, it } from 'vitest';
import { EMAIL, PHONE } from '../data/contact.ts';
import { getDictionary } from './index.ts';
import { LOCALES } from './types.ts';

interface Link {
  readonly label: string;
  readonly href: string;
  readonly external?: boolean;
}

/** Every link of the Rich texts of a value. */
function linksOf(value: unknown): Link[] {
  if (Array.isArray(value)) return value.flatMap(linksOf);
  if (value === null || typeof value !== 'object') return [];
  const record = value as Record<string, unknown>;
  const own = 'link' in record ? [record.link as Link] : [];
  return [...own, ...Object.values(record).flatMap(linksOf)];
}

describe.each(LOCALES)('%s testimonials', (locale) => {
  it('never show two reviews of the same name side by side (two Alexandre F.)', () => {
    const authors = getDictionary(locale).testimonials.items.map((item) => item.author);
    for (let index = 1; index < authors.length; index += 1) {
      expect(authors[index], `items ${index - 1} and ${index}`).not.toBe(authors[index - 1]);
    }
  });
});

describe.each(LOCALES)('%s links', (locale) => {
  const links = linksOf(getDictionary(locale));

  it('write the e-mail address of src/data/contact.ts', () => {
    const mail = links.filter((link) => link.href.startsWith('mailto:'));
    expect(mail.length).toBeGreaterThan(0);
    for (const link of mail) expect(link).toEqual({ label: EMAIL, href: `mailto:${EMAIL}` });
  });

  it('write the phone number of src/data/contact.ts', () => {
    const phone = links.filter((link) => link.href.startsWith('tel:'));
    expect(phone.length).toBeGreaterThan(0);
    for (const link of phone) expect(link).toEqual({ label: PHONE.display, href: PHONE.href });
  });

  it('open other sites over HTTPS, in a new tab', () => {
    const web = links.filter((link) => !/^(mailto|tel):/.test(link.href));
    expect(web.length).toBeGreaterThan(0);
    for (const link of web) {
      expect(link.href).toMatch(/^https:\/\//);
      expect(link.external, link.href).toBe(true);
    }
  });
});
