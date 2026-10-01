// Contact form: validation when leaving a field and on submit (same rules as contact.php), errors
// per field (aria-invalid, aria-describedby) with a focused summary, JSON sending, then success or
// alternatives. A failure never opens mailto: by itself: the visitor chooses a channel.
import { whatsappUrl } from '@/data/contact.ts';
import type { Locale } from '@/i18n/types.ts';
import type { Cleanup } from '@/lib/controllers.ts';
import { buildPayload, mailtoHref, sendContact, type MailLabels } from '@/lib/form/submit.ts';
import {
  validateContact,
  type CheckedField,
  type ContactErrors,
  type ContactFields,
  type FieldError,
} from '@/lib/form/validate.ts';

interface Messages {
  readonly errors: Readonly<Record<FieldError, string>>;
  readonly fieldNames: Readonly<Record<CheckedField, string>>;
  readonly errorSummary: string;
  readonly sending: string;
  readonly submit: string;
  readonly mail: MailLabels;
  readonly whatsappDefault: string;
}

const CHECKED: readonly CheckedField[] = ['name', 'email', 'phone', 'message'];

type Control = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

function part<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (element === null) throw new Error(`contact-form: ${selector} missing`);
  return element;
}

function control(form: HTMLFormElement, name: string): Control {
  const element = form.elements.namedItem(name);
  if (!(element instanceof HTMLElement)) throw new Error(`contact-form: field ${name} missing`);
  return element as Control;
}

function readFields(form: HTMLFormElement): ContactFields {
  const value = (name: string) => control(form, name).value;
  return {
    name: value('name'),
    email: value('email'),
    phone: value('phone'),
    interest: value('interest'),
    message: value('message'),
  };
}

/** Shows or clears the error of one field, wiring aria-invalid and aria-describedby. */
function setFieldError(form: HTMLFormElement, field: CheckedField, text: string | undefined): void {
  const input = control(form, field);
  const line = document.getElementById(`${input.id}-error`);
  const describedBy = new Set((input.getAttribute('aria-describedby') ?? '').split(' '));
  describedBy.delete('');
  if (line !== null) {
    line.hidden = text === undefined;
    part<HTMLElement>(line, '[data-error-text]').textContent = text ?? '';
    if (text === undefined) describedBy.delete(line.id);
    else describedBy.add(line.id);
  }
  input.closest('.field')?.classList.toggle('field-invalid', text !== undefined);
  input.toggleAttribute('aria-invalid', text !== undefined);
  if (text !== undefined) input.setAttribute('aria-invalid', 'true');
  if (describedBy.size > 0) input.setAttribute('aria-describedby', [...describedBy].join(' '));
  else input.removeAttribute('aria-describedby');
}

export function init(element: HTMLElement): Cleanup {
  const form = part<HTMLFormElement>(element, '[data-form]');
  const messages = JSON.parse(element.dataset.messages ?? '{}') as Messages;
  const locale = (element.dataset.locale ?? 'fr') as Locale;
  const view = {
    summary: part<HTMLElement>(form, '[data-summary]'),
    summaryList: part<HTMLUListElement>(form, '[data-summary-list]'),
    submit: part<HTMLButtonElement>(form, '[data-submit]'),
    status: part<HTMLElement>(form, '[data-status]'),
    success: part<HTMLElement>(element, '[data-success]'),
    failure: part<HTMLElement>(element, '[data-failure]'),
  };
  const errorText = (error: FieldError) => messages.errors[error];

  const showErrors = (errors: ContactErrors, focusSummary: boolean) => {
    for (const field of CHECKED) {
      const error = errors[field];
      setFieldError(form, field, error === undefined ? undefined : errorText(error));
    }
    const invalid = CHECKED.filter((field) => errors[field] !== undefined);
    view.summaryList.replaceChildren(
      ...invalid.map((field) => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#${control(form, field).id}`;
        link.textContent = messages.fieldNames[field];
        item.append(link);
        return item;
      }),
    );
    view.summary.hidden = invalid.length === 0;
    if (focusSummary && invalid.length > 0) view.summary.focus();
  };

  const onSummaryClick = (event: MouseEvent) => {
    const link = event.target instanceof Element ? event.target.closest('a') : null;
    if (link === null) return;
    event.preventDefault();
    document.getElementById(link.hash.slice(1))?.focus();
  };

  const onFocusOut = (event: FocusEvent) => {
    const target = event.target as Control | null;
    const field = CHECKED.find((name) => name === target?.name);
    if (field === undefined || target === null) return;
    const touched = target.value.trim() !== '' || target.getAttribute('aria-invalid') === 'true';
    if (!touched) return;
    const error = validateContact(readFields(form))[field];
    setFieldError(form, field, error === undefined ? undefined : errorText(error));
  };

  const setSending = (sending: boolean) => {
    view.submit.disabled = sending;
    view.status.textContent = sending ? messages.sending : '';
  };

  const showFailure = (fields: ContactFields, focus: boolean) => {
    const interest = control(form, 'interest') as HTMLSelectElement;
    const interestLabel = interest.selectedOptions[0]?.textContent?.trim() ?? fields.interest;
    const mailto = part<HTMLAnchorElement>(view.failure, '[data-mailto]');
    const email = element.dataset.email ?? '';
    mailto.href = mailtoHref(email, fields, messages.mail, interestLabel, locale);
    const whatsapp = part<HTMLAnchorElement>(view.failure, '[data-whatsapp-fallback]');
    whatsapp.href = whatsappUrl(fields.message.trim() || messages.whatsappDefault);
    view.failure.hidden = false;
    if (focus) view.failure.focus();
  };

  const onSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    if (view.submit.disabled) return;
    const fields = readFields(form);
    const errors = validateContact(fields);
    view.failure.hidden = true;
    showErrors(errors, true);
    if (Object.keys(errors).length > 0) return;
    setSending(true);
    const website = control(form, 'website').value;
    const payload = buildPayload(fields, { locale, elapsed: performance.now(), website });
    const outcome = await sendContact(payload);
    setSending(false);
    if (outcome.kind === 'success') {
      form.hidden = true;
      view.success.hidden = false;
      view.success.focus();
    } else if (outcome.kind === 'invalid') {
      const refused = Object.fromEntries(outcome.fields.map((field) => [field, 'required']));
      showErrors(refused as ContactErrors, true);
      for (const field of outcome.fields) {
        setFieldError(form, field, `${messages.errorSummary} ${messages.fieldNames[field]}`);
      }
      showFailure(fields, false);
    } else {
      showFailure(fields, true);
    }
  };

  const onReset = () => {
    form.reset();
    showErrors({}, false);
    view.success.hidden = true;
    form.hidden = false;
    control(form, 'name').focus();
  };

  /** Links such as « Offer a gift voucher » choose the interest before reaching the form. */
  const onPrefill = (event: MouseEvent) => {
    const link =
      event.target instanceof Element ? event.target.closest('[data-prefill-interest]') : null;
    const value = link?.getAttribute('data-prefill-interest');
    const select = control(form, 'interest') as HTMLSelectElement;
    if (value && Array.from(select.options).some((option) => option.value === value)) {
      select.value = value;
    }
  };

  const reset = part<HTMLButtonElement>(view.success, '[data-reset]');
  form.noValidate = true;
  form.addEventListener('submit', onSubmit);
  form.addEventListener('focusout', onFocusOut);
  view.summary.addEventListener('click', onSummaryClick);
  reset.addEventListener('click', onReset);
  document.addEventListener('click', onPrefill);
  return () => {
    form.removeEventListener('submit', onSubmit);
    form.removeEventListener('focusout', onFocusOut);
    view.summary.removeEventListener('click', onSummaryClick);
    reset.removeEventListener('click', onReset);
    document.removeEventListener('click', onPrefill);
  };
}
