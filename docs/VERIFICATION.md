# Verification record — 14 Oct 2026

Run with `npm run verify` (type check → build → unit tests → SEO audit → browser tests). No test sent an email: the
function's mail transport is mocked in unit tests and `/api/contact` is intercepted in browser tests.

| Check | Result |
| --- | --- |
| `astro check` | 55 files, 0 errors, 0 warnings, 0 hints |
| `astro build` | 48 pages (45 indexable + 404, thank-you, HTML sitemap) |
| Unit tests (`npm test`) | 18 / 18 pass: sender + Reply-To, nodemailer render of headers, validation, consent, honeypot, 3 s timer, origin allow-list, header injection, HTML escaping, rate limit (5 / 10 min, hashed IPs), missing SMTP → 500, SMTP failure → 502, no-JS 303 |
| SEO audit (`npm run audit:seo`) | 0 issues; 48 pages, 45 sitemap URLs = 45 indexable pages, ~5,200 internal references and 503 images checked, 94 JSON-LD blocks valid |
| Browser tests (`npm run test:e2e`) | 72 / 72 pass: 47 pages × (axe WCAG 2.1 A/AA = 0 violations, no console errors, no failed requests, no broken images); 5 viewports (320/375/768/1024/1440) × 47 pages with no horizontal scroll and all tap targets ≥ 24 px; 13 form-state tests incl. no-JS; skip link, focus visibility, keyboard menu, reduced motion; 404 status; favicons |
| Function bundle smoke test | esbuild bundle runs: GET → 405, POST without env → 500 `not_configured` |

## Lighthouse (mobile, simulated throttling, median of 3)

| Page | Version | Perf | LCP | CLS | TBT | SEO | Page weight |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Home | Live site before (Netlify) | 77 | 4.7 s | 0 | 200 ms | 66 | 1,240 KB |
| Home | Before, local (gzip) | 75 | 6.5 s | 0 | 80 ms | 66 | 1,242 KB |
| Home | After, local (gzip) | 94 | 2.7 s | 0 | 140 ms | 100 | 327 KB |
| Structural repairs service | Live site before (Netlify) | 92 | 3.0 s | 0.018 | 130 ms | 66 | — |
| Structural repairs service | Before, local (gzip) | 89 | 3.6 s | 0.018 | 0 ms | 66 | 552 KB |
| Structural repairs service | After, local (gzip) | 98 | 2.3 s | 0 | 80 ms | 100 | 183 KB |

Accessibility and Best Practices were 100 before and after. Lighthouse lab data has no INP; TBT is its lab proxy.
Local runs were noisy on the test machine (individual runs varied ±20 points); re-measure on the live site after deploy.
