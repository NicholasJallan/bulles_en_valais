import { describe, expect, it } from 'vitest';
import { blankStrings } from '../test/content-checks.ts';
import { CREDENTIALS } from './credentials.ts';

describe('CREDENTIALS', () => {
  it('lists SDI/TDI first, as everywhere since S00', () => {
    expect(CREDENTIALS.map((credential) => credential.id)).toEqual([
      'sdi-tdi',
      'padi',
      'ffessm',
      'dejeps',
      'cah',
    ]);
  });

  it('only links to public registers over HTTPS', () => {
    for (const credential of CREDENTIALS) {
      if ('verifyUrl' in credential) expect(credential.verifyUrl).toMatch(/^https:\/\//);
    }
  });

  it('has no empty field', () => {
    expect(blankStrings(CREDENTIALS)).toEqual([]);
  });
});
