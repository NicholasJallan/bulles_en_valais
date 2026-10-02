// Every visible text of the site, one key per block, in the order of the page
// (plans/refonte-la-descente/01-direction-artistique.md §2). fr.ts and en.ts implement it: TypeScript
// rejects a missing or extra key, parity.test.ts checks the rest. No HTML in the strings: titles with
// an emphasis are `Emphasis`, texts with links are `Rich`. Eyebrows hold their label only: the depth
// marker (« — 12 m ») comes from src/data/sections.ts.
import type { AgencyId } from '../data/courses.ts';
import type { GiftOfferId } from '../data/gifts.ts';
import type { SpecialtyTabId } from '../data/specialties.ts';
import type { Emphasis, Locale, Localized, Rich } from './types.ts';

export interface PageMeta {
  /** ≤ 60 characters. */
  readonly title: string;
  /** ≤ 155 characters. */
  readonly description: string;
}

/** Eyebrow label, title and lead of a section. */
export interface SectionIntro {
  readonly eyebrow: string;
  readonly title: Emphasis;
  readonly lead: string;
}

export interface AgencyText {
  readonly label: string;
  readonly sub: string;
  readonly headline: Emphasis;
  readonly description: string;
  readonly highlights: readonly string[];
  /** Line under the price list. */
  readonly note?: string;
}

export interface InterludeText {
  readonly quote: string;
  readonly imageAlt: string;
  readonly credit: string;
}

export interface Testimonial {
  readonly author: string;
  readonly course: string;
  /** Paragraphs, as the student wrote them. */
  readonly text: readonly string[];
  /** Language of `text`, for the `lang` attribute. */
  readonly lang: Locale;
  readonly translated: boolean;
}

export interface LegalTable {
  readonly caption: string;
  readonly headers: readonly string[];
  /** One row per item; its first cell names it (row header). */
  readonly rows: readonly (readonly string[])[];
}

export interface LegalSection {
  readonly heading: string;
  readonly paragraphs: readonly Rich[];
  readonly list?: readonly string[];
  readonly table?: LegalTable;
}

export interface LegalPage {
  readonly meta: PageMeta;
  readonly title: string;
  readonly updated: string;
  readonly intro: string;
  readonly sections: readonly LegalSection[];
}

export interface Dictionary {
  readonly meta: PageMeta & {
    readonly ogTitle: string;
    readonly ogDescription: string;
    readonly ogImageAlt: string;
    /** Labels of the JSON-LD (src/lib/seo/jsonld.ts), read by search engines only. */
    readonly structuredData: { readonly jobTitle: string; readonly catalogName: string };
  };
  readonly a11y: {
    readonly skipLink: string;
    readonly mainNav: string;
    readonly openMenu: string;
    readonly closeMenu: string;
    readonly closeDialog: string;
    /** Appended to links that open a new tab (visually hidden). */
    readonly newTab: string;
    readonly languageSwitch: string;
    /** Name of each language, in the language of the page. */
    readonly languageNames: Localized;
    /** Accessible name of the logo link. */
    readonly home: string;
  };
  readonly nav: {
    readonly about: string;
    readonly courses: string;
    readonly specialties: string;
    readonly places: string;
    readonly gifts: string;
    readonly faq: string;
    readonly contact: string;
  };
  readonly hud: {
    readonly gauge: string;
    readonly depth: string;
    readonly temperature: string;
    readonly diveTime: string;
    readonly safetyStop: string;
    /** Ascent rate alarm, after « ▲ ». */
    readonly slowAscent: string;
    readonly diveProfile: string;
    readonly openProfile: string;
    readonly closeProfile: string;
    /** The depths are narrative: they follow the reading, not a real scale. */
    readonly note: string;
  };
  readonly hero: {
    readonly eyebrow: string;
    readonly title: Emphasis;
    readonly lead: string;
    readonly primaryCta: string;
    readonly secondaryCta: string;
    /** The three sites, on one line. */
    readonly places: string;
    readonly imageAlt: string;
  };
  readonly manifesto: {
    readonly eyebrow: string;
    readonly title: Emphasis;
    readonly body: string;
  };
  readonly instructor: SectionIntro & {
    readonly body: readonly string[];
    readonly portraitAlt: string;
    readonly credentialsTitle: string;
    /** Title of the link to a public register of credentials. */
    readonly verifyCredential: string;
  };
  readonly courses: SectionIntro & {
    readonly tabsLabel: string;
    readonly priceListTitle: string;
    readonly onRequest: string;
    /** Link that opens the form with the interest of a course selected. */
    readonly askAbout: string;
    readonly agencies: Readonly<Record<AgencyId, AgencyText>>;
  };
  readonly interludes: {
    readonly descent: InterludeText;
    readonly light: InterludeText;
  };
  readonly depthLadder: SectionIntro & {
    readonly youAreHere: string;
    readonly legend: string;
    /** Below 40 m the scale is compressed. */
    readonly scaleNote: string;
    /** Label of the thermocline that leaves the ladder: « Remontée · 40 m ». */
    readonly ascent: string;
  };
  readonly compare: SectionIntro & {
    readonly caption: string;
    /** Header of the first column. */
    readonly criterion: string;
    /** Line under the name of each agency. */
    readonly columns: Readonly<Record<AgencyId, string>>;
    readonly rows: readonly {
      readonly label: string;
      readonly values: Readonly<Record<AgencyId, string>>;
    }[];
    readonly footnote: string;
  };
  readonly specialties: SectionIntro & {
    readonly tabsLabel: string;
    readonly tabs: Readonly<
      Record<SpecialtyTabId, { readonly label: string; readonly lead: string }>
    >;
    /** Before the SDI course a PADI card matches: « Équivalent SDI Deep Diver ». */
    readonly equivalent: string;
  };
  readonly places: SectionIntro & {
    /** Name of the drawn route of the Rhône (E10). */
    readonly route: string;
    readonly facts: {
      readonly maxDepth: string;
      /** Before the list of sites of a lake. */
      readonly sites: string;
    };
  };
  readonly prepare: SectionIntro & {
    readonly gear: {
      readonly title: Emphasis;
      readonly lead: string;
      readonly items: readonly { readonly title: string; readonly text: Rich }[];
      readonly imageAlt: string;
    };
    readonly insurance: {
      readonly title: Emphasis;
      readonly lead: string;
      readonly items: readonly {
        readonly badge: string;
        readonly title: string;
        readonly text: string;
      }[];
    };
  };
  readonly gifts: SectionIntro & {
    readonly offersTitle: string;
    readonly offers: Readonly<
      Record<GiftOfferId, { readonly title: string; readonly text: string }>
    >;
    readonly stepsTitle: string;
    readonly steps: readonly { readonly title: string; readonly text: string }[];
    readonly conditionsTitle: string;
    readonly conditions: readonly string[];
    readonly cta: string;
    /** Texts printed on the gift card (E11). */
    readonly card: { readonly label: string; readonly validity: string };
  };
  readonly testimonials: SectionIntro & {
    readonly prompt: string;
    readonly cta: string;
    readonly previous: string;
    readonly next: string;
    /**
     * Shown when the testimonials are not in the language of the page: « Reviews written in
     * French » for the originals, « Translated from French » for translations (I-09).
     */
    readonly languageNote: string;
    /** Where the reviews were published. */
    readonly source: string;
    readonly items: readonly Testimonial[];
  };
  readonly faq: SectionIntro & {
    readonly items: readonly { readonly question: string; readonly answer: string }[];
  };
  readonly contact: SectionIntro & {
    readonly subtitle: Emphasis;
    readonly channels: {
      readonly whatsapp: string;
      readonly phone: string;
      readonly email: string;
    };
    readonly credentialsTitle: string;
    readonly form: ContactFormText;
  };
  readonly whatsapp: {
    readonly open: string;
    readonly title: string;
    readonly subtitle: string;
    readonly intro: string;
    readonly placeholder: string;
    readonly send: string;
    /** Sent when the visitor leaves the message empty. */
    readonly defaultMessage: string;
  };
  readonly footer: {
    readonly region: string;
    /** After « © <year> ». */
    readonly copyright: string;
    readonly creditsTitle: string;
    readonly credits: { readonly photos: string; readonly ai: string };
    readonly legalLinks: { readonly privacy: string; readonly legalNotice: string };
    readonly calmMode: {
      readonly label: string;
      readonly description: string;
      readonly on: string;
      readonly off: string;
    };
    readonly cookies: string;
    /** Title of the links to the public profiles (src/data/contact.ts). */
    readonly social: string;
    readonly backToSurface: string;
  };
  /** Consent banner and preferences (vanilla-cookieconsent, S11): plain text, no HTML. */
  readonly consent: {
    /** Accessible name of the banner. */
    readonly label: string;
    readonly title: string;
    readonly description: string;
    readonly acceptAll: string;
    readonly rejectAll: string;
    readonly showPreferences: string;
    readonly preferences: {
      readonly title: string;
      readonly intro: string;
      readonly save: string;
      readonly close: string;
      readonly categories: Readonly<
        Record<
          'necessary' | 'analytics' | 'marketing',
          { readonly title: string; readonly description: string }
        >
      >;
      readonly moreTitle: string;
      readonly moreDescription: string;
    };
    /** Label of the link to the privacy page, in the banner and the preferences. */
    readonly privacyLink: string;
  };
  readonly notFound: {
    readonly meta: PageMeta;
    readonly eyebrow: string;
    readonly title: Emphasis;
    readonly lead: string;
    readonly back: string;
  };
  readonly legal: {
    readonly privacy: LegalPage;
    readonly legalNotice: LegalPage;
  };
}

export interface ContactFormText {
  readonly name: string;
  readonly namePlaceholder: string;
  readonly email: string;
  readonly emailPlaceholder: string;
  readonly phone: string;
  readonly phonePlaceholder: string;
  readonly interest: string;
  readonly message: string;
  readonly messagePlaceholder: string;
  /** Label of the hidden anti-spam field, in case assistive technology reaches it. */
  readonly honeypot: string;
  /** Shown without JavaScript: the form cannot be sent then, the direct channels can (S10). */
  readonly noScript: string;
  readonly submit: string;
  readonly sending: string;
  readonly success: string;
  readonly sendAnother: string;
  readonly errorSummary: string;
  readonly errorDelivery: string;
  readonly sendByEmail: string;
  readonly sendByWhatsApp: string;
  readonly fieldNames: {
    readonly name: string;
    readonly email: string;
    readonly phone: string;
    readonly message: string;
  };
  readonly errors: {
    readonly required: string;
    readonly email: string;
    readonly tooLong: string;
  };
  /** Labels of the e-mail prepared when sending fails (mailto:). */
  readonly mail: {
    readonly subject: string;
    readonly name: string;
    readonly email: string;
    readonly phone: string;
    readonly interest: string;
  };
}
