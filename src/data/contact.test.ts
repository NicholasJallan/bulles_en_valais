import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LOCALES } from '../i18n/types.ts';
import { blankStrings, localizedIssues } from '../test/content-checks.ts';
import {
  GOOGLE_PROFILE_URL,
  INTEREST_LABELS,
  INTERESTS,
  PHONE,
  SOCIAL_PROFILES,
  WHATSAPP_NUMBER,
  whatsappUrl,
} from './contact.ts';

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

describe('SOCIAL_PROFILES', () => {
  it('link to the public profiles over HTTPS, with the handle in the address', () => {
    expect(SOCIAL_PROFILES.length).toBeGreaterThan(0);
    for (const profile of SOCIAL_PROFILES) {
      expect(profile.url).toMatch(/^https:\/\//);
      expect(profile.url).toContain(profile.handle.replace(/^@/, ''));
    }
  });
});

describe('GOOGLE_PROFILE_URL', () => {
  it('links to the Google Maps profile over HTTPS', () => {
    expect(GOOGLE_PROFILE_URL).toMatch(/^https:\/\/maps\.app\.goo\.gl\//);
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
