# M.M. Construction & Consults

Static Astro business website, with shared components and central content files. No accounts, database or dashboard; contact-form enquiries are emailed through FormSubmit.

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
- `src/data/projects.ts`: 12 society projects (location, value, scope) plus six earlier work records, selected videos and project clips.
- `src/data/brands.ts`: paint, construction-chemical and cement brands; logos go in `public/images/brands/<slug>.svg|webp|png`.
- `src/data/media.json`: generated image dimensions.
- `src/styles/global.css`: shared visual system and responsive layout.

## Enquiries

The form validates required fields, Indian mobile numbers, and optional email format. **Send Enquiry** posts the details to `https://formsubmit.co/ajax/info@mmconstructionconsults.com`, which emails them to the info@ inbox (the first live submission sends a one-time activation email to info@ that must be confirmed). **Send via WhatsApp** prepares the same message for the confirmed WhatsApp number instead. No data is stored by this website.

## Public launch

Set `PUBLIC_SITE_URL` in `.env` to the final HTTPS website origin and rebuild. This enables canonical URLs, absolute Open Graph metadata, an XML sitemap, and crawlable robots settings. Local builds remain `noindex` until the domain is configured. No production deployment was performed.

## Verification artifacts

The static checks write `output/qa/static-verification.json`. Browser matrix and screenshots are in `output/qa` and `output/playwright`. Browser QA covers all routes at 320, 375, 430, 768, 1024, 1280, 1440, and 1920px. Accessibility checks use WCAG 2 A/AA and WCAG 2.1 A/AA rules. Interaction checks cover navigation, project filters, video loading/playback, form validation, and WhatsApp message preparation.

To repeat the browser matrix against `npm run preview -- --port 4330`, use the Playwright CLI with `scripts/browser-qa.js`. Its output is a structured result followed by the executed code. It exercises the local build; it does not send an enquiry or message to the company.
