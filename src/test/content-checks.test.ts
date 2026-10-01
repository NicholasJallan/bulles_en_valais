import { describe, expect, it } from 'vitest';
import {
  blankStrings,
  htmlStrings,
  localizedIssues,
  stringEntries,
  structureIssues,
  todoIssues,
  todoMarkers,
} from './content-checks.ts';

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
    expect(structureIssues('x', null)).toEqual(['(root): expected string, got null']);
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

describe('stringEntries', () => {
  it('lists every string with its path, and ignores other values', () => {
    expect(stringEntries({ a: 'x', b: [1, 'y', null], c: { d: 'z', e: true } })).toEqual([
      ['a', 'x'],
      ['b[1]', 'y'],
      ['c.d', 'z'],
    ]);
    expect(stringEntries('alone')).toEqual([['(root)', 'alone']]);
  });
});

describe('blankStrings', () => {
  it('reports empty and whitespace-only strings with their path', () => {
    expect(blankStrings({ a: '', b: { c: '  ' }, d: ['ok', '\n'] })).toEqual(['a', 'b.c', 'd[1]']);
  });
});

describe('htmlStrings', () => {
  it('reports tags and entities', () => {
    expect(
      htmlStrings({
        tag: 'see <a href="https://x.ch">x</a>',
        br: 'one<br/>two',
        entity: 'Tom &amp; Jerry',
        numeric: 'n&#8239;m',
      }),
    ).toEqual(['tag', 'br', 'entity', 'numeric']);
  });

  it('accepts plain texts with comparison signs and ampersands', () => {
    expect(htmlStrings({ a: 'EANx ≤ 40 % & > 300 m', b: 'R&D', c: '3 < 4' })).toEqual([]);
  });
});

describe('todoMarkers', () => {
  it('collects the TODO(I-xx) markers of each string, sorted and deduplicated', () => {
    const markers = todoMarkers({
      a: 'Adresse : TODO(I-08)',
      b: ['ok', 'TODO(I-12) puis TODO(I-08) et TODO(I-12)'],
      c: 'TODO without an input number',
    });
    expect([...markers]).toEqual([
      ['a', 'TODO(I-08)'],
      ['b[1]', 'TODO(I-08) TODO(I-12)'],
    ]);
  });
});

describe('todoIssues', () => {
  it('accepts the same markers at the same paths', () => {
    expect(todoIssues({ a: 'x TODO(I-03)' }, { a: 'y TODO(I-03)' })).toEqual([]);
  });

  it('reports a marker present in one dictionary only', () => {
    expect(todoIssues({ a: 'TODO(I-03)', b: 'ok' }, { a: 'ok', b: 'TODO(I-08)' })).toEqual([
      'a: TODO(I-03) ≠ none',
      'b: none ≠ TODO(I-08)',
    ]);
  });
});

describe('localizedIssues', () => {
  const LOCALES = ['fr', 'en'] as const;

  it('accepts localized records with matching kinds and markers', () => {
    const data = [
      { name: { fr: 'Lac', en: 'Lake' }, note: { fr: 'TODO(I-03)', en: 'TODO(I-03)' } },
    ];
    expect(localizedIssues(data, LOCALES)).toEqual([]);
  });

  it('reports a marker missing from one locale', () => {
    const data = { places: [{ access: { fr: 'TODO(I-03)', en: 'Car park' } }] };
    expect(localizedIssues(data, LOCALES)).toEqual([
      'places[0].access (fr → en): (root): TODO(I-03) ≠ none',
    ]);
  });

  it('reports locales holding different kinds of values', () => {
    expect(localizedIssues({ tags: { fr: ['a'], en: 'a' } }, LOCALES)).toEqual([
      'tags (fr → en): (root): expected array, got string',
    ]);
  });

  it('leaves objects that are not localized records alone', () => {
    expect(localizedIssues({ fr: 'x', de: 'y' }, LOCALES)).toEqual([]);
  });
});
