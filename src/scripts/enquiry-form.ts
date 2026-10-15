// Progressive enhancement for the contact form. Without JavaScript the form posts normally to
// /api/contact and the server answers 303 -> /thank-you/. With it: inline validation, background
// JSON submission with a 20 s timeout, clear error states, and the visitor's text is never lost.
import {
  ENDPOINT, THANK_YOU_PATH, REQUEST_TIMEOUT_MS, FIELD_NAMES, HONEYPOT_FIELD,
  validateField, validate, type FieldName, type FieldErrors, type EnquiryFields,
} from '../lib/enquiry';

const DRAFT_KEY = 'mm-enquiry-draft';
const PHONE = '+91 97687 37810';
const EMAIL = 'info@mmconstructionconsults.com';

const MESSAGES = {
  sending: 'Sending your enquiry…',
  summary: (n: number) => `Please correct ${n === 1 ? 'the highlighted field' : `${n} highlighted fields`} below. Your details have been kept.`,
  offline: `You appear to be offline. Your details are still in the form. Reconnect and press Send again, or call ${PHONE}.`,
  timeout: `The server took too long to respond, so we are not sure your enquiry was sent. Your details are still here. Please try again, or call ${PHONE} / email ${EMAIL}.`,
  network: `We could not reach our server. Check your connection and try again. Your details are still here. You can also call ${PHONE} or email ${EMAIL}.`,
  delivery: `Sorry, your enquiry could not be delivered just now. Your details are still here. Please call ${PHONE}, use the WhatsApp button, or email ${EMAIL}.`,
  rateLimited: `Too many enquiries were sent from your connection. Please wait 10 minutes, or call ${PHONE} / email ${EMAIL}.`,
};

const form = document.querySelector<HTMLFormElement>('#enquiry-form');

function storage(): Storage | null {
  try { return window.sessionStorage; } catch { return null; }
}

if (form) {
  form.noValidate = true; // our messages replace the browser's bubbles once JavaScript runs
  const submitButton = form.querySelector<HTMLButtonElement>('[data-submit]');
  const whatsappButton = form.querySelector<HTMLButtonElement>('[data-whatsapp-send]');
  const status = form.querySelector<HTMLElement>('#enquiry-status');
  const summary = form.querySelector<HTMLElement>('#form-summary');
  const control = (name: FieldName) => form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
  const hidden = (name: string) => form.elements.namedItem(name) as HTMLInputElement | null;
  let sending = false;

  // Page-load timestamp for the server's 3-second bot check, and the exact source page.
  const started = hidden('form_started');
  if (started) started.value = String(Date.now());
  const page = hidden('page');
  if (page) page.value = location.href.split('#')[0];
  if (whatsappButton) whatsappButton.hidden = false;

  const read = (): EnquiryFields => {
    const fields = {} as EnquiryFields;
    for (const name of FIELD_NAMES) {
      const el = control(name);
      fields[name] = el instanceof HTMLInputElement && el.type === 'checkbox' ? (el.checked ? 'on' : '') : (el?.value ?? '').trim();
    }
    return fields;
  };

  // Keep a draft in this tab so a failed send, reload or Back never loses what the visitor typed.
  const saveDraft = () => storage()?.setItem(DRAFT_KEY, JSON.stringify(read()));
  const restoreDraft = () => {
    try {
      const draft = JSON.parse(storage()?.getItem(DRAFT_KEY) ?? 'null') as Partial<EnquiryFields> | null;
      if (!draft) return;
      for (const name of FIELD_NAMES) {
        const el = control(name);
        const value = draft[name];
        if (!el || !value) continue;
        if (el instanceof HTMLInputElement && el.type === 'checkbox') el.checked = value === 'on';
        else if (!el.value) el.value = value;
      }
    } catch { /* ignore an unreadable draft */ }
  };
  restoreDraft();

  // A service chosen on a service page arrives as ?service=...
  const queryService = new URLSearchParams(location.search).get('service');
  const service = control('service') as HTMLSelectElement | null;
  if (queryService && service && Array.from(service.options).some((o) => o.value === queryService)) service.value = queryService;

  const setFieldError = (name: FieldName, message?: string) => {
    const el = control(name);
    const box = form.querySelector<HTMLElement>(`#${name}-error`);
    if (!el || !box) return;
    if (message) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
    box.textContent = message ?? '';
    box.hidden = !message;
  };

  const showStatus = (text: string, kind: 'info' | 'error' = 'info') => {
    if (!status) return;
    status.hidden = !text;
    status.textContent = text;
    status.classList.toggle('error', kind === 'error');
  };

  const showErrors = (errors: FieldErrors) => {
    const names = FIELD_NAMES.filter((n) => errors[n]);
    for (const name of FIELD_NAMES) setFieldError(name, errors[name]);
    if (!summary) return;
    if (!names.length) { summary.hidden = true; summary.replaceChildren(); return; }
    const heading = document.createElement('p');
    heading.textContent = MESSAGES.summary(names.length);
    const list = document.createElement('ul');
    for (const name of names) {
      const link = document.createElement('a');
      link.href = `#${name}`;
      link.textContent = errors[name] ?? '';
      link.addEventListener('click', (e) => { e.preventDefault(); control(name)?.focus(); });
      const item = document.createElement('li');
      item.append(link);
      list.append(item);
    }
    summary.replaceChildren(heading, list);
    summary.hidden = false;
    control(names[0])?.focus();
  };

  const setBusy = (busy: boolean) => {
    sending = busy;
    if (submitButton) submitButton.disabled = busy;
    if (whatsappButton) whatsappButton.disabled = busy;
    form.setAttribute('aria-busy', String(busy));
  };

  // While a form button is being pressed, skip blur validation: a message appearing on blur would shift
  // the layout so the mouse-up misses the moved button and the click is lost. Submit validates everything anyway.
  let pressingButton = false;
  form.addEventListener('pointerdown', (event) => {
    if (!(event.target instanceof Element) || !event.target.closest('button')) return;
    pressingButton = true;
    window.setTimeout(() => { pressingButton = false; }, 500);
  });

  // Re-validate a field once the visitor has been told about it, and on leaving it.
  for (const name of FIELD_NAMES) {
    const el = control(name);
    if (!el) continue;
    const check = () => setFieldError(name, validateField(name, read()[name]));
    el.addEventListener('blur', () => { if (!pressingButton && read()[name]) check(); });
    el.addEventListener('input', () => { saveDraft(); if (el.getAttribute('aria-invalid') === 'true') check(); });
    el.addEventListener('change', () => { saveDraft(); if (el.getAttribute('aria-invalid') === 'true') check(); });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;
    const fields = read();
    const errors = validate(fields);
    showErrors(errors);
    if (Object.keys(errors).length) { showStatus(''); return; }
    saveDraft();
    if (!navigator.onLine) { showStatus(MESSAGES.offline, 'error'); return; }

    setBusy(true);
    showStatus(MESSAGES.sending);
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...fields,
          [HONEYPOT_FIELD]: hidden(HONEYPOT_FIELD)?.value ?? '',
          form_started: started?.value ?? '',
          form_type: hidden('form_type')?.value ?? '',
          page: page?.value ?? '',
        }),
        signal: controller.signal,
      });
      const result = await response.json().catch(() => ({})) as { ok?: boolean; errors?: FieldErrors; redirect?: string };
      if (response.ok && result.ok) {
        storage()?.removeItem(DRAFT_KEY);
        location.assign(result.redirect ?? THANK_YOU_PATH);
        return; // keep the buttons disabled while the next page loads
      }
      if (response.status === 422 && result.errors) { showErrors(result.errors); showStatus(''); }
      else if (response.status === 429) showStatus(MESSAGES.rateLimited, 'error');
      else showStatus(MESSAGES.delivery, 'error');
    } catch (error) {
      const aborted = error instanceof DOMException && error.name === 'AbortError';
      showStatus(aborted ? MESSAGES.timeout : navigator.onLine ? MESSAGES.network : MESSAGES.offline, 'error');
    } finally {
      window.clearTimeout(timer);
    }
    setBusy(false);
  });

  // Coming back with the Back button can restore a frozen page with disabled buttons.
  window.addEventListener('pageshow', () => { setBusy(false); showStatus(''); });

  // WhatsApp: opens a pre-filled chat. Exempt from the bot timer; email and consent are not needed here.
  whatsappButton?.addEventListener('click', () => {
    const fields = read();
    const needed: FieldName[] = ['name', 'phone', 'service', 'message'];
    const errors: FieldErrors = {};
    for (const name of needed) { const e = validateField(name, fields[name]); if (e) errors[name] = e; }
    showErrors(errors);
    if (Object.keys(errors).length) return;
    const message = `Hello M.M. Construction & Consults, I would like a consultation.\n\nName: ${fields.name}\nPhone: ${fields.phone}${fields.email ? `\nEmail: ${fields.email}` : ''}\nService: ${fields.service}${fields.location ? `\nProject location: ${fields.location}` : ''}\n\n${fields.message}`;
    const url = `https://wa.me/${form.dataset.whatsapp}?text=${encodeURIComponent(message)}`;
    const result = document.querySelector<HTMLElement>('#enquiry-result');
    const draft = document.querySelector<HTMLElement>('#enquiry-draft');
    const link = document.querySelector<HTMLAnchorElement>('#open-whatsapp');
    if (draft) draft.textContent = message;
    if (link) link.href = url;
    if (result) { result.hidden = false; result.focus(); }
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  document.querySelector('[data-copy-enquiry]')?.addEventListener('click', async (event) => {
    const button = event.currentTarget as HTMLButtonElement;
    try {
      await navigator.clipboard.writeText(document.querySelector('#enquiry-draft')?.textContent ?? '');
      button.textContent = 'Enquiry copied';
    } catch {
      button.textContent = 'Select and copy the enquiry text above';
    }
  });
}
