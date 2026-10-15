import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import nodemailer from 'nodemailer';
import { handleEnquiry, type HandlerDeps } from '../../netlify/lib/enquiry-handler.ts';
import { buildEmail, type EmailMessage } from '../../netlify/lib/email.ts';
import { MemoryRateLimiter, StoreRateLimiter } from '../../netlify/lib/rate-limit.ts';
import { normalise } from '../../src/lib/enquiry.ts';

const NOW = Date.UTC(2026, 9, 14, 6, 30); // 14 Oct 2026, 12:00 IST
const ENV: Record<string, string> = {
  SMTP_HOST: 'smtp.hostinger.com', SMTP_PORT: '465', SMTP_USER: 'info@mmconstructionconsults.com',
  SMTP_PASS: 'test-only', MAIL_TO: 'info@mmconstructionconsults.com', MAIL_FROM: 'info@mmconstructionconsults.com',
};
const VALID = {
  name: 'Asha Patil', email: 'asha@example.com', phone: '+91 98765 43210', service: 'Waterproofing',
  location: 'Ghatkopar', message: 'Our terrace leaks during the monsoon.', consent: 'on',
  company_website: '', form_started: String(NOW - 10_000), form_type: 'Quote request', page: 'https://mmconstructionconsults.com/contact/',
};

function setup(overrides: Omit<Partial<HandlerDeps>, 'env'> & { env?: Record<string, string>; failSend?: boolean } = {}) {
  const sent: EmailMessage[] = [];
  const env = overrides.env ?? ENV;
  const deps: HandlerDeps = {
    env: (name) => env[name],
    send: async (message) => { if (overrides.failSend) throw new Error('SMTP 535 auth failed'); sent.push(message); },
    rateLimiter: overrides.rateLimiter ?? new MemoryRateLimiter(5, 600_000, () => NOW),
    ip: overrides.ip ?? '203.0.113.7',
    now: () => NOW,
  };
  return { deps, sent };
}

function jsonRequest(body: Record<string, unknown>, origin: string | null = 'https://mmconstructionconsults.com', method = 'POST') {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (origin) headers.Origin = origin;
  return new Request('https://mmconstructionconsults.com/api/contact', { method, headers, body: method === 'POST' ? JSON.stringify(body) : undefined });
}

/** Header block of a rendered message, with folded (multi-line) headers joined. */
const unfold = (raw: string) => raw.slice(0, raw.indexOf('\n\n')).replace(/\n[ \t]+/g, ' ');

function formRequest(body: Record<string, string>, origin = 'https://mmconstructionconsults.com') {
  return new Request('https://mmconstructionconsults.com/api/contact', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: origin }, body: new URLSearchParams(body).toString(),
  });
}

describe('successful enquiry', () => {
  it('sends from the company mailbox with the visitor as display name and Reply-To', async () => {
    const { deps, sent } = setup();
    const res = await handleEnquiry(jsonRequest(VALID), deps);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true, redirect: '/thank-you/' });
    assert.equal(sent.length, 1);
    const [mail] = sent;
    assert.deepEqual(mail.from, { name: 'Asha Patil via M.M. Construction Website', address: 'info@mmconstructionconsults.com' });
    assert.deepEqual(mail.replyTo, { name: 'Asha Patil', address: 'asha@example.com' });
    assert.equal(mail.to, 'info@mmconstructionconsults.com');
    assert.equal(mail.subject, 'New enquiry from Asha Patil: Waterproofing');
  });

  it('includes form type, every field, source page and IST time in HTML and plain text, with no third-party branding', async () => {
    const { deps, sent } = setup();
    await handleEnquiry(jsonRequest(VALID), deps);
    const { html, text } = sent[0];
    for (const value of ['Quote request', 'Asha Patil', 'asha@example.com', '+91 98765 43210', 'Waterproofing', 'Ghatkopar', 'Our terrace leaks', 'https://mmconstructionconsults.com/contact/', '(IST)']) {
      assert.ok(text.includes(value), `text has ${value}`);
      assert.ok(html.includes(value), `html has ${value}`);
    }
    assert.match(text, /14 October 2026.*12:00/);
    assert.doesNotMatch(html + text, /formsubmit/i);
  });

  it('renders with nodemailer (without sending) to the expected From, Reply-To and Subject headers', async () => {
    const message = buildEmail(normalise(VALID), { formType: 'Quote request', page: VALID.page, receivedAt: new Date(NOW) }, { to: ENV.MAIL_TO, from: ENV.MAIL_FROM });
    const transport = nodemailer.createTransport({ streamTransport: true, buffer: true, newline: 'unix' });
    const info = await transport.sendMail(message);
    const raw = (info.message as Buffer).toString('utf8');
    const headers = unfold(raw);
    assert.match(headers, /^From: "Asha Patil via M\.M\. Construction Website" <info@mmconstructionconsults\.com>$/m);
    assert.match(headers, /^Reply-To: Asha Patil <asha@example\.com>$/m);
    assert.match(headers, /^To: info@mmconstructionconsults\.com$/m);
    assert.match(headers, /^Subject: New enquiry from Asha Patil: Waterproofing$/m);
    assert.match(raw, /Content-Type: multipart\/alternative/);
  });

  it('accepts a no-JavaScript form POST and answers with a 303 redirect to /thank-you/', async () => {
    const { deps, sent } = setup();
    const { form_started: _ignored, ...noJs } = VALID; // a static page cannot stamp the load time
    const res = await handleEnquiry(formRequest(noJs), deps);
    assert.equal(res.status, 303);
    assert.equal(res.headers.get('location'), '/thank-you/');
    assert.equal(sent.length, 1);
  });

  it('flags suspicious keywords in the subject instead of dropping the email', async () => {
    const { deps, sent } = setup();
    await handleEnquiry(jsonRequest({ ...VALID, message: 'We offer SEO services and backlinks for your website.' }), deps);
    assert.equal(sent.length, 1);
    assert.match(sent[0].subject, /^\[Possible spam\] New enquiry from Asha Patil/);
  });
});

describe('validation', () => {
  it('returns 422 with a message per invalid field and sends nothing', async () => {
    const { deps, sent } = setup();
    const res = await handleEnquiry(jsonRequest({ ...VALID, email: 'asha@', phone: '12345', message: 'Too short', name: 'A' }), deps);
    assert.equal(res.status, 422);
    const body = await res.json();
    assert.equal(body.code, 'invalid');
    assert.deepEqual(Object.keys(body.errors).sort(), ['email', 'message', 'name', 'phone']);
    assert.equal(sent.length, 0);
  });

  it('enforces maximum lengths and the 10 to 15 digit phone rule', async () => {
    const { deps } = setup();
    const res = await handleEnquiry(jsonRequest({ ...VALID, message: 'x'.repeat(2001), phone: '+91 98765 43210 12345 6' }), deps);
    const { errors } = await res.json();
    assert.match(errors.message, /2000 characters or fewer/);
    assert.ok(errors.phone);
  });

  it('requires consent', async () => {
    const { deps, sent } = setup();
    const res = await handleEnquiry(jsonRequest({ ...VALID, consent: '' }), deps);
    assert.equal(res.status, 422);
    assert.match((await res.json()).errors.consent, /privacy policy/);
    assert.equal(sent.length, 0);
  });

  it('shows an HTML error page (not a redirect) to no-JavaScript visitors', async () => {
    const { deps } = setup();
    const res = await handleEnquiry(formRequest({ ...VALID, email: 'nope' }), deps);
    assert.equal(res.status, 422);
    assert.match(res.headers.get('content-type') ?? '', /text\/html/);
    const html = await res.text();
    assert.match(html, /Back/);
    assert.match(html, /noindex/);
  });

  it('rejects unreadable bodies and non-POST methods', async () => {
    const { deps } = setup();
    const bad = new Request('https://mmconstructionconsults.com/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://mmconstructionconsults.com' }, body: '{oops' });
    assert.equal((await handleEnquiry(bad, deps)).status, 400);
    const get = await handleEnquiry(jsonRequest({}, 'https://mmconstructionconsults.com', 'GET'), deps);
    assert.equal(get.status, 405);
    assert.equal(get.headers.get('allow'), 'POST');
  });
});

describe('spam protection', () => {
  it('silently accepts and discards a filled honeypot', async () => {
    const { deps, sent } = setup();
    const res = await handleEnquiry(jsonRequest({ ...VALID, company_website: 'http://spam.example' }), deps);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true, redirect: '/thank-you/' });
    assert.equal(sent.length, 0);
  });

  it('silently discards submissions faster than 3 seconds, or JSON without a timestamp', async () => {
    const { deps, sent } = setup();
    assert.equal((await handleEnquiry(jsonRequest({ ...VALID, form_started: String(NOW - 1500) }), deps)).status, 200);
    assert.equal((await handleEnquiry(jsonRequest({ ...VALID, form_started: '' }), deps)).status, 200);
    assert.equal(sent.length, 0);
  });

  it('allows the live domain, www, Netlify previews and localhost; blocks other or missing origins', async () => {
    for (const origin of ['https://www.mmconstructionconsults.com', 'https://deploy-preview-7--mm-construction-consults.netlify.app', 'https://mm-construction-consults.netlify.app', 'http://127.0.0.1:4331', 'http://localhost:4321']) {
      const { deps } = setup();
      assert.equal((await handleEnquiry(jsonRequest(VALID, origin), deps)).status, 200, origin);
    }
    for (const origin of ['https://evil.example', 'https://mmconstructionconsults.com.evil.example', 'https://other-site.netlify.app', null]) {
      const { deps, sent } = setup();
      const res = await handleEnquiry(jsonRequest(VALID, origin), deps);
      assert.equal(res.status, 403, String(origin));
      assert.equal(sent.length, 0);
    }
  });

  it('strips line breaks from header values (no header injection) and escapes HTML in the body', async () => {
    const { deps, sent } = setup();
    await handleEnquiry(jsonRequest({ ...VALID, name: 'Eve\r\nBcc: victim@example.com', service: 'Waterproofing\nX-Evil: 1', message: '<script>alert(1)</script> please call' }), deps);
    const [mail] = sent;
    assert.doesNotMatch(mail.from.name + mail.subject + mail.replyTo.name, /[\r\n]/);
    const raw = (await nodemailer.createTransport({ streamTransport: true, buffer: true, newline: 'unix' }).sendMail(mail)).message.toString();
    const headers = unfold(raw);
    assert.doesNotMatch(headers, /^Bcc:/m);
    assert.doesNotMatch(headers, /^X-Evil:/m);
    assert.ok(mail.html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
    assert.ok(!mail.html.includes('<script>'));
  });

  it('rate-limits to 5 attempts per IP per 10 minutes', async () => {
    const rateLimiter = new MemoryRateLimiter(5, 600_000, () => NOW);
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) {
      const { deps } = setup({ rateLimiter });
      statuses.push((await handleEnquiry(jsonRequest(VALID), deps)).status);
    }
    assert.deepEqual(statuses, [200, 200, 200, 200, 200, 429]);
    const { deps } = setup({ rateLimiter, ip: '198.51.100.9' });
    assert.equal((await handleEnquiry(jsonRequest(VALID), deps)).status, 200, 'other IPs are unaffected');
  });

  it('shares the limit through the store and falls back to memory if the store fails', async () => {
    const data = new Map<string, unknown>();
    const store = { get: async (k: string) => data.get(k) ?? null, setJSON: async (k: string, v: unknown) => { data.set(k, v); } };
    const limiter = new StoreRateLimiter(store, new MemoryRateLimiter(), () => NOW);
    for (let i = 0; i < 5; i++) assert.equal(await limiter.allow('192.0.2.1'), true);
    assert.equal(await limiter.allow('192.0.2.1'), false);
    assert.ok([...data.keys()].every((k) => /^[a-f0-9]{64}$/.test(k)), 'only hashed IPs are stored');
    const broken = new StoreRateLimiter({ get: async () => { throw new Error('down'); }, setJSON: async () => undefined }, new MemoryRateLimiter(1));
    assert.equal(await broken.allow('192.0.2.2'), true);
    assert.equal(await broken.allow('192.0.2.2'), false);
  });
});

describe('server configuration and delivery', () => {
  it('returns 500 when SMTP configuration is missing', async () => {
    const { SMTP_PASS: _omit, ...partial } = ENV;
    const { deps, sent } = setup({ env: partial });
    const res = await handleEnquiry(jsonRequest(VALID), deps);
    assert.equal(res.status, 500);
    const body = await res.json();
    assert.equal(body.code, 'not_configured');
    assert.match(body.message, /\+91 97687 37810/);
    assert.equal(sent.length, 0);
  });

  it('returns 502 with phone and email alternatives when SMTP delivery fails', async () => {
    const { deps } = setup({ failSend: true });
    const res = await handleEnquiry(jsonRequest(VALID), deps);
    assert.equal(res.status, 502);
    const body = await res.json();
    assert.equal(body.code, 'delivery_failed');
    assert.match(body.message, /info@mmconstructionconsults\.com/);
    assert.doesNotMatch(body.message, /535|auth/i, 'SMTP details are not leaked');
  });
});
