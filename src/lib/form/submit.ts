// Sending the contact form to /api/contact (02-architecture.md §11), and the e-mail prepared
// when it fails. Never opened automatically: the visitor chooses to follow the link.
import type { Locale } from '../../i18n/types.ts';
import { normalizeFields, type CheckedField, type ContactFields } from './validate.ts';

export const CONTACT_ENDPOINT = '/api/contact';

export interface ContactPayload extends ContactFields {
  /** Honeypot: humans never see it, so it stays empty. */
  readonly website: string;
  /** Milliseconds since the page was displayed (contact.php drops fast robots). */
  readonly elapsed: number;
  readonly locale: Locale;
}

export interface SubmitContext {
  readonly locale: Locale;
  readonly elapsed: number;
  readonly website: string;
}

export type SubmitOutcome =
  | { readonly kind: 'success' }
  | { readonly kind: 'invalid'; readonly fields: readonly CheckedField[] }
  | { readonly kind: 'failure' };

export interface MailLabels {
  readonly subject: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly interest: string;
}

const CHECKED_FIELDS: readonly string[] = ['name', 'email', 'phone', 'message'];

export function buildPayload(fields: ContactFields, context: SubmitContext): ContactPayload {
  return {
    ...normalizeFields(fields),
    website: context.website,
    elapsed: Math.floor(context.elapsed),
    locale: context.locale,
  };
}

function isCheckedField(value: unknown): value is CheckedField {
  return typeof value === 'string' && CHECKED_FIELDS.includes(value);
}

async function readJson(response: Response): Promise<Record<string, unknown> | undefined> {
  try {
    const body: unknown = await response.json();
    return typeof body === 'object' && body !== null
      ? (body as Record<string, unknown>)
      : undefined;
  } catch {
    return undefined; // nginx answers 429 and 413 in HTML
  }
}

function outcomeOf(status: number, body: Record<string, unknown> | undefined): SubmitOutcome {
  if (status === 200 && body?.ok === true) return { kind: 'success' };
  const refused = Array.isArray(body?.fields) ? body.fields.filter(isCheckedField) : [];
  if (status === 400 && body?.error === 'validation' && refused.length > 0) {
    return { kind: 'invalid', fields: refused };
  }
  return { kind: 'failure' };
}

export async function sendContact(
  payload: ContactPayload,
  fetcher: typeof fetch = fetch,
): Promise<SubmitOutcome> {
  try {
    const response = await fetcher(CONTACT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    return outcomeOf(response.status, await readJson(response));
  } catch {
    return { kind: 'failure' };
  }
}

/** `mailto:` link with the message and the filled fields, for when sending fails. */
export function mailtoHref(
  to: string,
  fields: ContactFields,
  labels: MailLabels,
  interestLabel: string,
  locale: Locale = 'fr',
): string {
  const { name, email, phone, message } = normalizeFields(fields);
  const separator = locale === 'fr' ? ' : ' : ': ';
  const lines = [
    [labels.name, name],
    [labels.email, email],
    [labels.phone, phone],
    [labels.interest, interestLabel],
  ]
    .filter(([, value]) => value !== '')
    .map(([label, value]) => `${label}${separator}${value}`);
  const body = [message, lines.join('\n')].filter((part) => part !== '').join('\n\n');
  // encodeURIComponent, not URLSearchParams: mail clients read « + » literally.
  return `mailto:${to}?subject=${encodeURIComponent(labels.subject)}&body=${encodeURIComponent(body)}`;
}
