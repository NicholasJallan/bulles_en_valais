// Conversions of the page (02-architecture.md §12): a sent form, a WhatsApp or a phone click.
// gtag comes from public/js/consent-default.js, which loads the Google tag in production only;
// Consent Mode decides what Google may store, so these helpers never check the consent.

export const GOOGLE_ADS_ID = 'AW-10798308119';

export type ConversionKind = 'lead' | 'whatsapp' | 'phone';
export type ConversionLabels = Readonly<Record<ConversionKind, string | null>>;

/**
 * Labels of the Google Ads conversion actions (`AW-…/<label>`). TODO(I-06): Nicholas has not given
 * them yet; a null label sends no Ads conversion (the GA4 event is still sent).
 */
export const CONVERSION_LABELS: ConversionLabels = { lead: null, whatsapp: null, phone: null };

const GA4_EVENTS: Readonly<Record<ConversionKind, { name: string; method: string }>> = {
  lead: { name: 'generate_lead', method: 'form' },
  whatsapp: { name: 'whatsapp_click', method: 'whatsapp' },
  phone: { name: 'phone_click', method: 'phone' },
};

const LABEL_PATTERN = /^[\w-]+$/;

export type GtagCommand = readonly ['event', string, Readonly<Record<string, string>>];
type Gtag = (...command: GtagCommand) => void;

/** The gtag commands of a conversion: the Ads conversion (if labelled), then the GA4 event. */
export function conversionCommands(
  kind: ConversionKind,
  labels: ConversionLabels = CONVERSION_LABELS,
): GtagCommand[] {
  const label = labels[kind];
  const { name, method } = GA4_EVENTS[kind];
  const ga4: GtagCommand = ['event', name, { method }];
  if (label === null) return [ga4];
  if (!LABEL_PATTERN.test(label)) throw new Error(`Invalid conversion label "${label}"`);
  return [['event', 'conversion', { send_to: `${GOOGLE_ADS_ID}/${label}` }], ga4];
}

function track(kind: ConversionKind): void {
  const gtag = (globalThis as { gtag?: Gtag }).gtag;
  if (typeof gtag !== 'function') return;
  try {
    for (const command of conversionCommands(kind)) gtag(...command);
  } catch (error) {
    // Measuring must never break the visit: report and go on.
    console.error(`Conversion "${kind}" not sent`, error);
  }
}

export const trackLead = (): void => track('lead');
export const trackWhatsApp = (): void => track('whatsapp');
export const trackPhone = (): void => track('phone');
