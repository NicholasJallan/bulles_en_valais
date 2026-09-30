import { describe, expect, it } from 'vitest';
import { getDictionary } from './index.ts';
import { DEFAULT_LOCALE, LOCALES } from './types.ts';

// Generic checks: they know nothing about the Dictionary type, so they keep
// working as sections (and locales) are added.

function kindOf(value: unknown): string {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
}

function childPath(path: string, key: string | number): string {
  if (typeof key === 'number') return `${path}[${key}]`;
  return path === '' ? key : `${path}.${key}`;
}

/** Differences in keys, value kinds and array lengths, one message per path. */
function structureIssues(reference: unknown, candidate: unknown, path = ''): string[] {
  const where = path === '' ? '(root)' : path;
  const expected = kindOf(reference);
  const actual = kindOf(candidate);
  if (expected !== actual) return [`${where}: expected ${expected}, got ${actual}`];

  if (Array.isArray(reference) && Array.isArray(candidate)) {
    if (reference.length !== candidate.length) {
      return [`${where}: expected ${reference.length} items, got ${candidate.length}`];
    }
    return reference.flatMap((item, index) =>
      structureIssues(item, candidate[index], childPath(path, index)),
    );
  }

  if (expected !== 'object') return [];
  const ref = reference as Record<string, unknown>;
  const cand = candidate as Record<string, unknown>;
  const refKeys = Object.keys(ref);
  const candKeys = Object.keys(cand);
  return [
    ...refKeys
      .filter((key) => !Object.hasOwn(cand, key))
      .map((key) => `${childPath(path, key)}: missing`),
    ...candKeys
      .filter((key) => !Object.hasOwn(ref, key))
      .map((key) => `${childPath(path, key)}: unexpected`),
    ...refKeys
      .filter((key) => Object.hasOwn(cand, key))
      .flatMap((key) => structureIssues(ref[key], cand[key], childPath(path, key))),
  ];
}

/** Paths of the empty or whitespace-only strings. */
function blankStrings(value: unknown, path = ''): string[] {
  if (typeof value === 'string') return value.trim() === '' ? [path === '' ? '(root)' : path] : [];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => blankStrings(item, childPath(path, index)));
  }
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) => blankStrings(item, childPath(path, key)));
  }
  return [];
}

describe('structureIssues', () => {
  it('accepts the same structure with different strings', () => {
    expect(structureIssues({ a: 'x', b: [{ c: 'y' }] }, { a: 'z', b: [{ c: 'w' }] })).toEqual([]);
  });

  it('reports missing and unexpected keys', () => {
    expect(structureIssues({ a: 'x', b: 'y' }, { a: 'x', c: 'z' })).toEqual([
      'b: missing',
      'c: unexpected',
    ]);
  });

  it('reports a different kind of value', () => {
    expect(structureIssues({ a: { b: 'x' } }, { a: { b: ['x'] } })).toEqual([
      'a.b: expected string, got array',
    ]);
  });

  it('reports arrays of different lengths', () => {
    expect(structureIssues({ faq: ['q1', 'q2'] }, { faq: ['q1'] })).toEqual([
      'faq: expected 2 items, got 1',
    ]);
  });

  it('compares array items one by one', () => {
    expect(structureIssues({ items: [{ a: 'x' }] }, { items: [{ b: 'x' }] })).toEqual([
      'items[0].a: missing',
      'items[0].b: unexpected',
    ]);
  });
});

describe('blankStrings', () => {
  it('reports empty and whitespace-only strings with their path', () => {
    expect(blankStrings({ a: '', b: { c: '  ' }, d: ['ok', '\n'] })).toEqual(['a', 'b.c', 'd[1]']);
  });
});

describe('dictionaries', () => {
  it.each(LOCALES)('%s contains no empty string', (locale) => {
    expect(blankStrings(getDictionary(locale))).toEqual([]);
  });

  it.each(LOCALES.filter((locale) => locale !== DEFAULT_LOCALE))(
    `%s mirrors the structure of ${DEFAULT_LOCALE}`,
    (locale) => {
      expect(structureIssues(getDictionary(DEFAULT_LOCALE), getDictionary(locale))).toEqual([]);
    },
  );
});
