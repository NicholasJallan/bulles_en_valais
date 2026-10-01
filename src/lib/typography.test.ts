import { describe, expect, it } from 'vitest';
import { typeset, typesetDeep } from './typography.ts';

const NBSP = '\u00a0';
const NNBSP = '\u202f';

describe('typeset', () => {
  it('curls the apostrophes between letters, in every language', () => {
    expect(typeset("L'école, c'est une personne.", 'fr')).toBe('L’école, c’est une personne.');
    expect(typeset("Let's surface, it's fine.", 'en')).toBe('Let’s surface, it’s fine.');
  });

  it('leaves apostrophes that are not inside a word alone', () => {
    expect(typeset("'quoted'", 'en')).toBe("'quoted'");
  });

  it('puts a narrow no-break space before ? ! and ; in French', () => {
    expect(typeset("Jusqu'où irez-vous ?", 'fr')).toBe(`Jusqu’où irez-vous${NNBSP}?`);
    expect(typeset('Merci Nicholas !', 'fr')).toBe(`Merci Nicholas${NNBSP}!`);
    expect(typeset('SDI ; PADI', 'fr')).toBe(`SDI${NNBSP}; PADI`);
  });

  it('puts a no-break space before a colon and inside guillemets in French', () => {
    expect(typeset('Adresse : Sion', 'fr')).toBe(`Adresse${NBSP}: Sion`);
    expect(typeset('le set « palmes, masque, tuba »', 'fr')).toBe(
      `le set «${NBSP}palmes, masque, tuba${NBSP}»`,
    );
  });

  it('leaves English punctuation as written', () => {
    expect(typeset('Unsure? Write: now!', 'en')).toBe('Unsure? Write: now!');
  });

  it('never adds a space where there is none', () => {
    expect(typeset('https://www.plongee.ch', 'fr')).toBe('https://www.plongee.ch');
    expect(typeset('Hésitation?', 'fr')).toBe('Hésitation?');
  });

  it('keeps a number with its unit, and an amount with its currency', () => {
    expect(typeset('jusqu’à 40 % à 18 m, 14 °C, ~ 50 €', 'fr')).toBe(
      `jusqu’à 40${NBSP}% à 18${NBSP}m, 14${NBSP}°C, ~ 50${NBSP}€`,
    );
    expect(typeset('5 min, 2 h, CHF 80', 'fr')).toBe(`5${NBSP}min, 2${NBSP}h, CHF${NBSP}80`);
  });

  it('does not glue a number to a word that only starts like a unit', () => {
    expect(typeset('40 mètres, 2 heures, 3 min.', 'fr')).toBe(`40 mètres, 2 heures, 3${NBSP}min.`);
  });

  it('never starts a line with a dash', () => {
    expect(typeset('Un élève — un instructeur', 'fr')).toBe(`Un élève${NBSP}— un instructeur`);
    expect(typeset('fastest — really', 'en')).toBe(`fastest${NBSP}— really`);
  });
});

describe('typesetDeep', () => {
  const source = {
    title: { before: "Jusqu'où", em: 'irez-vous ?' },
    items: ['Merci !', 42, true, null],
    link: { label: 'Écrire : ici', href: 'https://example.ch/a?b=c ;d' },
  };

  it('typesets every string of a structure except the link targets', () => {
    expect(typesetDeep(source, 'fr')).toEqual({
      title: { before: 'Jusqu’où', em: `irez-vous${NNBSP}?` },
      items: [`Merci${NNBSP}!`, 42, true, null],
      link: { label: `Écrire${NBSP}: ici`, href: 'https://example.ch/a?b=c ;d' },
    });
  });

  it('returns a new structure and leaves the source untouched', () => {
    const copy = structuredClone(source);
    expect(typesetDeep(source, 'fr')).not.toBe(source);
    expect(source).toEqual(copy);
  });
});
