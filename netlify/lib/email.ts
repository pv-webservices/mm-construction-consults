// Builds the enquiry email: sent from the company's own mailbox, shown as "<Visitor> via M.M. Construction Website",
// with Reply-To set to the visitor. No third-party branding.
import type { EnquiryFields } from '../../src/lib/enquiry.ts';

export interface SmtpConfig { host: string; port: number; user: string; pass: string; to: string; from: string }
export interface Address { name: string; address: string }
export interface EmailMessage { from: Address; to: string; replyTo: Address; subject: string; text: string; html: string }
export interface EmailMeta { formType: string; page: string; receivedAt: Date }

export const SITE_NAME = 'M.M. Construction Website';
export const TIME_ZONE = 'Asia/Kolkata';
const SUSPICIOUS = /\b(viagra|cialis|casino|betting|crypto|bitcoin|forex|loan offer|seo services?|backlinks?|guest post|rank(ing)? your (site|website)|web ?traffic|porn|escort|telegram)\b/i;

/** Removes CR, LF and other control characters so a value can never add an email header. */
export const headerSafe = (value: string): string => value.replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, ' ').replace(/\s{2,}/g, ' ').trim();

export const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Flags likely spam in the subject line instead of silently dropping it. */
export function looksSuspicious(fields: EnquiryFields): boolean {
  const text = `${fields.name} ${fields.message} ${fields.location}`;
  const links = (text.match(/https?:\/\/|www\./gi) ?? []).length;
  return SUSPICIOUS.test(text) || links > 2;
}

export function formatTime(date: Date): string {
  return `${new Intl.DateTimeFormat('en-IN', { timeZone: TIME_ZONE, dateStyle: 'full', timeStyle: 'short' }).format(date)} (IST)`;
}

export function buildEmail(fields: EnquiryFields, meta: EmailMeta, smtp: Pick<SmtpConfig, 'to' | 'from'>): EmailMessage {
  const name = headerSafe(fields.name).slice(0, 100);
  const service = headerSafe(fields.service).slice(0, 100);
  const subject = `${looksSuspicious(fields) ? '[Possible spam] ' : ''}New enquiry from ${name}: ${service}`;
  const rows: [string, string][] = [
    ['Form', meta.formType],
    ['Name', fields.name],
    ['Email', fields.email],
    ['Phone', fields.phone],
    ['Service required', fields.service],
    ['Project location', fields.location || 'Not provided'],
    ['Message', fields.message],
    ['Privacy consent', 'Yes, agreed to the privacy policy'],
    ['Sent from page', meta.page || 'Not available'],
    ['Received', formatTime(meta.receivedAt)],
  ];
  const text = `${subject}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nReply to this email to answer ${name} directly.\n`;
  const cell = 'padding:10px 14px;border-bottom:1px solid #e2e8f0;vertical-align:top;font:15px/1.5 Arial,Helvetica,sans-serif;';
  const html = `<!doctype html><html lang="en"><body style="margin:0;padding:24px;background:#f3f6fa;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;">
<tr><td colspan="2" style="background:#0b2545;color:#ffffff;padding:18px 20px;font:bold 18px Arial,Helvetica,sans-serif;">M.M. Construction &amp; Consults<br><span style="font-weight:normal;font-size:14px;color:#dbe4f0;">${escapeHtml(subject)}</span></td></tr>
${rows.map(([k, v]) => `<tr><th align="left" style="${cell}width:34%;color:#566274;">${escapeHtml(k)}</th><td style="${cell}color:#0f1b2d;white-space:pre-wrap;">${escapeHtml(v)}</td></tr>`).join('\n')}
<tr><td colspan="2" style="padding:14px 20px;font:13px Arial,Helvetica,sans-serif;color:#566274;border-top:4px solid #d7141c;">Reply to this email to answer ${escapeHtml(name)} directly.</td></tr>
</table></body></html>`;
  return {
    from: { name: `${name} via ${SITE_NAME}`, address: smtp.from },
    to: smtp.to,
    replyTo: { name, address: headerSafe(fields.email) },
    subject,
    text,
    html,
  };
}
