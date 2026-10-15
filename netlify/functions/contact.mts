// POST /api/contact: emails a website enquiry through the company's own mailbox over SMTP.
// Configuration (Netlify > Site configuration > Environment variables, scope must include Functions):
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_TO, MAIL_FROM. See docs/EMAIL-SETUP.md.
import type { Config, Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import nodemailer from 'nodemailer';
import { handleEnquiry } from '../lib/enquiry-handler.ts';
import { StoreRateLimiter, MemoryRateLimiter } from '../lib/rate-limit.ts';
import type { EmailMessage, SmtpConfig } from '../lib/email.ts';

// Kept per warm instance; used only if Netlify Blobs is unavailable.
const memoryLimiter = new MemoryRateLimiter();

async function send(message: EmailMessage, smtp: SmtpConfig) {
  const transport = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465, // 465 = implicit TLS; 587 upgrades with STARTTLS
    auth: { user: smtp.user, pass: smtp.pass },
    // Stay inside the browser's 20 s request timeout.
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 12000,
  });
  return transport.sendMail(message);
}

export default async (request: Request, context: Context) => {
  let rateLimiter;
  try {
    rateLimiter = new StoreRateLimiter(getStore({ name: 'contact-rate-limit', consistency: 'strong' }), memoryLimiter);
  } catch {
    rateLimiter = memoryLimiter;
  }
  return handleEnquiry(request, {
    env: (name) => Netlify.env.get(name),
    send,
    rateLimiter,
    ip: context.ip || 'unknown',
    log: (event, detail) => console.error(event, JSON.stringify(detail ?? {})),
  });
};

export const config: Config = { path: '/api/contact' };
