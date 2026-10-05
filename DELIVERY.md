# M.M. Construction & Consults

Static Astro business website, with shared components and central content files. No accounts, database, dashboard, or enquiry backend.

## Run locally

```powershell
npm install
npm run dev
```

Astro prints the selected local URL; an occupied port causes it to choose the next available one.

```powershell
npm run check
npm run build
npm run verify
npm run preview -- --port 4330
```

`dist` is the release directory. The build preserves the original media in `public` and removes the unselected originals from `dist`.

## Content

- `src/data/site.ts`: business identity, phone numbers, social URLs, confirmed WhatsApp destination, values, process, and unpublished statistics.
- `src/data/services.ts`: all ten services and six testing methods.
- `src/data/projects.ts`: four supplied work records and six selected videos.
- `src/data/media.json`: generated image dimensions.
- `src/styles/global.css`: shared visual system and responsive layout.

## WhatsApp enquiries

The form validates required fields, Indian mobile numbers, and optional email format. Submitting prepares a URL-encoded message for the confirmed WhatsApp number and opens WhatsApp. It does not claim successful delivery: the visitor taps Send in WhatsApp. A visible enquiry preview, copy action, and fallback link remain on the contact page if the new tab does not open. No data is stored by this website.

## Public launch

Set `PUBLIC_SITE_URL` in `.env` to the final HTTPS website origin and rebuild. This enables canonical URLs, absolute Open Graph metadata, an XML sitemap, and crawlable robots settings. Local builds remain `noindex` until the domain is configured. No production deployment was performed.

## Verification artifacts

The static checks write `output/qa/static-verification.json`. Browser matrix and screenshots are in `output/qa` and `output/playwright`. Browser QA covers all routes at 320, 375, 430, 768, 1024, 1280, 1440, and 1920px. Accessibility checks use WCAG 2 A/AA and WCAG 2.1 A/AA rules. Interaction checks cover navigation, project filters, video loading/playback, form validation, and WhatsApp message preparation.

To repeat the browser matrix against `npm run preview -- --port 4330`, use the Playwright CLI with `scripts/browser-qa.js`. Its output is a structured result followed by the executed code. It exercises the local build; it does not send an enquiry or message to the company.
