# Local verification

- `npm run check`: zero errors, warnings, or hints.
- `npm run build`: 31 static HTML pages, including the custom 404.
- `npm run verify`: 31 unique titles and descriptions, 1,362 valid internal references, 198 image references, and valid structured metadata. No broken source-set paths or escaped heading markup.
- All 31 pages were inspected at 320, 375, 430, 768, 1024, 1280, 1440, and 1920px: 248 viewport checks, zero horizontal overflow, broken images, failed responses, or browser exceptions.
- Automated WCAG A/AA checks at desktop and mobile widths: no detected violations. This is an automated audit, not a claim of formal accessibility certification.
- A further 40 viewport checks covered the refined internal headings. Full-page screenshots verify the service cards, technical cards, process steps, project records, and founder section after normal reveal activation.
- Interaction checks passed for navigation and Escape/focus behavior, every project filter, all six video decoders and playback, no autoplay, modal close and focus return, enquiry validation, service preselection, and the exact WhatsApp message and destination.
- Reduced-motion content remains visible. Without JavaScript, video links open dedicated routes, direct contact options remain available, and the enquiry submit button is disabled to prevent accidental form data in a GET URL.
- No test sent an enquiry to the business. Synthetic inputs were used; the WhatsApp opening action was captured locally for verification.
- Dependency audit of production packages found zero reported vulnerabilities.

Reports: `output/qa/static-verification.json`, `browser-matrix.json`, `interactions.json`, and `final-review.json`. Desktop and mobile screenshots: `output/playwright`.

The website is locally built and previewable. Public deployment and the final production domain remain separate launch steps; set `PUBLIC_SITE_URL` and rebuild before launch.
