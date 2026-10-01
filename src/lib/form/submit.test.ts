import { describe, expect, it, vi } from 'vitest';
import {
  buildPayload,
  MAILTO_MESSAGE_CHARS,
  mailtoHref,
  sendContact,
  type MailLabels,
} from './submit.ts';
import type { ContactFields } from './validate.ts';

const FIELDS: ContactFields = {
  name: ' Ana ',
  email: 'ana@example.ch',
  phone: '',
  interest: 'gift',
  message: 'Un bon pour deux.',
};

const PAYLOAD = buildPayload(FIELDS, { locale: 'fr', elapsed: 4200.7, website: '' });

function respond(status: number, body: unknown): typeof fetch {
  return vi.fn(async () => new Response(JSON.stringify(body), { status }));
}

describe('buildPayload', () => {
  it('sends the normalized fields, the honeypot, a whole elapsed time and the locale', () => {
    expect(PAYLOAD).toEqual({
      name: 'Ana',
      email: 'ana@example.ch',
      phone: '',
      interest: 'gift',
      message: 'Un bon pour deux.',
      website: '',
      elapsed: 4200,
      locale: 'fr',
    });
  });
});

describe('sendContact', () => {
  it('posts JSON to /api/contact, with a time limit', async () => {
    const fetcher = respond(200, { ok: true });
    await sendContact(PAYLOAD, fetcher);
    expect(fetcher).toHaveBeenCalledWith('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(PAYLOAD),
      signal: expect.any(AbortSignal),
    });
  });

  it('fails when the server does not answer in time', async () => {
    const fetcher = vi.fn(
      (_url: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(init.signal?.reason));
        }),
    );
    expect(await sendContact(PAYLOAD, fetcher as typeof fetch, 10)).toEqual({ kind: 'failure' });
  });

  it('succeeds on 200 with ok: true', async () => {
    expect(await sendContact(PAYLOAD, respond(200, { ok: true }))).toEqual({ kind: 'success' });
  });

  it('returns the fields the server refused on a validation error', async () => {
    const fetcher = respond(400, { ok: false, error: 'validation', fields: ['email', 'x', 3] });
    expect(await sendContact(PAYLOAD, fetcher)).toEqual({ kind: 'invalid', fields: ['email'] });
  });

  it.each([
    ['a 400 without fields', 400, { ok: false, error: 'json' }],
    ['a validation error without known fields', 400, { ok: false, error: 'validation' }],
    ['a delivery error', 500, { ok: false, error: 'delivery' }],
    ['the rate limit', 429, '<html>'],
    ['a 200 that is not ok', 200, { ok: false }],
  ])('fails on %s', async (_name, status, body) => {
    expect(await sendContact(PAYLOAD, respond(status, body))).toEqual({ kind: 'failure' });
  });

  it('fails when the network does', async () => {
    const fetcher = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });
    expect(await sendContact(PAYLOAD, fetcher)).toEqual({ kind: 'failure' });
  });
});

describe('mailtoHref', () => {
  const labels: MailLabels = {
    subject: 'Contact depuis le site',
    name: 'Nom',
    email: 'E-mail',
    phone: 'Téléphone',
    interest: 'Intérêt',
  };

  it('prepares an e-mail with the subject and every filled field, encoded', () => {
    const href = mailtoHref('nicholas@bullesenvalais.ch', FIELDS, labels, 'Un bon cadeau');
    const url = new URL(href);
    expect(url.protocol).toBe('mailto:');
    expect(url.pathname).toBe('nicholas@bullesenvalais.ch');
    expect(url.searchParams.get('subject')).toBe('Contact depuis le site');
    expect(url.searchParams.get('body')).toBe(
      'Un bon pour deux.\n\nNom : Ana\nE-mail : ana@example.ch\nIntérêt : Un bon cadeau',
    );
    expect(href).not.toContain('+');
  });

  it('shortens a long message so that mail clients accept the link', () => {
    const long = { ...FIELDS, message: 'x'.repeat(5000) };
    const body = new URL(mailtoHref('n@example.ch', long, labels, 'Gift')).searchParams.get('body');
    expect(body?.startsWith(`${'x'.repeat(MAILTO_MESSAGE_CHARS)}…`)).toBe(true);
    expect(body?.length).toBeLessThan(MAILTO_MESSAGE_CHARS + 200);
  });

  it('separates label and value the English way in English', () => {
    const href = mailtoHref('n@example.ch', { ...FIELDS, phone: '079' }, labels, 'Gift', 'en');
    expect(new URL(href).searchParams.get('body')).toContain('Téléphone: 079');
  });
});
