// Enquiry-form rules shared by the browser (src/scripts/enquiry-form.ts) and the
// Netlify Function (netlify/lib/enquiry-handler.ts), so both validate identically.
// Plain, type-strippable TypeScript only: Node's test runner imports this file directly.

export const ENDPOINT = '/api/contact';
export const THANK_YOU_PATH = '/thank-you/';
/** Hidden spam-trap field. Real visitors never see or fill it. */
export const HONEYPOT_FIELD = 'company_website';
/** Submissions completed faster than this after page load are treated as bots. */
export const MIN_FILL_MS = 3000;
export const REQUEST_TIMEOUT_MS = 20000;

export type FieldName = 'name' | 'email' | 'phone' | 'service' | 'location' | 'message' | 'consent';
export type EnquiryFields = Record<FieldName, string>;
export type FieldErrors = Partial<Record<FieldName, string>>;

interface Rule { label: string; required: boolean; min?: number; max: number; missing?: string }

export const RULES: Record<FieldName, Rule> = {
  name: { label: 'Your name', required: true, min: 2, max: 100, missing: 'Please enter your name.' },
  email: { label: 'Email', required: true, max: 254, missing: 'Please enter your email address.' },
  phone: { label: 'Phone number', required: true, max: 20, missing: 'Please enter your phone number.' },
  service: { label: 'Service required', required: true, max: 100, missing: 'Please choose the service you need.' },
  location: { label: 'Project location', required: false, max: 150 },
  message: { label: 'Message', required: true, min: 10, max: 2000, missing: 'Please tell us a little about your project.' },
  consent: { label: 'Consent', required: true, max: 10 },
};
export const FIELD_NAMES = Object.keys(RULES) as FieldName[];

const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
const PHONE_CHARS = /^[+\d\s().-]+$/;
const CONSENT_VALUES = new Set(['on', 'true', 'yes', '1']);

export const digitsOf = (phone: string): string => phone.replace(/\D/g, '');

/** Trims every known field and coerces missing values to "". Unknown keys are dropped. */
export function normalise(input: Record<string, unknown>): EnquiryFields {
  const out = {} as EnquiryFields;
  for (const name of FIELD_NAMES) {
    const raw = input[name];
    out[name] = typeof raw === 'string' ? raw.trim() : typeof raw === 'boolean' ? String(raw) : '';
  }
  return out;
}

/**
 * Validates one field. Minimum lengths are checked by hand because the browser's
 * validity.tooShort does not fire for autofilled or script-set values.
 */
export function validateField(name: FieldName, value: string): string | undefined {
  const rule = RULES[name];
  if (name === 'consent') {
    return CONSENT_VALUES.has(value.toLowerCase()) ? undefined : 'Please tick the box to agree to our privacy policy so we can reply.';
  }
  if (!value) return rule.required ? rule.missing : undefined;
  if (rule.min && value.length < rule.min) return `${rule.label} must be at least ${rule.min} characters.`;
  if (value.length > rule.max) return `${rule.label} must be ${rule.max} characters or fewer.`;
  if (name === 'email' && !EMAIL.test(value)) return 'Enter a valid email address, like name@example.com.';
  if (name === 'phone') {
    const digits = digitsOf(value).length;
    if (!PHONE_CHARS.test(value) || digits < 10 || digits > 15) return 'Enter a phone number with 10 to 15 digits, e.g. +91 98765 43210.';
  }
  return undefined;
}

export function validate(fields: EnquiryFields): FieldErrors {
  const errors: FieldErrors = {};
  for (const name of FIELD_NAMES) {
    const error = validateField(name, fields[name]);
    if (error) errors[name] = error;
  }
  return errors;
}
