# Media and content sources

The client-supplied homepage mockup (`docs/design/homepage-mockup.png`) sets the layout: white and light-grey sections, construction red accents, a deep-navy testing section, split hero, process steps, projects, videos, founder message, achievements, CTA band and footer.

## Real company media (refined)

`scripts/prepare-media.mjs` (`npm run media`) rebuilds every published file from the untouched masters in `source-files/`: AVIF + WebP at several widths, Lanczos resizing and a small saturation lift (extra sharpening only for upscaled crops and video frames).

| Source | Output | Use |
| --- | --- | --- |
| `source-files/images/brand/logo-tm.jpeg` | `images/brand/logo*.webp` (trimmed) | Header and footer |
| `source-files/images/brand/logo.jpeg` | favicons, `images/brand/og-default.jpg` | Browser/search icon, social sharing |
| `source-files/images/projects/kapil-ratna-chs-1.jpeg` | `images/projects/kapil-ratna-chs-1*` | Hero, Kapil Ratna CHS, rehabilitation record |
| `source-files/images/projects/himgiri-sai-shyam-chs-1.jpeg` | `images/projects/himgiri-sai-shyam-chs-1*` | About, Himgiri Sai Shyam CHS, exterior record |
| `source-files/images/site-work/rcc-column-repair-before-after.jpeg` | `images/projects/rcc-column-repair-before-after*` | Structural repair service, column repair project |
| `source-files/images/site-work/repair-site-condition.jpeg` | `images/projects/repair-site-condition*` | Visual inspection service |
| `source-files/images/brochure/services-brochure-2.jpeg` crops | `images/services/rebound-hammer-test*`, `thermal-imaging*` | Small brochure crops upscaled 3× and sharpened |
| Brand film frame (130.5s) | `images/people/founder*` | Founder portrait, upscaled and sharpened |
| Brand film frame (4s) | `images/video-posters/brand-film*` | Brand film poster |
| Site clip frames | `images/video-posters/work-N*` | Video posters and the “Advanced Testing” cards |

## Generated photographs (8 images)

`scripts/generate-images.mjs` (model `gemini-3.1-flash-lite-image`, 4:3, 1K, key read from `.env`) produced representative service photographs for services the supplied media did not cover. Raw PNGs are the masters in `source-files/images/generated`; published copies are in `public/images/services`.

`ndt-upv`, `core-testing`, `cf-wrapping`, `waterproofing`, `terrace-waterproofing`, `external-painting`, `plumbing-drainage`, `paver-work`.

These are used for service cards/pages. Real work is shown in projects and videos, and the services page notes that some service photographs are representative.

## Videos

| Original | Published copy | Notes |
| --- | --- | --- |
| `source-files/videos/raw/client-work-animated-video.mp4` | `videos/selected/brand-film.mp4` | 3-minute animated brand story, narration kept (AAC 96k) |
| `source-files/videos/raw/client-work-video-3/4/6/8/10/24/31.mp4` | `videos/selected/work-N.mp4` | Silent H.264, max 720px wide, fast-start; video-4 letterbox cropped |

The homepage shows the brand film plus three clips; `/videos` shows all eight. Nothing autoplays on page load; a clip plays only after the visitor opens it.

## Facts and items to confirm with the client

- Address (A-28, Subhash Udyog Association, … Ghatkopar West, Mumbai 400084), emails (info@ and sales@mmconstructionconsults.com; mmconstructionconsults@gmail.com added later), 10+ years of experience and the 60000000+ sq ft audit figure (2016–2026) were supplied by the client in Oct 2026. The map pin uses the company’s Google Business listing in the same building (listed there as Gala No. 05).
- The remaining achievement figures (30+ projects, 250+ clients, 100% satisfaction) come from the client-supplied homepage design and live in `stats` in `src/data/site.ts`.
- Contact-form enquiries are emailed to info@ by the site's own Netlify Function through the Hostinger mailbox (see `docs/EMAIL-SETUP.md`). FormSubmit is no longer used.
- The brand film shows Instagram `mmconstruction17` and a YouTube channel; the site uses the Instagram URL from the original brief (`mmconstructionconsults`). The YouTube URL in the film is not a valid channel address, so it is not linked.

## Society projects, certificate and brands (Oct 2026)

- Masters are in `source-files/images/projects/<project-slug>-N.jpeg`, `source-files/images/certificates/` and `source-files/videos/projects/`; `scripts/prepare-media.mjs` writes `images/projects/<project-slug>-N.*`, `images/video-posters/project-*.webp`, `images/certificates/iso-9001-2015-certificate.*` and `videos/selected/project-*.mp4` (silent). Nothing in `source-files/` is deployed.
- `client work image-3.jpeg` and `client work image-4.jpeg` were byte-identical copies of the Himgiri Sai Shyam CHS and Kapil Ratna CHS photos and were removed (Oct 2026); the project masters are used instead.
- Project names, locations and values were supplied by the client. Scope bullet points were written from the photographs and should be confirmed by the client.
- The ISO 9001:2015 certificate (QMS/16CB/0224, valid to 22 Feb 2027) is shown on the homepage and About page. Update `certificate` in `src/data/site.ts` and the master in `source-files/images/certificates/` when it is renewed.
- Brand logos live in `public/images/material-brands/<slug>.svg|webp|png` (slugs in `src/data/brands.ts`), shown in original colours. A brand without a file shows a text wordmark.
