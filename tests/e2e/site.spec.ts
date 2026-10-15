import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { builtPages, VIEWPORTS } from './pages';

const PAGES = builtPages();
/** WCAG 2.2 "Target Size (Minimum)": 24×24 CSS px. Inline text links inside sentences are exempt. */
const MIN_TARGET = 24;

/** Loads lazy images and waits for every image to finish. Returns sources that failed to decode. */
async function brokenImages(page: Page): Promise<string[]> {
  return page.evaluate(async () => {
    const imgs = [...document.images];
    imgs.forEach((img) => { img.loading = 'eager'; });
    await Promise.all(imgs.map((img) => (img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; }))));
    return imgs.filter((img) => !img.naturalWidth).map((img) => img.currentSrc || img.src);
  });
}

test.describe('every page', () => {
  for (const url of PAGES) {
    test(`${url}: no console errors, failed requests or broken images; axe WCAG 2.1 AA clean`, async ({ page }) => {
      test.setTimeout(120_000); // image decoding + axe on the longest pages, with parallel workers
      const errors: string[] = [];
      page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
      page.on('pageerror', (err) => errors.push(err.message));
      // ERR_ABORTED = the browser cancelled a request it no longer needed (e.g. a srcset candidate it replaced).
      page.on('requestfailed', (req) => { if (req.url().startsWith('http://127.0.0.1') && !/ERR_ABORTED/.test(req.failure()?.errorText ?? '')) errors.push(`failed: ${req.url()} ${req.failure()?.errorText}`); });
      page.on('response', (res) => { if (res.url().startsWith('http://127.0.0.1') && res.status() >= 400) errors.push(`${res.status()}: ${res.url()}`); });
      // Third-party embeds (Google Maps) are outside the site's control and are blocked in tests.
      await page.route(/google\.com|gstatic\.com|googleapis\.com/, (route) => route.abort());
      await page.goto(url, { waitUntil: 'load' });
      expect(await brokenImages(page)).toEqual([]);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).exclude('iframe').analyze();
      const violations = results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
      expect(violations).toEqual([]);
      expect(errors.filter((e) => !/google/.test(e))).toEqual([]);
    });
  }
});

test.describe('responsive layout', () => {
  for (const width of VIEWPORTS) {
    test(`${width}px: no horizontal scroll and tap targets of at least ${MIN_TARGET}px on every page`, async ({ page }) => {
      test.setTimeout(240_000);
      await page.setViewportSize({ width, height: 900 });
      await page.route(/google\.com|gstatic\.com|googleapis\.com/, (route) => route.abort());
      const problems: string[] = [];
      for (const url of PAGES) {
        await page.goto(url);
        const result = await page.evaluate((min) => {
          const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
          const small: string[] = [];
          for (const el of document.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, summary')) {
            const style = getComputedStyle(el);
            if (el.closest('[hidden], dialog:not([open]), .hp-field') || style.visibility === 'hidden' || style.display === 'none') continue;
            const r = el.getBoundingClientRect();
            if (!r.width || !r.height) continue;
            // Exempt: links inside running text (WCAG 2.5.8 inline exception).
            const parent = el.parentElement;
            if (el.tagName === 'A' && parent && ['P', 'LI', 'SPAN', 'DD', 'SMALL', 'LABEL'].includes(parent.tagName) && (parent.textContent ?? '').trim().length > (el.textContent ?? '').trim().length + 3) continue;
            if (r.width < min || r.height < min) small.push(`${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
          }
          return { overflow, small };
        }, MIN_TARGET);
        if (result.overflow > 0) problems.push(`${url}: horizontal overflow ${result.overflow}px`);
        for (const s of result.small) problems.push(`${url}: small target ${s}`);
      }
      expect(problems).toEqual([]);
    });
  }
});

test.describe('keyboard, focus and motion', () => {
  test('skip link is the first tab stop, is visible on focus and moves focus to the main content', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.locator('.skip-link');
    await expect(skip).toBeFocused();
    const box = await skip.boundingBox();
    expect(box && box.y >= 0).toBeTruthy();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
    await page.keyboard.press('Tab');
    const inMain = await page.evaluate(() => !!document.activeElement?.closest('#main'));
    expect(inMain).toBe(true);
  });

  test('focused controls show a visible focus indicator', async ({ page }) => {
    await page.goto('/contact/');
    for (const selector of ['#name', '[data-submit]', '.header .brand']) {
      await page.locator(selector).focus();
      await page.keyboard.press('Shift+Tab');
      await page.keyboard.press('Tab');
      const visible = await page.locator(selector).evaluate((el) => {
        const s = getComputedStyle(el);
        return (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== 'none';
      });
      expect(visible, selector).toBe(true);
    }
  });

  test('mobile menu opens and closes with the keyboard', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/');
    const toggle = page.locator('.menu-toggle');
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
  });

  test('with reduced motion, all content is visible without animation', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/');
    const hidden = await page.evaluate(() => [...document.querySelectorAll('.reveal')].filter((el) => getComputedStyle(el).opacity !== '1').length);
    expect(hidden).toBe(0);
    const heroAnimation = await page.locator('.hero-visual img').evaluate((el) => parseFloat(getComputedStyle(el).animationDuration));
    expect(heroAnimation).toBeLessThan(0.1);
    await context.close();
  });
});

test.describe('error states and SEO plumbing', () => {
  test('unknown URLs get the branded 404 page with a 404 status, noindex and no canonical', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist/');
    expect(response?.status()).toBe(404);
    await expect(page.locator('h1')).toContainText('isn’t here');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    for (const href of ['/', '/services/', '/contact/', 'tel:+919768737810']) await expect(page.locator(`main a[href="${href}"]`).first()).toBeVisible();
  });

  test('thank-you page is noindex and not in the sitemap', async ({ page, request }) => {
    await page.goto('/thank-you/');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    const sitemap = await (await request.get('/sitemap-0.xml')).text();
    expect(sitemap).not.toContain('/thank-you/');
    expect(sitemap).toContain('<loc>https://mmconstructionconsults.com/contact/</loc>');
  });

  test('favicons and manifest are served', async ({ request }) => {
    for (const f of ['/favicon.ico', '/favicon.svg', '/favicon-48x48.png', '/favicon-96x96.png', '/apple-touch-icon.png', '/web-app-manifest-192x192.png', '/web-app-manifest-512x512.png', '/site.webmanifest', '/robots.txt', '/sitemap-index.xml']) {
      expect((await request.get(f)).status(), f).toBe(200);
    }
  });
});
