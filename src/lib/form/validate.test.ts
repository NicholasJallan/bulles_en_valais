import { describe, expect, it } from 'vitest';
import { LIMITS, normalizeFields, validateContact, type ContactFields } from './validate.ts';

const VALID: ContactFields = {
  name: 'Maude Martin',
  email: 'maude@example.ch',
  phone: '',
  interest: 'sdi-owd',
  message: 'Bonjour, je voudrais passer mon Open Water.',
};

const errorsOf = (fields: Partial<ContactFields>) => validateContact({ ...VALID, ...fields });

describe('validateContact', () => {
  it('accepts a complete form', () => {
    expect(validateContact(VALID)).toEqual({});
  });

  it('accepts an empty phone and an empty message, as contact.php does', () => {
    expect(errorsOf({ phone: '', message: '' })).toEqual({});
  });

  describe('name', () => {
    it('is required, blanks do not count', () => {
      expect(errorsOf({ name: '' })).toEqual({ name: 'required' });
      expect(errorsOf({ name: '   ' })).toEqual({ name: 'required' });
    });

    it('holds 100 characters at most, counted as characters, not UTF-16 units', () => {
      expect(errorsOf({ name: 'é'.repeat(LIMITS.name) })).toEqual({});
      expect(errorsOf({ name: '🤿'.repeat(LIMITS.name) })).toEqual({});
      expect(errorsOf({ name: 'a'.repeat(LIMITS.name + 1) })).toEqual({ name: 'tooLong' });
    });

    it('counts control characters as spaces, then trims', () => {
      expect(errorsOf({ name: '\u0007' })).toEqual({ name: 'required' });
    });
  });

  describe('email', () => {
    it('is required', () => {
      expect(errorsOf({ email: ' ' })).toEqual({ email: 'required' });
    });

    it.each([
      'vous@exemple.ch',
      'first.last+tag@sub.example.com',
      "o'brien@example.ie",
      'a@b-c.example.org',
      'x@xn--bcher-kva.ch',
    ])('accepts %s', (email) => {
      expect(errorsOf({ email })).toEqual({});
    });

    it.each([
      'plain',
      'no-domain@',
      '@no-local.ch',
      'no-dot@localhost',
      'two@@example.ch',
      '.lead@example.ch',
      'trail.@example.ch',
      'dou..ble@example.ch',
      'a@-start.ch',
      'a@end-.ch',
      'a@example..ch',
      'a@example.123',
      '"quoted"@example.ch',
      'enc=?utf-8?@example.ch',
      'é@example.ch',
      'a b@example.ch',
      'a@exa_mple.ch',
    ])('refuses %s', (email) => {
      expect(errorsOf({ email })).toEqual({ email: 'email' });
    });

    it('refuses more than 254 characters and a local part over 64', () => {
      const domain = `${'d'.repeat(63)}.${'e'.repeat(63)}.${'f'.repeat(63)}.ch`;
      expect(errorsOf({ email: `${'a'.repeat(64)}@${domain}` })).toEqual({ email: 'email' });
      expect(errorsOf({ email: `${'a'.repeat(65)}@example.ch` })).toEqual({ email: 'email' });
      expect(errorsOf({ email: `${'a'.repeat(64)}@example.ch` })).toEqual({});
    });
  });

  describe('phone', () => {
    it('is free text: notes, slashes and no-break spaces pass', () => {
      expect(errorsOf({ phone: '079/436 81 12' })).toEqual({});
      expect(errorsOf({ phone: '079 123 45 67 (soir)' })).toEqual({});
      expect(errorsOf({ phone: '079 436 81 12' })).toEqual({});
    });

    it('holds 40 characters at most', () => {
      expect(errorsOf({ phone: '1'.repeat(LIMITS.phone) })).toEqual({});
      expect(errorsOf({ phone: '1'.repeat(LIMITS.phone + 1) })).toEqual({ phone: 'tooLong' });
    });
  });

  describe('message', () => {
    it('holds 5000 characters at most', () => {
      expect(errorsOf({ message: 'm'.repeat(LIMITS.message) })).toEqual({});
      expect(errorsOf({ message: 'm'.repeat(LIMITS.message + 1) })).toEqual({
        message: 'tooLong',
      });
    });
  });

  it('reports every invalid field at once', () => {
    expect(errorsOf({ name: '', email: 'nope', phone: '1'.repeat(41) })).toEqual({
      name: 'required',
      email: 'email',
      phone: 'tooLong',
    });
  });
});

describe('normalizeFields', () => {
  it('trims every field and turns control characters of one-line fields into spaces', () => {
    expect(
      normalizeFields({
        name: '  Ana\tLopez ',
        email: ' ana@example.ch ',
        phone: '079\n123',
        interest: 'gift',
        message: '  Ligne 1\nLigne 2  ',
      }),
    ).toEqual({
      name: 'Ana Lopez',
      email: 'ana@example.ch',
      phone: '079 123',
      interest: 'gift',
      message: 'Ligne 1\nLigne 2',
    });
  });

  it('returns a new object', () => {
    const fields = { ...VALID };
    expect(normalizeFields(fields)).not.toBe(fields);
  });
});
