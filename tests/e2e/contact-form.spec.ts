import { test, expect, type Page, type Route } from '@playwright/test';

// The enquiry endpoint is intercepted in every test: nothing reaches the real function or a mailbox.
const ENDPOINT = '**/api/contact';
const VISITOR = { name: 'Test Visitor', email: 'visitor@example.com', phone: '+91 98765 43210', message: 'Cracks in the stilt parking columns of our society.' };

async function fillValid(page: Page) {
  await page.fill('#name', VISITOR.name);
  await page.fill('#phone', VISITOR.phone);
  await page.fill('#email', VISITOR.email);
  await page.selectOption('#service', { label: 'Waterproofing' });
  await page.fill('#location', 'Ghatkopar');
  await page.fill('#message', VISITOR.message);
  await page.check('#consent');
}

// The Google Maps embed on the contact page is third-party and slow to load; it is not under test.
test.beforeEach(async ({ page }) => {
  await page.route(/google\.com|gstatic\.com|googleapis\.com/, (route) => route.abort());
});

const reply = (status: number, body: unknown) => (route: Route) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

async function expectDataKept(page: Page) {
  await expect(page.locator('#name')).toHaveValue(VISITOR.name);
  await expect(page.locator('#email')).toHaveValue(VISITOR.email);
  await expect(page.locator('#message')).toHaveValue(VISITOR.message);
}

test.describe('contact form with JavaScript', () => {
  test('success sends JSON in the background and lands on /thank-you/', async ({ page }) => {
    let payload: Record<string, string> = {};
    await page.route(ENDPOINT, async (route) => {
      payload = route.request().postDataJSON();
      expect(route.request().headers()['content-type']).toContain('application/json');
      await reply(200, { ok: true, redirect: '/thank-you/' })(route);
    });
    await page.goto('/contact/');
    await fillValid(page);
    await page.click('[data-submit]');
    await page.waitForURL('**/thank-you/');
    await expect(page.locator('h1')).toContainText('Thank you');
    expect(payload).toMatchObject({ name: VISITOR.name, email: VISITOR.email, consent: 'on', company_website: '', service: 'Waterproofing' });
    expect(Number(payload.form_started)).toBeGreaterThan(0);
    expect(payload.page).toContain('/contact/');
  });

  test('shows field messages, a summary, aria links and focuses the first invalid field', async ({ page }) => {
    let calls = 0;
    await page.route(ENDPOINT, (route) => { calls++; return route.abort(); });
    await page.goto('/contact/');
    await page.click('[data-submit]');
    const summary = page.locator('#form-summary');
    await expect(summary).toBeVisible();
    await expect(summary).toContainText('Please correct');
    await expect(page.locator('#name')).toBeFocused();
    for (const field of ['name', 'phone', 'email', 'service', 'message', 'consent']) {
      await expect(page.locator(`#${field}`)).toHaveAttribute('aria-invalid', 'true');
      await expect(page.locator(`#${field}`)).toHaveAttribute('aria-describedby', new RegExp(`${field}-error`));
      await expect(page.locator(`#${field}-error`)).toBeVisible();
    }
    await expect(page.locator('#location')).not.toHaveAttribute('aria-invalid', 'true'); // optional
    expect(calls).toBe(0);
  });

  test('checks formats and minimum lengths even for script-set (autofilled) values', async ({ page }) => {
    await page.goto('/contact/');
    await fillValid(page);
    // Autofill-style programmatic values: validity.tooShort never fires for these.
    await page.evaluate(() => {
      (document.querySelector('#name') as HTMLInputElement).value = 'A';
      (document.querySelector('#message') as HTMLTextAreaElement).value = 'Too short';
    });
    await page.fill('#email', 'visitor@');
    await page.fill('#phone', '12345');
    await page.click('[data-submit]');
    await expect(page.locator('#name-error')).toContainText('at least 2 characters');
    await expect(page.locator('#message-error')).toContainText('at least 10 characters');
    await expect(page.locator('#email-error')).toContainText('valid email');
    await expect(page.locator('#phone-error')).toContainText('10 to 15 digits');
    await page.fill('#phone', '+91 98765 43210');
    await expect(page.locator('#phone-error')).toBeHidden(); // clears as soon as it is fixed
  });

  test('shows server-side field errors (422) next to the fields', async ({ page }) => {
    await page.route(ENDPOINT, reply(422, { ok: false, code: 'invalid', errors: { email: 'Enter a valid email address, like name@example.com.' } }));
    await page.goto('/contact/');
    await fillValid(page);
    await page.click('[data-submit]');
    await expect(page.locator('#email-error')).toContainText('valid email');
    await expect(page.locator('#email')).toBeFocused();
    await expectDataKept(page);
  });

  for (const status of [500, 502]) {
    test(`delivery failure (${status}) offers phone, WhatsApp and email and keeps the data`, async ({ page }) => {
      await page.route(ENDPOINT, reply(status, { ok: false, code: status === 500 ? 'not_configured' : 'delivery_failed' }));
      await page.goto('/contact/');
      await fillValid(page);
      await page.click('[data-submit]');
      const status_ = page.locator('#enquiry-status');
      await expect(status_).toContainText('could not be delivered');
      await expect(status_).toContainText('+91 97687 37810');
      await expect(status_).toContainText('info@mmconstructionconsults.com');
      await expect(page.locator('[data-submit]')).toBeEnabled();
      await expectDataKept(page);
    });
  }

  test('rate limit (429) explains the wait', async ({ page }) => {
    await page.route(ENDPOINT, reply(429, { ok: false, code: 'rate_limited' }));
    await page.goto('/contact/');
    await fillValid(page);
    await page.click('[data-submit]');
    await expect(page.locator('#enquiry-status')).toContainText('wait 10 minutes');
    await expectDataKept(page);
  });

  test('times out after 20 seconds with a clear message, buttons disabled while sending', async ({ page }) => {
    await page.clock.install();
    await page.route(ENDPOINT, () => { /* never answer */ });
    await page.goto('/contact/');
    await fillValid(page);
    await page.click('[data-submit]');
    await expect(page.locator('[data-submit]')).toBeDisabled();
    await expect(page.locator('[data-whatsapp-send]')).toBeDisabled();
    await expect(page.locator('#enquiry-status')).toContainText('Sending');
    await page.clock.runFor(20_500);
    await expect(page.locator('#enquiry-status')).toContainText('took too long');
    await expect(page.locator('[data-submit]')).toBeEnabled();
    await expectDataKept(page);
  });

  test('offline: does not send and keeps the data', async ({ page, context }) => {
    let calls = 0;
    await page.route(ENDPOINT, (route) => { calls++; return route.abort(); });
    await page.goto('/contact/');
    await fillValid(page);
    await context.setOffline(true);
    await page.click('[data-submit]');
    await expect(page.locator('#enquiry-status')).toContainText('offline');
    expect(calls).toBe(0);
    await context.setOffline(false);
    await expectDataKept(page);
  });

  test('network failure shows a connection message', async ({ page }) => {
    await page.route(ENDPOINT, (route) => route.abort('failed'));
    await page.goto('/contact/');
    await fillValid(page);
    await page.click('[data-submit]');
    await expect(page.locator('#enquiry-status')).toContainText('could not reach our server');
    await expectDataKept(page);
  });

  test('typed details survive a reload, and buttons are re-enabled after coming Back', async ({ page }) => {
    await page.route(ENDPOINT, reply(200, { ok: true, redirect: '/thank-you/' }));
    await page.goto('/contact/');
    await fillValid(page);
    await page.reload();
    await expectDataKept(page);
    await page.click('[data-submit]');
    await page.waitForURL('**/thank-you/');
    await page.goBack();
    await expect(page.locator('[data-submit]')).toBeEnabled();
    await expect(page.locator('[data-whatsapp-send]')).toBeEnabled();
  });

  test('WhatsApp button opens a pre-filled chat without the bot timer or email', async ({ page }) => {
    let posted = false;
    await page.route(ENDPOINT, (route) => { posted = true; return route.abort(); });
    await page.goto('/contact/');
    await page.evaluate(() => { (window as unknown as { opened: string[] }).opened = []; window.open = (url) => { (window as unknown as { opened: string[] }).opened.push(String(url)); return null; }; });
    await page.fill('#name', VISITOR.name);
    await page.fill('#phone', VISITOR.phone);
    await page.selectOption('#service', { label: 'Waterproofing' });
    await page.fill('#message', VISITOR.message);
    await page.click('[data-whatsapp-send]'); // immediately: exempt from the 3-second timer
    const opened = await page.evaluate(() => (window as unknown as { opened: string[] }).opened);
    expect(opened).toHaveLength(1);
    expect(opened[0]).toMatch(/^https:\/\/wa\.me\/919768737810\?text=/);
    expect(decodeURIComponent(opened[0])).toContain(VISITOR.name);
    await expect(page.locator('#enquiry-result')).toBeVisible();
    expect(posted).toBe(false);
  });
});

test.describe('contact form without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('posts a normal form and follows the 303 redirect to /thank-you/', async ({ page }) => {
    let body = '';
    await page.route(ENDPOINT, async (route) => {
      body = route.request().postData() ?? '';
      expect(route.request().headers()['content-type']).toContain('application/x-www-form-urlencoded');
      await route.fulfill({ status: 303, headers: { Location: '/thank-you/' } });
    });
    await page.goto('/contact/');
    await expect(page.locator('#enquiry-form')).toHaveAttribute('method', 'post');
    await expect(page.locator('[data-whatsapp-send]')).toBeHidden(); // needs JavaScript
    // Playwright's click stability check needs page JavaScript, so tick and submit with the keyboard.
    await page.fill('#name', VISITOR.name);
    await page.fill('#phone', VISITOR.phone);
    await page.fill('#email', VISITOR.email);
    await page.selectOption('#service', { label: 'Waterproofing' });
    await page.fill('#message', VISITOR.message);
    await page.focus('#consent');
    await page.keyboard.press('Space');
    await page.focus('[data-submit]');
    await page.keyboard.press('Enter');
    await page.waitForURL('**/thank-you/');
    const params = new URLSearchParams(body);
    expect(params.get('name')).toBe(VISITOR.name);
    expect(params.get('consent')).toBe('on');
  });
});
