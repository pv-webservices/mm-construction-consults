# Media and content sources

The client-supplied homepage mockup (`public/images/M.M. Construction Website Homepage UI.png`) sets the layout: white and light-grey sections, construction red accents, a deep-navy testing section, split hero, process steps, projects, videos, founder message, achievements, CTA band and footer.

## Real company media (refined)

`scripts/prepare-media.mjs` rebuilds every derivative from the untouched originals: WebP output, Lanczos resizing, light sharpening and a small saturation lift.

| Source | Output | Use |
| --- | --- | --- |
| `website-logo.jpeg` | `logo*.webp` (trimmed) | Header and footer |
| `client work image-4.jpeg` | `scaffold*.webp` | Hero, rehabilitation project |
| `client work image-3.jpeg` | `completed*.webp` | About, exterior project |
| `client work image-2.jpeg` | `repair*.webp` | Structural repair service, column repair project |
| `client work image-1.jpeg` | `inspection*.webp` | Visual inspection service |
| `services-image-2.jpeg` crops | `rebound.webp`, `thermal.webp` | Small brochure crops upscaled 3× and sharpened (were blurred) |
| Brand film frame (130.5s) | `founder.webp` | Founder portrait, upscaled and sharpened |
| Brand film frame (4s) | `film-poster.webp` | Brand film poster |
| Site clip frames | `video-N.webp` | Video posters and the “Advanced Testing” cards |

## Generated photographs (8 images)

`scripts/generate-images.mjs` (model `gemini-3.1-flash-lite-image`, 4:3, 1K, key read from `.env`) produced representative service photographs for services the supplied media did not cover. Raw PNGs are kept in `media-src/generated`; WebP at 960 and 480 px is in `public/images/optimized`.

`ndt-upv`, `core-testing`, `cf-wrapping`, `waterproofing`, `terrace-waterproofing`, `external-painting`, `plumbing-drainage`, `paver-work`.

These are used for service cards/pages. Real work is shown in projects and videos, and the services page notes that some service photographs are representative.

## Videos

| Original | Published copy | Notes |
| --- | --- | --- |
| `client work animated video.mp4` | `brand-film.mp4` | 3-minute animated brand story, narration kept (AAC 96k) |
| `client work video-3/4/6/8/10/24/31.mp4` | `work-N.mp4` | Silent H.264, max 720px wide, fast-start; video-4 letterbox cropped |

The homepage shows the brand film plus three clips; `/videos` shows all eight. Nothing autoplays on page load; a clip plays only after the visitor opens it.

## Facts and items to confirm with the client

- Address (A-28, Subhash Udyog Association, … Ghatkopar West, Mumbai 400084), emails (info@ and sales@mmconstructionconsults.com), 10+ years of experience and the 60000000+ sq ft audit figure (2016–2026) were supplied by the client in Oct 2026. The map pin uses the company’s Google Business listing in the same building (listed there as Gala No. 05).
- The remaining achievement figures (30+ projects, 250+ clients, 100% satisfaction) come from the client-supplied homepage design and live in `stats` in `src/data/site.ts`.
- Contact-form enquiries are emailed to info@ through FormSubmit (formsubmit.co). The first live submission triggers a one-time activation email to info@ that must be confirmed before enquiries are delivered.
- The brand film shows Instagram `mmconstruction17` and a YouTube channel; the site uses the Instagram URL from the original brief (`mmconstructionconsults`). The YouTube URL in the film is not a valid channel address, so it is not linked.

## Society projects, certificate and brands (Oct 2026)

- Originals are in `public/new project images & videos`; `scripts/prepare-media.mjs` writes `project-<name>-N.webp`, `project-<name>-video.webp` posters, `certificate.webp` and `videos/selected/project-*.mp4` (silent). The raw folder is removed from `dist` by `scripts/prune-output.mjs`.
- Project names, locations and values were supplied by the client. Scope bullet points were written from the photographs and should be confirmed by the client.
- The ISO 9001:2015 certificate (QMS/16CB/0224, valid to 22 Feb 2027) is shown on the homepage and About page. Update `certificate` in `src/data/site.ts` when it is renewed.
- Brand logos live in `public/images/brands/<slug>.svg|webp|png` (slugs in `src/data/brands.ts`), shown in original colours. A brand without a file shows a text wordmark.
