# Google Search Console guide — mmconstructionconsults.com

Hosting: Netlify (GitHub auto-deploy) · DNS: GoDaddy (`ns37/ns38.domaincontrol.com`) · Canonical domain: `https://mmconstructionconsults.com/` (no `www`, trailing slash on every page).

> **Important:** before this release the live site told Google *not* to index it (`noindex` on every page and
> `robots.txt: Disallow: /`) because `PUBLIC_SITE_URL` was not set on Netlify. The new build defaults to the real
> domain, so this is fixed as soon as the new version is deployed. Do the checklist below **after** deploying.

## 1. Pre-launch checklist (on the live domain)

Run each check after the deploy shows "Published" in Netlify.

| Check | How | Expected |
| --- | --- | --- |
| HTTPS | open `http://mmconstructionconsults.com/` | redirects to `https://mmconstructionconsults.com/` |
| www → apex | open `https://www.mmconstructionconsults.com/about/` | 301 to `https://mmconstructionconsults.com/about/` |
| Trailing slash | open `https://mmconstructionconsults.com/about` | 301 to `/about/` |
| `/index.html` | open `https://mmconstructionconsults.com/index.html` | 301 to `/` |
| robots.txt | open `/robots.txt` | `Allow: /` and `Sitemap: https://mmconstructionconsults.com/sitemap-index.xml` (no `Disallow`) |
| Sitemap | open `/sitemap-index.xml` and `/sitemap-0.xml` | 45 `<url>` entries |
| Indexable | View source of the home page | `<meta name="robots" content="index, follow, max-image-preview:large">` and a canonical link |
| 404 | open `/does-not-exist/` | branded 404 page; status 404 (check with any "HTTP status checker" site) |
| Favicon | open `/favicon.ico`, `/favicon.svg`, `/apple-touch-icon.png` | all load |
| Form | one real test (see `docs/EMAIL-SETUP.md`, step 5) | lands on `/thank-you/`, email in Inbox |

Command-line version (any terminal with curl):

```bash
curl -sI https://mmconstructionconsults.com/does-not-exist/ | head -1
```

## 2. Add a Domain property (DNS TXT verification at GoDaddy)

A **Domain** property covers `https`, `http`, `www` and every subdomain in one place.

1. Go to <https://search.google.com/search-console> and sign in with the Google account that will own the property
   (ideally the company's own account; add others later under *Settings → Users and permissions*).
2. **Add property** → choose **Domain** (left box) → enter `mmconstructionconsults.com` → **Continue**.
3. Google shows a TXT record like `google-site-verification=AbC123…`. Click **Copy**.
4. In a new tab: GoDaddy → **My Products** → next to `mmconstructionconsults.com` click **DNS** → **Add New Record**:
   - Type: **TXT**
   - Name: **@**
   - Value: paste the whole `google-site-verification=…` string
   - TTL: **1 hour** (or default) → **Save**.
   Do not edit or delete the existing `A`, `www` CNAME, `_dmarc` or (once added) MX/SPF records; a second TXT record on `@` is fine.
5. Back in Search Console, click **Verify**. If it fails, wait 15–60 minutes and click Verify again (GoDaddy DNS usually updates within an hour).
6. Leave the TXT record in place permanently; removing it un-verifies the property.

## 3. Submit the sitemap

1. Search Console → **Sitemaps** (left menu).
2. Under *Add a new sitemap*, type **`sitemap-index.xml`** (the box already shows the domain) → **Submit**.
3. What to expect:
   - `sitemap-index.xml` points to `sitemap-0.xml`, which lists **every indexable page (45 URLs)**. Submitting the index is enough; you don't need to submit pages one by one.
   - Status **"Couldn't fetch"** or **"Pending"** for up to 24 hours is normal for a new property. Re-check the next day.
   - Opening the sitemap in a browser shows *"This XML file does not appear to have any style information…"*. That is normal; sitemaps are for search engines, not people.
   - Discovered URLs should reach **45**.

## 4. Indexable URLs (45)

**Core pages (7)**
- `https://mmconstructionconsults.com/`
- `https://mmconstructionconsults.com/about/`
- `https://mmconstructionconsults.com/services/`
- `https://mmconstructionconsults.com/ndt-services/`
- `https://mmconstructionconsults.com/projects/`
- `https://mmconstructionconsults.com/videos/`
- `https://mmconstructionconsults.com/contact/`

**Services (10)**
- `/services/ndt-structural-audit/`
- `/services/structural-repairs-rehabilitation/`
- `/services/cf-wrapping-strengthening/`
- `/services/waterproofing/`
- `/services/terrace-waterproofing/`
- `/services/external-painting/`
- `/services/plumbing-drainage/`
- `/services/paver-work/`
- `/services/visual-inspection-documentation/`
- `/services/concrete-core-testing/`

**Projects (18)**
- Society projects: `/projects/park-corner-sagar-shilp-chs/`, `/projects/kapil-ratna-chs/`, `/projects/himgiri-sai-shyam-chs/`, `/projects/atharva-heights-chs/`, `/projects/hamza-tower/`, `/projects/prestige-park-chs/`, `/projects/sukur-enclave/`, `/projects/sunshine-chs/`, `/projects/mahindra-park-chs/`, `/projects/neelkanth-nagar-chs/`, `/projects/zelam-chs/`, `/projects/peace-haven-chs/`
- Work records: `/projects/building-rehabilitation/`, `/projects/rcc-column-repair/`, `/projects/building-exterior/`, `/projects/concrete-investigation/`, `/projects/column-jacketing/`, `/projects/core-testing-work/`

**Videos (8)**
- `/videos/brand-film/`, `/videos/work-3/`, `/videos/work-10/`, `/videos/work-31/`, `/videos/work-6/`, `/videos/work-8/`, `/videos/work-4/`, `/videos/work-24/`

**Legal (2)**
- `/privacy-policy/`, `/terms-conditions/` (indexable: they are harmless and support trust; low priority)

## 5. Request indexing for priority pages (about 10 per day)

Use **URL Inspection** (search bar at the top) → paste the full URL → **Request indexing**. Google limits how many
requests you can make per day, so spread them out. Pages not listed here don't need a manual request; the sitemap covers them.

| Day | URLs |
| --- | --- |
| **Day 1** | `/`, `/services/`, `/ndt-services/`, `/contact/`, `/about/`, `/projects/`, `/services/ndt-structural-audit/`, `/services/structural-repairs-rehabilitation/`, `/services/waterproofing/`, `/services/cf-wrapping-strengthening/` |
| **Day 2** | `/services/terrace-waterproofing/`, `/services/external-painting/`, `/services/concrete-core-testing/`, `/services/visual-inspection-documentation/`, `/services/plumbing-drainage/`, `/services/paver-work/`, `/videos/`, `/projects/mahindra-park-chs/`, `/projects/prestige-park-chs/`, `/projects/park-corner-sagar-shilp-chs/` |
| **Day 3** | `/projects/hamza-tower/`, `/projects/atharva-heights-chs/`, `/projects/himgiri-sai-shyam-chs/`, `/projects/kapil-ratna-chs/`, `/projects/neelkanth-nagar-chs/`, `/projects/sunshine-chs/`, `/projects/peace-haven-chs/`, `/projects/sukur-enclave/`, `/projects/zelam-chs/`, `/projects/rcc-column-repair/` |

Requesting indexing of the **home page on Day 1** also makes Google re-read the new favicon sooner.

## 6. Pages that must NOT be submitted

| URL | Why |
| --- | --- |
| `/thank-you/` | Only reached after sending the form; `noindex, follow`; not in the sitemap. Indexing it would let people land on a "thank you" without enquiring. |
| `/404` page (any unknown URL) | Error page with a real 404 status; `noindex`. |
| `/sitemap/` (the human-readable page) | Navigation helper with no unique content; `noindex, follow`. Google uses the XML sitemap instead. |
| `/api/contact` | The form endpoint, not a page. |
| `https://www.…`, `http://…`, URLs without a trailing slash, `/index.html` | Duplicates that 301-redirect to the canonical URL. |

These pages are **not** blocked in `robots.txt` on purpose: Google must be able to crawl them to see the `noindex`.
In the **Pages** report they will appear under *Excluded by 'noindex' tag* or *Page with redirect*. That is expected, not an error.

## 7. Favicon in search results

The site now ships `favicon.ico` (16/32/48 px), `favicon.svg`, 48/96/192/512 px PNGs, a 180 px Apple touch icon and
`site.webmanifest`, all linked from every page including the home page, and none blocked by robots.txt.
Google can take **days to a few weeks** to show a new favicon in results; requesting indexing of the home page (Day 1) speeds this up.

## 8. Weeks 1–4 follow-up

**Week 1**
- *Sitemaps*: status **Success**, 45 discovered URLs.
- *Pages* (Indexing → Pages): watch *Indexed* rise. "Discovered – currently not indexed" and "Crawled – currently not indexed" are normal for a few weeks on a new site.
- *URL Inspection* on `/`: "URL is on Google" or "URL is available to Google" after the live test.
- Create/claim the **Google Business Profile** (business.google.com): same name, address (A-28, Subhash Udyog Association, … Ghatkopar West, Mumbai 400084) and phone (+91 97687 37810) exactly as on the website; website link `https://mmconstructionconsults.com/`. Matching NAP (name, address, phone) helps local search.

**Week 2**
- *Enhancements* / *Shopping & Rich results* section: check **Breadcrumbs** (all inner pages), **FAQ** (`/ndt-services/`) and the organization/local-business data. Fix any "invalid item" errors (none are expected; the build's `npm run audit:seo` checks the structured data).
- Run **PageSpeed Insights** (<https://pagespeed.web.dev/>) on `/` and `/services/structural-repairs-rehabilitation/` (mobile).
- Set up **Bing Webmaster Tools** (<https://www.bing.com/webmasters>): *Import from Google Search Console* (fastest) or add the site and submit `https://mmconstructionconsults.com/sitemap-index.xml`. This also covers DuckDuckGo and Yahoo.

**Week 3**
- *Pages* report: investigate any *Not found (404)* or *Server error (5xx)*. Old URLs without a trailing slash should show as *Page with redirect* (fine).
- *Core Web Vitals* report (appears once Google has enough Chrome-user data; may stay empty for a small site).

**Week 4**
- *Performance* report: queries, clicks and impressions. Note which services get impressions; consider more project write-ups for those.
- Re-request indexing for any priority page still not indexed.
- Ask satisfied society clients to leave Google reviews on the Business Profile.
