// Consent banner (vanilla-cookieconsent, plans/refonte-la-descente/02-architecture.md §12). The
// controller sits on the « Manage cookies » button of the footer, which carries the texts of the
// page: the library and its styles are loaded with this module, never in the initial bundle.
// public/js/consent-default.js has already set the default consent; this module sends the update.
import * as CookieConsent from 'vanilla-cookieconsent';
// As URLs, not imports: Astro would link imported CSS from every page, render-blocking.
import libraryStyles from 'vanilla-cookieconsent/dist/cookieconsent.css?url';
import themeStyles from './consent.css?url';
import type { Dictionary } from '@/i18n/dictionary.ts';
import { consentState, isAnyGranted } from '@/lib/analytics/consent-mode.ts';
import type { Cleanup } from '@/lib/controllers.ts';
import { listenForConversions } from './conversions.ts';

type ConsentTexts = Dictionary['consent'] & { readonly privacyHref: string; readonly lang: string };

interface GoogleTagWindow {
  gtag?: (...args: unknown[]) => void;
  bvLoadGoogleTag?: () => void;
}

/** Cookies erased when their category is refused (Google Analytics, Google Ads). */
const AUTO_CLEAR = {
  analytics: [/^_ga/],
  marketing: [/^_gcl/],
};

/** The library renders its texts as HTML: ours are plain text, so escape them. */
function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function readTexts(button: HTMLElement): ConsentTexts {
  const texts = JSON.parse(button.dataset.consentTexts ?? 'null') as ConsentTexts | null;
  if (texts === null || typeof texts.privacyHref !== 'string' || typeof texts.lang !== 'string') {
    throw new Error('The consent button has no data-consent-texts');
  }
  return texts;
}

function translation(t: ConsentTexts): CookieConsent.Translation {
  const e = escapeHtml;
  const privacy = `<a href="${e(t.privacyHref)}">${e(t.privacyLink)}</a>`;
  const { categories } = t.preferences;
  return {
    consentModal: {
      label: e(t.label),
      title: e(t.title),
      description: e(t.description),
      acceptAllBtn: e(t.acceptAll),
      acceptNecessaryBtn: e(t.rejectAll),
      showPreferencesBtn: e(t.showPreferences),
      footer: privacy,
    },
    preferencesModal: {
      title: e(t.preferences.title),
      acceptAllBtn: e(t.acceptAll),
      acceptNecessaryBtn: e(t.rejectAll),
      savePreferencesBtn: e(t.preferences.save),
      closeIconLabel: e(t.preferences.close),
      sections: [
        { description: e(t.preferences.intro) },
        ...(['necessary', 'analytics', 'marketing'] as const).map((category) => ({
          title: e(categories[category].title),
          description: e(categories[category].description),
          linkedCategory: category,
        })),
        {
          title: e(t.preferences.moreTitle),
          description: `${e(t.preferences.moreDescription)} ${privacy}`,
        },
      ],
    },
  };
}

/** Consent Mode update from the accepted categories; in basic mode it also loads the tag. */
function sendConsent(): void {
  const google = window as GoogleTagWindow;
  const state = consentState(CookieConsent.getUserPreferences().acceptedCategories);
  google.gtag?.('consent', 'update', state);
  if (isAnyGranted(state)) google.bvLoadGoogleTag?.();
}

/**
 * `html[data-consent-open]` while a consent window is shown: consent.css hides the HUD pill and
 * the WhatsApp button, which would cover the banner on a phone.
 */
function trackOpenModals(): Pick<CookieConsent.CookieConsentConfig, 'onModalShow' | 'onModalHide'> {
  const open = new Set<string>();
  const update = (): void => {
    document.documentElement.toggleAttribute('data-consent-open', open.size > 0);
    // The library renders outside the page: give it the tone of the deep water (consent.css).
    document.getElementById('cc-main')?.setAttribute('data-tone', 'deep');
  };
  return {
    onModalShow: ({ modalName }) => {
      open.add(modalName);
      update();
    },
    onModalHide: ({ modalName }) => {
      open.delete(modalName);
      update();
    },
  };
}

/** Adds a stylesheet to the page and resolves once it applies (the banner must not flash unstyled). */
function loadStylesheet(href: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.addEventListener('load', () => resolve());
    link.addEventListener('error', () => reject(new Error(`Stylesheet ${href} failed to load`)));
    document.head.append(link);
  });
}

async function start(texts: ConsentTexts): Promise<void> {
  await Promise.all([loadStylesheet(libraryStyles), loadStylesheet(themeStyles)]);
  await CookieConsent.run({
    cookie: { name: 'cc_cookie', expiresAfterDays: 182, sameSite: 'Lax' },
    guiOptions: {
      consentModal: { layout: 'box', position: 'bottom right', equalWeightButtons: true },
      preferencesModal: { layout: 'box', equalWeightButtons: true },
    },
    categories: {
      necessary: { enabled: true, readOnly: true },
      analytics: { autoClear: { cookies: AUTO_CLEAR.analytics.map((name) => ({ name })) } },
      marketing: { autoClear: { cookies: AUTO_CLEAR.marketing.map((name) => ({ name })) } },
    },
    language: { default: texts.lang, translations: { [texts.lang]: translation(texts) } },
    onConsent: sendConsent,
    onChange: sendConsent,
    ...trackOpenModals(),
  });
}

export function init(button: HTMLElement): Cleanup {
  const texts = readTexts(button);
  const open = (): void => CookieConsent.showPreferences();
  button.addEventListener('click', open);
  // Consent Mode already holds the default: a banner that fails to load must not break the page,
  // and the button stays disabled until the preferences can open.
  start(texts)
    .then(() => button.removeAttribute('disabled'))
    .catch((error: unknown) => console.error('Consent banner failed to start', error));
  const stopConversions = listenForConversions(document);

  return () => {
    button.removeEventListener('click', open);
    stopConversions();
  };
}
