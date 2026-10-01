import { describe, expect, it } from 'vitest';
import { LOCALES } from '../i18n/types.ts';
import { blankStrings, localizedIssues } from '../test/content-checks.ts';
import {
  COURSES,
  type Course,
  type CourseId,
  courseById,
  cursusCourses,
  isOnRequest,
  ladderCourses,
} from './courses.ts';

const ids = (courses: readonly Course[]): string[] => courses.map((course) => course.id);
/** Widened to `Course`, so that optional fields can be read on every entry. */
const ALL_COURSES: readonly Course[] = COURSES;

/** Prices of legacy/components/i18n.jsx (S00, D9), with the changes decided by Nicholas in I-10. */
const LEGACY_PRICES: Readonly<Record<string, number>> = {
  'sdi-owsd': 690,
  'sdi-aad': 450,
  'sdi-rescue': 890,
  // TDI Advanced Nitrox and Decompression Procedures: CHF 250 before I-10 c.
  'tdi-advanced-nitrox': 290,
  'tdi-deco': 290,
  'tdi-nitrox': 290,
  'tdi-dpv': 150,
  'padi-dsd': 90,
  'padi-owd': 790,
  'padi-aowd': 550,
  'padi-rescue': 990,
  'padi-dm': 1090,
  'padi-reactivate': 80,
  'padi-dld': 80,
  'sdi-nitrox': 290,
  'sdi-deep': 290,
  'sdi-navigation': 250,
  'sdi-altitude': 250,
  'sdi-drysuit': 250,
  'sdi-dsmb': 190,
  'sdi-search-recovery': 190,
  'sdi-night': 250,
  'sdi-wreck': 290,
  'sdi-buoyancy': 250,
  'padi-nitrox': 340,
  'padi-deep': 340,
  'padi-navigation': 300,
  'padi-altitude': 300,
  'padi-drysuit': 300,
  'padi-dsmb': 240,
  'padi-search-recovery': 240,
  'padi-night': 300,
  'padi-wreck': 340,
  'padi-buoyancy': 300,
  // FFESSM N1 to N4: the prices of the specialty tab, now shown everywhere (I-10).
  'ffessm-n1': 390,
  'ffessm-n2': 490,
  'ffessm-n3': 690,
  'ffessm-n4': 990,
};

describe('COURSES', () => {
  it('has unique ids', () => {
    expect(new Set(ids(COURSES)).size).toBe(COURSES.length);
  });

  it('keeps the prices of the current site, as amended in I-10', () => {
    const prices = Object.fromEntries(
      COURSES.flatMap(({ id, price }) => (isOnRequest(price) ? [] : [[id, price.amount]])),
    );
    expect(prices).toEqual(LEGACY_PRICES);
  });

  it('only has positive prices in whole Swiss francs', () => {
    for (const { price } of COURSES) {
      if (isOnRequest(price)) continue;
      expect(price.currency).toBe('CHF');
      expect(Number.isInteger(price.amount) && price.amount > 0).toBe(true);
    }
  });

  it('gives a maximum depth to every course of the depth ladder', () => {
    for (const course of ALL_COURSES.filter((entry) => entry.inLadder === true)) {
      expect(course.maxDepth, course.id).toBeGreaterThan(0);
    }
  });

  it('lets every row of a price list open the form on its interest', () => {
    for (const course of ALL_COURSES.filter((entry) => entry.cursus === 'row')) {
      expect(course.formInterest, course.id).toBeDefined();
    }
  });

  it('has its names and lines in every language', () => {
    expect(blankStrings(COURSES)).toEqual([]);
    expect(localizedIssues(COURSES, LOCALES)).toEqual([]);
  });
});

describe('cursusCourses', () => {
  it('lists the price list of each agency in the order of the current site', () => {
    expect(ids(cursusCourses('sdi-tdi', 'row'))).toEqual([
      'sdi-owsd',
      'sdi-aad',
      'sdi-rescue',
      'tdi-advanced-nitrox',
      'tdi-deco',
    ]);
    expect(ids(cursusCourses('padi', 'row'))).toEqual([
      'padi-dsd',
      'padi-owd',
      'padi-aowd',
      'padi-rescue',
      'padi-dm',
    ]);
    expect(ids(cursusCourses('ffessm', 'row'))).toEqual([
      'ffessm-n1',
      'ffessm-n2',
      'ffessm-n3',
      'ffessm-n4',
      'ffessm-pth70',
      'ffessm-pth120',
    ]);
  });

  it('lists the lines under the PADI price list', () => {
    expect(ids(cursusCourses('padi', 'extra'))).toEqual(['padi-reactivate', 'padi-dld']);
    expect(cursusCourses('sdi-tdi', 'extra')).toEqual([]);
  });
});

describe('ladderCourses', () => {
  it('goes from the try-dive to trimix, never upwards', () => {
    const depths = ladderCourses().map((course) => course.maxDepth ?? 0);
    expect(depths).toEqual([...depths].sort((a, b) => a - b));
    expect(ladderCourses().at(0)?.id).toBe('padi-dsd');
    expect(ladderCourses().at(-1)?.id).toBe('ffessm-pth120');
  });

  it('places each certification at the depth validated in I-04', () => {
    const depthOf = (id: CourseId): number | undefined => courseById(id).maxDepth;
    expect(depthOf('padi-dsd')).toBe(6);
    expect([depthOf('sdi-owsd'), depthOf('padi-owd')]).toEqual([18, 18]);
    expect(depthOf('ffessm-n1')).toBe(20);
    expect([depthOf('sdi-aad'), depthOf('padi-aowd')]).toEqual([30, 30]);
    expect(depthOf('ffessm-n2')).toBe(40);
    expect([depthOf('sdi-deep'), depthOf('padi-deep')]).toEqual([40, 40]);
    expect(depthOf('tdi-deco')).toBe(45);
    expect(depthOf('ffessm-n3')).toBe(60);
    expect(depthOf('ffessm-pth70')).toBe(70);
    expect(depthOf('ffessm-pth120')).toBe(120);
  });
});

describe('courseById', () => {
  it('finds a course', () => {
    expect(courseById('padi-dm').price).toEqual({ amount: 1090, currency: 'CHF' });
  });

  it('rejects an unknown id', () => {
    expect(() => courseById('nope' as CourseId)).toThrow(/Unknown course "nope"/);
  });
});

describe('isOnRequest', () => {
  it('tells a price on request from an amount', () => {
    expect(isOnRequest({ onRequest: true })).toBe(true);
    expect(isOnRequest({ amount: 90, currency: 'CHF' })).toBe(false);
  });
});
