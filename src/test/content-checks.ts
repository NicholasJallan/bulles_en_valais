// Generic checks on dictionaries and localized data. They know nothing about the Dictionary type,
// so they keep working as sections, data and locales are added.

export function kindOf(value: unknown): string {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
}

function childPath(path: string, key: string | number): string {
  if (typeof key === 'number') return `${path}[${key}]`;
  return path === '' ? key : `${path}.${key}`;
}

function displayPath(path: string): string {
  return path === '' ? '(root)' : path;
}

/** Differences in keys, value kinds and array lengths, one message per path. */
export function structureIssues(reference: unknown, candidate: unknown, path = ''): string[] {
  const expected = kindOf(reference);
  const actual = kindOf(candidate);
  if (expected !== actual) return [`${displayPath(path)}: expected ${expected}, got ${actual}`];

  if (Array.isArray(reference) && Array.isArray(candidate)) {
    if (reference.length !== candidate.length) {
      return [`${displayPath(path)}: expected ${reference.length} items, got ${candidate.length}`];
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

/** Every string of a value, with its path. */
export function stringEntries(value: unknown, path = ''): Array<readonly [string, string]> {
  if (typeof value === 'string') return [[displayPath(path), value]];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => stringEntries(item, childPath(path, index)));
  }
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) =>
      stringEntries(item, childPath(path, key)),
    );
  }
  return [];
}

/** Paths of the empty or whitespace-only strings. */
export function blankStrings(value: unknown): string[] {
  return stringEntries(value)
    .filter(([, text]) => text.trim() === '')
    .map(([path]) => path);
}

const HTML_PATTERN = /<\/?[a-z][^>]*>|&(?:[a-z]+|#\d+|#x[\da-f]+);/i;

/** Paths of the strings that contain HTML tags or entities (texts are plain, links use Rich). */
export function htmlStrings(value: unknown): string[] {
  return stringEntries(value)
    .filter(([, text]) => HTML_PATTERN.test(text))
    .map(([path]) => path);
}

const TODO_PATTERN = /TODO\(I-\d{2}\)/g;

/** `TODO(I-xx)` markers of a value, by path: a missing input of Nicholas. */
export function todoMarkers(value: unknown): Map<string, string> {
  return new Map(
    stringEntries(value)
      .map(([path, text]) => [path, [...text.matchAll(TODO_PATTERN)].map(([m]) => m)] as const)
      .filter(([, markers]) => markers.length > 0)
      .map(([path, markers]) => [path, [...new Set(markers)].sort().join(' ')] as const),
  );
}

/** Paths whose `TODO(I-xx)` markers differ between two dictionaries. */
export function todoIssues(reference: unknown, candidate: unknown): string[] {
  const expected = todoMarkers(reference);
  const actual = todoMarkers(candidate);
  const paths = [...new Set([...expected.keys(), ...actual.keys()])].sort();
  return paths
    .filter((path) => expected.get(path) !== actual.get(path))
    .map((path) => `${path}: ${expected.get(path) ?? 'none'} ≠ ${actual.get(path) ?? 'none'}`);
}

function isLocalized(value: object, locales: readonly string[]): boolean {
  const keys = Object.keys(value);
  return keys.length === locales.length && locales.every((locale) => keys.includes(locale));
}

/**
 * Localized records (`{ fr, en }`) of a data structure whose locales differ in kind or in
 * `TODO(I-xx)` markers. Blank strings are found by `blankStrings`, missing keys by TypeScript.
 */
export function localizedIssues(value: unknown, locales: readonly string[], path = ''): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => localizedIssues(item, locales, childPath(path, index)));
  }
  if (value === null || typeof value !== 'object') return [];
  if (isLocalized(value, locales)) {
    const record = value as Record<string, unknown>;
    const [reference, ...others] = locales;
    return others.flatMap((locale) => {
      const where = `${displayPath(path)} (${reference} → ${locale})`;
      const kinds = structureIssues(record[reference], record[locale]);
      const todos = todoIssues(record[reference], record[locale]);
      return [...kinds, ...todos].map((issue) => `${where}: ${issue}`);
    });
  }
  return Object.entries(value).flatMap(([key, item]) =>
    localizedIssues(item, locales, childPath(path, key)),
  );
}
