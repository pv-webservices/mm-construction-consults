// Enquiry endpoint logic, independent of Netlify so it can be unit-tested with a mocked transport.
// netlify/functions/contact.mts wires it to the real SMTP transport and rate-limit store.
import {
  HONEYPOT_FIELD, MIN_FILL_MS, THANK_YOU_PATH, RULES,
  normalise, validate, type EnquiryFields, type FieldErrors,
} from '../../src/lib/enquiry.ts';
import { buildEmail, type EmailMessage, type SmtpConfig } from './email.ts';

export const SMTP_VARS = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'MAIL_TO', 'MAIL_FROM'] as const;
const MAX_BODY_BYTES = 20_000;

/** Origins allowed to post the form: production, www, Netlify previews of this site and local development. */
const ALLOWED_ORIGINS = [
  /^https:\/\/(www\.)?mmconstructionconsults\.com$/,
  /^https:\/\/([a-z0-9-]+--)?mm-construction-consults\.netlify\.app$/,
  /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/,
];

export interface RateLimiter { allow(key: string): Promise<boolean> }

export interface HandlerDeps {
  env: (name: string) => string | undefined;
  send: (message: EmailMessage, smtp: SmtpConfig) => Promise<unknown>;
  rateLimiter: RateLimiter;
  ip: string;
  now?: () => number;
  log?: (event: string, detail?: Record<string, unknown>) => void;
}

type Outcome =
  | { kind: 'sent' }
  | { kind: 'discarded' } // honeypot or too fast: answered exactly like a success
  | { kind: 'invalid'; errors: FieldErrors }
  | { kind: 'error'; status: number; code: string; message: string };

const ALTERNATIVES = 'Please call +91 97687 37810, message us on WhatsApp, or email info@mmconstructionconsults.com.';

export function isAllowedOrigin(request: Request, extra: string[] = []): boolean {
  let origin = request.headers.get('origin');
  if (!origin || origin === 'null') {
    const referer = request.headers.get('referer');
    try { origin = referer ? new URL(referer).origin : null; } catch { origin = null; }
  }
  if (!origin) return false;
  return extra.includes(origin) || ALLOWED_ORIGINS.some((pattern) => pattern.test(origin));
}

async function readBody(request: Request): Promise<{ data: Record<string, unknown>; isJson: boolean } | null> {
  const type = request.headers.get('content-type') ?? '';
  const text = await request.text();
  if (Buffer.byteLength(text) > MAX_BODY_BYTES) return null;
  if (type.includes('application/json')) {
    try {
      const parsed: unknown = JSON.parse(text);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? { data: parsed as Record<string, unknown>, isJson: true } : null;
    } catch { return null; }
  }
  if (type.includes('application/x-www-form-urlencoded')) {
    return { data: Object.fromEntries(new URLSearchParams(text)), isJson: false };
  }
  return null;
}

const str = (value: unknown, max = 500): string => (typeof value === 'string' ? value.trim().slice(0, max) : '');

/** Only an http(s) URL on an allowed origin is reported as the source page. */
function sourcePage(value: unknown, request: Request): string {
  const candidate = str(value, 300) || request.headers.get('referer') || '';
  try {
    const url = new URL(candidate);
    return ALLOWED_ORIGINS.some((p) => p.test(url.origin)) ? url.href : '';
  } catch { return ''; }
}

async function evaluate(request: Request, deps: HandlerDeps): Promise<{ outcome: Outcome; isJson: boolean }> {
  const wantsJson = (request.headers.get('content-type') ?? '').includes('application/json');
  const fail = (status: number, code: string, message: string) => ({ outcome: { kind: 'error', status, code, message } as Outcome, isJson: wantsJson });
  const now = deps.now?.() ?? Date.now();

  const extraOrigins = (deps.env('ALLOWED_ORIGINS') ?? '').split(',').map((o) => o.trim()).filter(Boolean);
  if (!isAllowedOrigin(request, extraOrigins)) return fail(403, 'forbidden_origin', 'This form can only be sent from our website.');

  if (!(await deps.rateLimiter.allow(deps.ip))) {
    return fail(429, 'rate_limited', `Too many enquiries were sent from your connection. Please wait 10 minutes and try again. ${ALTERNATIVES}`);
  }

  const body = await readBody(request);
  if (!body) return fail(400, 'bad_request', `We could not read the form. ${ALTERNATIVES}`);
  const { data, isJson } = body;

  // Bots: accept silently and discard, so they learn nothing.
  if (str(data[HONEYPOT_FIELD])) return { outcome: { kind: 'discarded' }, isJson };
  const started = Number(str(data.form_started, 20));
  // With JavaScript the page-load timestamp is always sent; without JavaScript it cannot be (the page is static).
  if (isJson && !(started > 0)) return { outcome: { kind: 'discarded' }, isJson };
  if (started > 0 && now - started < MIN_FILL_MS) return { outcome: { kind: 'discarded' }, isJson };

  const fields: EnquiryFields = normalise(data);
  const errors = validate(fields);
  if (Object.keys(errors).length) return { outcome: { kind: 'invalid', errors }, isJson };

  const missing = SMTP_VARS.filter((name) => !deps.env(name));
  if (missing.length) {
    deps.log?.('contact: SMTP configuration missing', { missing });
    return fail(500, 'not_configured', `Our email form is not available right now. ${ALTERNATIVES}`);
  }
  const smtp: SmtpConfig = {
    host: deps.env('SMTP_HOST')!, port: Number(deps.env('SMTP_PORT')), user: deps.env('SMTP_USER')!,
    pass: deps.env('SMTP_PASS')!, to: deps.env('MAIL_TO')!, from: deps.env('MAIL_FROM')!,
  };
  const message = buildEmail(fields, {
    formType: str(data.form_type, 60) || 'Website enquiry',
    page: sourcePage(data.page, request),
    receivedAt: new Date(now),
  }, smtp);
  try {
    await deps.send(message, smtp);
  } catch (error) {
    deps.log?.('contact: SMTP delivery failed', { error: error instanceof Error ? error.message : String(error) });
    return fail(502, 'delivery_failed', `Sorry, your enquiry could not be delivered. ${ALTERNATIVES}`);
  }
  return { outcome: { kind: 'sent' }, isJson };
}

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
});

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Minimal page for visitors without JavaScript. Their entries stay in the form when they go Back. */
function errorPage(status: number, title: string, items: string[]): Response {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, follow"><title>${escapeHtml(title)} | M.M. Construction</title>
<style>body{font:17px/1.6 system-ui,sans-serif;color:#0f1b2d;max-width:640px;margin:40px auto;padding:0 16px}h1{font-size:26px;color:#0b2545}li{margin:6px 0}a{color:#b10f16;font-weight:600}.box{border:2px solid #d7141c;border-radius:10px;padding:16px 20px;background:#fff5f5}</style></head>
<body><main><h1>${escapeHtml(title)}</h1><div class="box"><ul>${items.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul></div>
<p>Use your browser's <strong>Back</strong> button to return to the form. Your details are still there.</p>
<p>Or contact us directly: <a href="tel:+919768737810">+91 97687 37810</a> · <a href="https://wa.me/919768737810">WhatsApp</a> · <a href="mailto:info@mmconstructionconsults.com">info@mmconstructionconsults.com</a></p>
<p><a href="/contact/">Contact page</a> · <a href="/">Home</a></p></main></body></html>`;
  return new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}

export async function handleEnquiry(request: Request, deps: HandlerDeps): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST', 'Cache-Control': 'no-store' } });
  }
  const { outcome, isJson } = await evaluate(request, deps);
  switch (outcome.kind) {
    case 'sent':
    case 'discarded':
      return isJson
        ? json(200, { ok: true, redirect: THANK_YOU_PATH })
        : new Response(null, { status: 303, headers: { Location: THANK_YOU_PATH, 'Cache-Control': 'no-store' } });
    case 'invalid':
      return isJson
        ? json(422, { ok: false, code: 'invalid', errors: outcome.errors })
        : errorPage(422, 'Please check the form', Object.entries(outcome.errors).map(([field, msg]) => `${RULES[field as keyof typeof RULES].label}: ${msg}`));
    case 'error':
      return isJson
        ? json(outcome.status, { ok: false, code: outcome.code, message: outcome.message })
        : errorPage(outcome.status, 'Your enquiry was not sent', [outcome.message]);
  }
}
