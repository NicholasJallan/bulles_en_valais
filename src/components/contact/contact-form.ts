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

interface FormContext {
  readonly element: HTMLElement;
  readonly form: HTMLFormElement;
  readonly messages: Messages;
  readonly locale: Locale;
  readonly summary: HTMLElement;
  readonly summaryList: HTMLUListElement;
  readonly submit: HTMLButtonElement;
  readonly status: HTMLElement;
  readonly success: HTMLElement;
  readonly failure: HTMLElement;
}

function summaryItem(context: FormContext, field: CheckedField): HTMLLIElement {
  const item = document.createElement('li');
  const link = document.createElement('a');
  link.href = `#${control(context.form, field).id}`;
  link.textContent = context.messages.fieldNames[field];
  item.append(link);
  return item;
}

/** Errors next to each field, and their summary above the form (focused on submit). */
function showErrors(context: FormContext, errors: ContactErrors, focusSummary: boolean): void {
  for (const field of CHECKED) {
    const error = errors[field];
    setFieldError(context.form, field, error && context.messages.errors[error]);
  }
  const invalid = CHECKED.filter((field) => errors[field] !== undefined);
  context.summaryList.replaceChildren(...invalid.map((field) => summaryItem(context, field)));
  context.summary.hidden = invalid.length === 0;
  if (focusSummary && invalid.length > 0) context.summary.focus();
}

/** Fields the server refused: it does not say why, so each one is named in the summary. */
function showRefused(context: FormContext, fields: readonly CheckedField[]): void {
  const { messages } = context;
  showErrors(context, Object.fromEntries(fields.map((field) => [field, 'required'])), true);
  for (const field of fields) {
    setFieldError(context.form, field, `${messages.errorSummary} ${messages.fieldNames[field]}`);
  }
}

/** The other ways to reach Nicholas, prepared with the message: links, never opened for him. */
function showFailure(context: FormContext, fields: ContactFields, focus: boolean): void {
  const { messages, failure } = context;
  const interest = control(context.form, 'interest') as HTMLSelectElement;
  const interestLabel = interest.selectedOptions[0]?.textContent?.trim() ?? fields.interest;
  const email = context.element.dataset.email ?? '';
  part<HTMLAnchorElement>(failure, '[data-mailto]').href = mailtoHref(
    email,
    fields,
    messages.mail,
    interestLabel,
    context.locale,
  );
  part<HTMLAnchorElement>(failure, '[data-whatsapp-fallback]').href = whatsappUrl(
    fields.message.trim() || messages.whatsappDefault,
  );
  failure.hidden = false;
  if (focus) failure.focus();
}

function setSending(context: FormContext, sending: boolean): void {
  context.submit.disabled = sending;
  context.status.textContent = sending ? context.messages.sending : '';
}

async function submitForm(context: FormContext): Promise<void> {
  const { form } = context;
  const fields = readFields(form);
  const errors = validateContact(fields);
  context.failure.hidden = true;
  showErrors(context, errors, true);
  if (Object.keys(errors).length > 0) return;
  setSending(context, true);
  const website = control(form, 'website').value;
  const payload = buildPayload(fields, {
    locale: context.locale,
    elapsed: performance.now(),
    website,
  });
  const outcome = await sendContact(payload);
  setSending(context, false);
  if (outcome.kind === 'success') {
    form.hidden = true;
    context.success.hidden = false;
    context.success.focus();
  } else if (outcome.kind === 'invalid') {
    showRefused(context, outcome.fields);
    showFailure(context, fields, false);
  } else {
    showFailure(context, fields, true);
  }
}

/** Checks a field when leaving it, once something was typed in it or it was marked invalid. */
function validateOnLeave(context: FormContext, target: EventTarget | null): void {
  const input = target as Control | null;
  const field = CHECKED.find((name) => name === input?.name);
  if (field === undefined || input === null) return;
  const touched = input.value.trim() !== '' || input.getAttribute('aria-invalid') === 'true';
  if (!touched) return;
  const error = validateContact(readFields(context.form))[field];
  setFieldError(context.form, field, error && context.messages.errors[error]);
}

/** Links such as « Offer a gift voucher » choose the interest before reaching the form. */
function prefill(context: FormContext, target: EventTarget | null): void {
  const link = target instanceof Element ? target.closest('[data-prefill-interest]') : null;
  const value = link?.getAttribute('data-prefill-interest');
  const select = control(context.form, 'interest') as HTMLSelectElement;
  if (value && Array.from(select.options).some((option) => option.value === value)) {
    select.value = value;
  }
}

function contextOf(element: HTMLElement): FormContext {
  const form = part<HTMLFormElement>(element, '[data-form]');
  return {
    element,
    form,
    messages: JSON.parse(element.dataset.messages ?? '{}') as Messages,
    locale: (element.dataset.locale ?? 'fr') as Locale,
    summary: part<HTMLElement>(form, '[data-summary]'),
    summaryList: part<HTMLUListElement>(form, '[data-summary-list]'),
    submit: part<HTMLButtonElement>(form, '[data-submit]'),
    status: part<HTMLElement>(form, '[data-status]'),
    success: part<HTMLElement>(element, '[data-success]'),
    failure: part<HTMLElement>(element, '[data-failure]'),
  };
}

type Listener = readonly [EventTarget, string, (event: Event) => void];

export function init(element: HTMLElement): Cleanup {
  const context = contextOf(element);
  const { form, submit, summary, success } = context;
  // Pressing « Send » blurs the field: showing its error then would move the button under the
  // pointer and lose the click (the submit checks every field anyway). On touch screens the blur
  // comes after pointerup, so the flag lasts until the next press.
  let pressingSubmit = false;

  const listeners: readonly Listener[] = [
    [
      form,
      'submit',
      (event) => {
        event.preventDefault();
        if (!submit.disabled) void submitForm(context);
      },
    ],
    [
      form,
      'focusout',
      (event) => {
        const { relatedTarget } = event as FocusEvent;
        if (!pressingSubmit && relatedTarget !== submit) validateOnLeave(context, event.target);
      },
    ],
    [
      document,
      'pointerdown',
      (event) => {
        pressingSubmit = event.target instanceof Node && submit.contains(event.target);
      },
    ],
    [
      summary,
      'click',
      (event) => {
        const link = event.target instanceof Element ? event.target.closest('a') : null;
        if (link === null) return;
        event.preventDefault();
        document.getElementById(link.hash.slice(1))?.focus();
      },
    ],
    [
      part(success, '[data-reset]'),
      'click',
      () => {
        form.reset();
        showErrors(context, {}, false);
        success.hidden = true;
        form.hidden = false;
        control(form, 'name').focus();
      },
    ],
    [document, 'click', (event) => prefill(context, event.target)],
  ];

  form.noValidate = true;
  submit.disabled = false;
  for (const [target, type, listener] of listeners) target.addEventListener(type, listener);
  return () => {
    for (const [target, type, listener] of listeners) target.removeEventListener(type, listener);
  };
}
