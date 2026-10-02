// Client-side rules of the contact form: the same as public/api/contact.php (02-architecture.md
// §11), so that the server only refuses what the browser could not check.

export interface ContactFields {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly interest: string;
  readonly message: string;
}

export type CheckedField = 'name' | 'email' | 'phone' | 'message';
export type FieldError = 'required' | 'email' | 'tooLong';
export type ContactErrors = Partial<Readonly<Record<CheckedField, FieldError>>>;

/** Lengths in characters (code points), as `char_length()` counts them in contact.php. */
export const LIMITS = { name: 100, email: 254, phone: 40, message: 5000 } as const;

const MAX_LOCAL_PART = 64;
// contact.php: EMAIL_PATTERN (ASCII, no quotes), then FILTER_VALIDATE_EMAIL (dot-atom local part,
// domain of letter-digit-hyphen labels, at least one dot, top-level label starting with a letter).
const LOCAL_PART = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/;
const DOMAIN_LABEL = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/;
const TOP_LEVEL_LABEL = /^(?:[A-Za-z][A-Za-z0-9-]*|xn--[A-Za-z0-9-]+)$/;
const CONTROL_CHARS = /[\u0000-\u001f\u007f]+/g;

function charLength(text: string): number {
  return Array.from(text).length;
}

function oneLine(text: string): string {
  return text.replace(CONTROL_CHARS, ' ').trim();
}

/** Trimmed fields, one-line fields without control characters: what is checked and sent. */
export function normalizeFields(fields: ContactFields): ContactFields {
  return {
    name: oneLine(fields.name),
    email: fields.email.trim(),
    phone: oneLine(fields.phone),
    interest: fields.interest,
    message: fields.message.trim(),
  };
}

function isValidDomain(domain: string): boolean {
  const labels = domain.split('.');
  const topLevel = labels.at(-1) ?? '';
  return (
    labels.length >= 2 &&
    labels.every((label) => DOMAIN_LABEL.test(label)) &&
    TOP_LEVEL_LABEL.test(topLevel)
  );
}

export function isValidEmail(email: string): boolean {
  const at = email.lastIndexOf('@');
  if (at <= 0 || email.length > LIMITS.email || email.includes('=?')) return false;
  const local = email.slice(0, at);
  return (
    local.length <= MAX_LOCAL_PART && LOCAL_PART.test(local) && isValidDomain(email.slice(at + 1))
  );
}

function checkName(name: string): FieldError | undefined {
  if (name === '') return 'required';
  return charLength(name) > LIMITS.name ? 'tooLong' : undefined;
}

function checkEmail(email: string): FieldError | undefined {
  if (email === '') return 'required';
  return isValidEmail(email) ? undefined : 'email';
}

function checkLength(text: string, limit: number): FieldError | undefined {
  return charLength(text) > limit ? 'tooLong' : undefined;
}

/** Errors of each invalid field; an empty object when the form can be sent. */
export function validateContact(fields: ContactFields): ContactErrors {
  const normalized = normalizeFields(fields);
  const checks: ReadonlyArray<readonly [CheckedField, FieldError | undefined]> = [
    ['name', checkName(normalized.name)],
    ['email', checkEmail(normalized.email)],
    ['phone', checkLength(normalized.phone, LIMITS.phone)],
    ['message', checkLength(normalized.message, LIMITS.message)],
  ];
  return Object.fromEntries(checks.filter(([, error]) => error !== undefined));
}
