import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LOCALES } from '../i18n/types.ts';
import { blankStrings, localizedIssues } from '../test/content-checks.ts';
import { INTEREST_LABELS, INTERESTS, PHONE, WHATSAPP_NUMBER, whatsappUrl } from './contact.ts';

/** `ALLOWED_INTERESTS` of the contact endpoint, read from its source. */
function allowedInterestsOfEndpoint(): string[] {
  const php = readFileSync(new URL('../../public/api/contact.php', import.meta.url), 'utf8');
  const list = /const ALLOWED_INTERESTS = \[([^\]]*)\];/.exec(php)?.[1];
  if (list === undefined) throw new Error('ALLOWED_INTERESTS not found in contact.php');
  return [...list.matchAll(/'([^']+)'/g)].map(([, value]) => value);
}

describe('whatsappUrl', () => {
  it('links to the chat without a message', () => {
    expect(whatsappUrl()).toBe('https://wa.me/41794368112');
    expect(whatsappUrl('   ')).toBe('https://wa.me/41794368112');
  });

  it('writes the message in advance, trimmed and encoded', () => {
    expect(whatsappUrl('  Bonjour Nicholas, baptême ?\n')).toBe(
      'https://wa.me/41794368112?text=Bonjour%20Nicholas%2C%20bapt%C3%AAme%20%3F',
    );
  });
});

describe('contact details', () => {
  it('uses the same number for the phone and WhatsApp', () => {
    const digits = PHONE.display.replace(/\D/g, '');
    expect(PHONE.href).toBe(`tel:+${digits}`);
    expect(WHATSAPP_NUMBER).toBe(digits);
  });
});

describe('form interests', () => {
  it('are exactly the values the endpoint accepts', () => {
    expect([...INTERESTS].sort()).toEqual(allowedInterestsOfEndpoint().sort());
  });

  it('include the gift voucher, and end with « other », the fallback of the endpoint', () => {
    expect(INTERESTS).toContain('gift');
    expect(INTERESTS.at(-1)).toBe('other');
  });

  it('are unique', () => {
    expect(new Set(INTERESTS).size).toBe(INTERESTS.length);
  });

  it('have a label in every language', () => {
    expect(blankStrings(INTEREST_LABELS)).toEqual([]);
    expect(localizedIssues(INTEREST_LABELS, LOCALES)).toEqual([]);
  });
});
