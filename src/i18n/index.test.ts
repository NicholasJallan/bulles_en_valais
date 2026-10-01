import { describe, expect, it } from 'vitest';
import { structureIssues } from '../test/content-checks.ts';
import { en } from './en.ts';
import { fr } from './fr.ts';
import { getDictionary, localePath, localize } from './index.ts';

const NBSP = '\u00a0';
const NNBSP = '\u202f';

describe('getDictionary', () => {
  it('returns the texts of each locale, with the structure of their source', () => {
    expect(structureIssues(fr, getDictionary('fr'))).toEqual([]);
    expect(structureIssues(en, getDictionary('en'))).toEqual([]);
    expect(getDictionary('en').hero.title).toEqual(en.hero.title);
  });

  it('typesets the texts for their language', () => {
    expect(getDictionary('fr').depthLadder.title).toEqual({
      before: 'Jusqu’où',
      em: `irez-vous${NNBSP}?`,
    });
    expect(getDictionary('fr').contact.form.errorSummary).toBe(`Merci de vérifier${NBSP}:`);
    expect(getDictionary('en').contact.title.before).toBe('Underwater, we don’t talk.');
  });

  it('leaves the link targets as they are', () => {
    const [, link] = getDictionary('fr').prepare.gear.items[2].text;
    expect(link).toEqual({
      link: { label: 'plongee.ch', href: 'https://www.plongee.ch', external: true },
    });
  });
});

describe('localize', () => {
  it('picks the text of a locale and typesets it', () => {
    const label = { fr: "Plongée de nuit : l'obscurité", en: 'Night dive: the dark' };
    expect(localize(label, 'fr')).toBe(`Plongée de nuit${NBSP}: l’obscurité`);
    expect(localize(label, 'en')).toBe('Night dive: the dark');
  });
});

describe('localePath', () => {
  it('leaves paths of the default locale unprefixed', () => {
    expect(localePath('fr', '/')).toBe('/');
    expect(localePath('fr', '/#contact')).toBe('/#contact');
  });

  it('prefixes paths of the other locales', () => {
    expect(localePath('en', '/')).toBe('/en/');
    expect(localePath('en', '/privacy/')).toBe('/en/privacy/');
    expect(localePath('en', '/#contact')).toBe('/en/#contact');
  });

  it('rejects relative and protocol-relative paths', () => {
    expect(() => localePath('en', 'privacy/')).toThrow(/absolute path/);
    expect(() => localePath('fr', '//example.com/')).toThrow(/absolute path/);
  });
});
