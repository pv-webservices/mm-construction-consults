# M.M. Construction & Consults — website

Static [Astro](https://astro.build) site for <https://mmconstructionconsults.com/>, hosted on **Netlify** with
GitHub auto-deploy, plus one Netlify Function for the contact form (sent through the company's Hostinger mailbox).

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies (Node 24+) |
| `npm run dev` | Local dev server |
| `npm run build` | Production build into `dist/` (pages, `sitemap-index.xml`, `robots.txt`) |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run check` | TypeScript / Astro type check |
| `npm test` | Unit tests for the contact-form function (mocked mail transport; sends nothing) |
| `npm run audit:seo` | SEO and integrity audit of `dist/` (titles, descriptions, headings, canonicals, robots, Open Graph, JSON-LD, sitemap, favicons, broken links) |
| `npm run test:e2e` | Browser tests (Playwright): form states, axe WCAG 2.1 AA on every page, 5 viewports, keyboard, 404 |
| `npm run verify` | All of the above in order |
| `npm run media` | Rebuild every published image/video from the masters in `source-files/` (needs ffmpeg), then favicons and the social image |

## Folder structure

```
src/
  pages/            one file per route (services/[slug], projects/[slug], videos/[slug], 404, thank-you, robots.txt)
  layouts/          Layout.astro: <head> (SEO, Open Graph, favicons, JSON-LD), header, footer
  components/       Picture (AVIF/WebP srcset), PageHero (+ breadcrumbs schema), grids, CTA …
  data/             site.ts (company facts), services.ts, projects.ts, brands.ts, media.json (image sizes), seo.mjs
  lib/              enquiry.ts (form rules shared by browser + function), seo.ts (titles, JSON-LD helpers)
  scripts/          site.ts (menu, reveal, video modal), enquiry-form.ts (contact page only)
  styles/           global.css
netlify/
  functions/contact.mts        POST /api/contact
  lib/                         enquiry-handler.ts, email.ts, rate-limit.ts (unit-tested)
  edge-functions/              strip-index-html.ts (301 /index.html → /)
public/                        deployed as-is
  images/brand/                logo, og-default.jpg (1200×630)
  images/people/               founder portrait
  images/projects/             society projects and site-work photos (WebP + AVIF, several widths)
  images/services/             service photographs (some AI-generated, labelled as representative)
  images/video-posters/        video stills
  images/certificates/         ISO certificate
  images/material-brands/      paint / chemical / cement brand logos
  videos/selected/             compressed clips used on the site
  favicon.*, apple-touch-icon.png, web-app-manifest-*.png, site.webmanifest
source-files/                  full-resolution masters — NOT deployed (inputs for `npm run media`)
docs/                          EMAIL-SETUP.md, GOOGLE-SEARCH-CONSOLE.md, ASSETS.md, design/homepage-mockup.png
scripts/                       prepare-media, generate-brand-assets, generate-images, audit-seo, serve-dist
tests/                         unit/ (node:test) and e2e/ (Playwright)
netlify.toml                   build, redirects, security + cache headers
```

## Deploy

1. Commit and push to `main` on GitHub. Netlify builds automatically (`npm run build`, publish `dist`, functions in `netlify/functions`, Node 24 — all in `netlify.toml`).
2. Environment variables for the form (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_TO`, `MAIL_FROM`) live **only** in Netlify → Site configuration → Environment variables. Step-by-step: [docs/EMAIL-SETUP.md](docs/EMAIL-SETUP.md). After changing them, trigger a new deploy.
3. Deploy previews are automatically `noindex` and cannot send email (no SMTP password in that context).
4. After a production deploy, run the live checks in [docs/GOOGLE-SEARCH-CONSOLE.md](docs/GOOGLE-SEARCH-CONSOLE.md#1-pre-launch-checklist-on-the-live-domain).

## Content

- Company facts (phones, emails, address, stats, certificate): `src/data/site.ts`. Figures there were supplied by the client; do not add new claims without confirmation.
- Services: `src/data/services.ts`. Projects and videos: `src/data/projects.ts`.
- New photos: put the master in `source-files/images/…`, add it to `scripts/prepare-media.mjs` if needed, run `npm run media`, then reference `/images/<folder>/<name>.webp` (the `Picture` component adds AVIF, srcset and dimensions).
- Utility pages that must stay out of Google (noindex + not in the sitemap) are listed in `src/data/seo.mjs`.
