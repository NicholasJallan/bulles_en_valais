import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CONVERSION_LABELS,
  GOOGLE_ADS_ID,
  conversionCommands,
  trackLead,
  trackPhone,
  trackWhatsApp,
  type ConversionLabels,
} from './events.ts';

const LABELS: ConversionLabels = { lead: 'AbC-1_x', whatsapp: 'Wa_2', phone: 'Ph-3' };
const NO_LABELS: ConversionLabels = { lead: null, whatsapp: null, phone: null };

describe('conversionCommands', () => {
  it('sends the Google Ads conversion and the GA4 event of a lead', () => {
    expect(conversionCommands('lead', LABELS)).toEqual([
      ['event', 'conversion', { send_to: `${GOOGLE_ADS_ID}/AbC-1_x` }],
      ['event', 'generate_lead', { method: 'form' }],
    ]);
  });

  it('names the GA4 event of each channel', () => {
    expect(conversionCommands('whatsapp', NO_LABELS)).toEqual([
      ['event', 'whatsapp_click', { method: 'whatsapp' }],
    ]);
    expect(conversionCommands('phone', NO_LABELS)).toEqual([
      ['event', 'phone_click', { method: 'phone' }],
    ]);
  });

  it('sends no Google Ads conversion while the label is missing (I-06)', () => {
    const commands = conversionCommands('lead', NO_LABELS);
    expect(commands.some(([, name]) => name === 'conversion')).toBe(false);
  });

  it('refuses a label that is not a plain conversion label', () => {
    for (const label of ['', 'a/b', 'a b', 'x"y', `AW-1/${'a'}`]) {
      expect(() => conversionCommands('lead', { ...NO_LABELS, lead: label })).toThrow(
        /conversion label/,
      );
    }
  });

  it('ships with every label disabled until I-06 is answered', () => {
    expect(Object.values(CONVERSION_LABELS).every((label) => label === null)).toBe(true);
  });
});

describe('track helpers', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('pass each command to gtag', () => {
    const gtag = vi.fn();
    vi.stubGlobal('gtag', gtag);
    trackLead();
    trackWhatsApp();
    trackPhone();
    expect(gtag.mock.calls).toEqual([
      ['event', 'generate_lead', { method: 'form' }],
      ['event', 'whatsapp_click', { method: 'whatsapp' }],
      ['event', 'phone_click', { method: 'phone' }],
    ]);
  });

  it('do nothing without gtag (blocked script, tests)', () => {
    vi.stubGlobal('gtag', undefined);
    expect(() => trackLead()).not.toThrow();
  });

  it('report a failing gtag without breaking the page', () => {
    const report = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.stubGlobal(
      'gtag',
      vi.fn(() => {
        throw new Error('blocked');
      }),
    );
    expect(() => trackPhone()).not.toThrow();
    expect(report).toHaveBeenCalledOnce();
    report.mockRestore();
  });
});
