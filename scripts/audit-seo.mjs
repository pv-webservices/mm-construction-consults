// SEO and integrity audit of the built site (run `npm run build` first). Exits 1 on any issue.
// Usage: npm run audit:seo
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { parse } from 'node-html-parser';
import { NOINDEX_PATHS } from '../src/data/seo.mjs';

const DIST = path.resolve('dist');
const SITE = 'https://mmconstructionconsults.com';
const TITLE_MAX = 65;
const DESC_MIN = 70;
const DESC_MAX = 170;
const INDEX_ROBOTS = 'index, follow, max-image-preview:large';
const NOINDEX_ROBOTS = 'noindex, follow';
const ICON_LINKS = ['link[rel="icon"][href="/favicon.ico"]', 'link[rel="icon"][href="/favicon.svg"]', 'link[rel="icon"][href="/favicon-96x96.png"]', 'link[rel="apple-touch-icon"]', 'link[rel="manifest"]'];
const REQUIRED_META = ['og:site_name', 'og:locale', 'og:title', 'og:description', 'og:url', 'og:type', 'og:image', 'og:image:width', 'og:image:height', 'og:image:alt'];

const issues = [];
const issue = (page, message) => issues.push(`${page}: ${message}`);

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : path.join(dir, e.name))))).flat();
}
const exists = async (p) => fs.stat(p).then((s) => s.isFile(), () => false);

/** Resolves an internal URL path to a file in dist, following directory index rules. */
async function resolves(urlPath) {
  const clean = decodeURIComponent(urlPath.split(/[?#]/)[0]);
  const target = path.join(DIST, clean);
  if (!target.startsWith(DIST)) return false;
  if (clean.endsWith('/')) return exists(path.join(target, 'index.html'));
  return (await exists(target)) || exists(path.join(target, 'index.html'));
}

const pageUrl = (file) => {
  const rel = path.relative(DIST, file).split(path.sep).join('/');
  if (rel === '404.html') return '/404/';
  return `/${rel.replace(/index\.html$/, '')}`;
};

const files = await walk(DIST);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const titles = new Map();
const descriptions = new Map();
const indexable = new Set();
let linksChecked = 0;
let imagesChecked = 0;
let schemasChecked = 0;

for (const file of htmlFiles) {
  const url = pageUrl(file);
  const html = await fs.readFile(file, 'utf8');
  const doc = parse(html, { comment: false });
  const head = doc.querySelector('head');
  const meta = (key) => head?.querySelector(`meta[property="${key}"], meta[name="${key}"]`)?.getAttribute('content');
  const isNoindex = NOINDEX_PATHS.includes(url);

  if (doc.querySelector('html')?.getAttribute('lang') !== 'en') issue(url, 'missing lang="en"');

  // Title and description
  const title = head?.querySelector('title')?.text.trim() ?? '';
  if (!title) issue(url, 'missing <title>');
  else if (title.length > TITLE_MAX) issue(url, `title is ${title.length} chars (max ${TITLE_MAX}): "${title}"`);
  titles.set(title, [...(titles.get(title) ?? []), url]);
  const description = meta('description') ?? '';
  if (description.length < DESC_MIN || description.length > DESC_MAX) issue(url, `description is ${description.length} chars (want ${DESC_MIN}-${DESC_MAX})`);
  descriptions.set(description, [...(descriptions.get(description) ?? []), url]);

  // Robots and canonical
  const robots = meta('robots');
  const canonicals = head?.querySelectorAll('link[rel="canonical"]') ?? [];
  if (isNoindex) {
    if (robots !== NOINDEX_ROBOTS) issue(url, `robots should be "${NOINDEX_ROBOTS}", got "${robots}"`);
    if (canonicals.length) issue(url, 'noindex page must not have a canonical');
  } else {
    indexable.add(url);
    if (robots !== INDEX_ROBOTS) issue(url, `robots should be "${INDEX_ROBOTS}", got "${robots}"`);
    if (canonicals.length !== 1 || canonicals[0].getAttribute('href') !== `${SITE}${url}`) issue(url, `canonical should be ${SITE}${url}`);
  }

  // URL format
  if (url !== url.toLowerCase() || /[_\s]/.test(url) || !url.endsWith('/')) issue(url, 'URL must be lowercase, hyphenated, with a trailing slash');

  // Headings: one H1, no skipped levels
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6').map((h) => Number(h.tagName[1]));
  const h1s = headings.filter((l) => l === 1).length;
  if (h1s !== 1) issue(url, `has ${h1s} H1 elements`);
  headings.reduce((prev, level) => {
    if (level > prev + 1) issue(url, `heading level skips from H${prev} to H${level}`);
    return level;
  }, 1);

  // Open Graph / Twitter
  for (const key of REQUIRED_META) if (!meta(key)) issue(url, `missing ${key}`);
  if (meta('og:url') !== `${SITE}${url}`) issue(url, 'og:url does not match the page URL');
  if (meta('twitter:card') !== 'summary_large_image') issue(url, 'missing twitter:card summary_large_image');
  const ogImage = meta('og:image');
  if (ogImage) {
    const local = path.join(DIST, new URL(ogImage).pathname);
    if (!(await exists(local))) issue(url, `og:image file missing: ${ogImage}`);
    else {
      const { width, height } = await sharp(local).metadata();
      if (width !== 1200 || height !== 630 || meta('og:image:width') !== '1200' || meta('og:image:height') !== '630') issue(url, 'og:image must be 1200x630 with matching width/height tags');
    }
  }

  // Favicons
  for (const selector of ICON_LINKS) if (!head?.querySelector(selector)) issue(url, `missing ${selector}`);

  // JSON-LD
  const types = new Set();
  for (const script of doc.querySelectorAll('script[type="application/ld+json"]')) {
    schemasChecked++;
    const raw = script.rawText;
    if (raw.includes('<')) issue(url, 'JSON-LD contains an unescaped "<"');
    try {
      const data = JSON.parse(raw);
      for (const node of data['@graph'] ?? [data]) types.add(node['@type']);
      for (const node of data['@graph'] ?? []) {
        if (node['@type'] === 'GeneralContractor' && !(node['@id'] && node.address && node.telephone && node.logo && node.url)) issue(url, 'organization schema needs @id, address, telephone, logo and url');
      }
    } catch { issue(url, 'invalid JSON-LD'); }
  }
  for (const type of ['GeneralContractor', 'WebSite', 'Person']) if (!types.has(type)) issue(url, `missing ${type} schema`);
  const isUtility = isNoindex || url === '/';
  if (!isUtility && !types.has('BreadcrumbList')) issue(url, 'missing BreadcrumbList schema');
  if (doc.querySelector('.faq details') && !types.has('FAQPage')) issue(url, 'FAQ content without FAQPage schema');

  // Images: alt, dimensions, loading strategy
  const imgs = doc.querySelectorAll('img');
  const priority = imgs.filter((img) => img.getAttribute('fetchpriority') === 'high');
  if (priority.length > 1) issue(url, `${priority.length} images have fetchpriority="high" (max 1)`);
  for (const img of imgs) {
    imagesChecked++;
    const src = img.getAttribute('src') ?? '';
    if (!img.hasAttribute('alt')) issue(url, `image without alt: ${src}`);
    if (!img.getAttribute('width') || !img.getAttribute('height')) issue(url, `image without width/height: ${src}`);
    const inHeader = !!img.closest('header');
    const isPriority = img.getAttribute('fetchpriority') === 'high';
    if (isPriority && img.getAttribute('loading') !== 'eager') issue(url, `priority image must be loading="eager": ${src}`);
    if (!inHeader && !isPriority && img.getAttribute('loading') !== 'lazy') issue(url, `below-the-fold image should be loading="lazy": ${src}`);
  }

  // Internal links and assets, including srcset candidates and same-page anchors
  const refs = [];
  for (const el of doc.querySelectorAll('[href], [src], [srcset], [poster]')) {
    for (const attr of ['href', 'src', 'poster']) { const v = el.getAttribute(attr); if (v) refs.push(v); }
    const srcset = el.getAttribute('srcset');
    if (srcset) refs.push(...srcset.split(',').map((s) => s.trim().split(/\s+/)[0]));
  }
  for (const ref of refs) {
    if (ref.startsWith('#')) {
      if (ref.length > 1 && !doc.getElementById(ref.slice(1))) issue(url, `broken anchor ${ref}`);
      continue;
    }
    let target;
    try { target = new URL(ref, `${SITE}${url}`); } catch { issue(url, `unparseable URL ${ref}`); continue; }
    if (target.origin !== SITE) continue;
    linksChecked++;
    if (!(await resolves(target.pathname))) issue(url, `broken internal reference ${ref}`);
    const isPage = !/\.[a-z0-9]+$/i.test(target.pathname);
    if (isPage && !target.pathname.endsWith('/')) issue(url, `internal link without trailing slash: ${ref}`);
    if (isPage && target.pathname !== target.pathname.toLowerCase()) issue(url, `internal link not lowercase: ${ref}`);
  }
}

// Duplicates
for (const [title, pages] of titles) if (pages.length > 1) issues.push(`duplicate title "${title}": ${pages.join(', ')}`);
for (const [description, pages] of descriptions) if (pages.length > 1) issues.push(`duplicate description "${description.slice(0, 60)}…": ${pages.join(', ')}`);
for (const p of NOINDEX_PATHS) if (!htmlFiles.some((f) => pageUrl(f) === p)) issues.push(`NOINDEX_PATHS lists ${p} but no such page was built`);

// robots.txt
const robotsTxt = await fs.readFile(path.join(DIST, 'robots.txt'), 'utf8').catch(() => '');
if (!/^User-agent: \*$/m.test(robotsTxt) || !/^Allow: \/$/m.test(robotsTxt)) issues.push('robots.txt must allow all crawlers');
if (/^Disallow:\s*\S/m.test(robotsTxt)) issues.push('robots.txt must not disallow any path');
if (!robotsTxt.includes(`Sitemap: ${SITE}/sitemap-index.xml`)) issues.push('robots.txt is missing the Sitemap line');

// XML sitemap must list exactly the indexable pages, each with lastmod
const sitemapIndex = await fs.readFile(path.join(DIST, 'sitemap-index.xml'), 'utf8').catch(() => '');
const sitemapFiles = [...sitemapIndex.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
if (!sitemapFiles.length) issues.push('sitemap-index.xml lists no sitemaps');
const listed = new Set();
for (const s of sitemapFiles) {
  const xml = await fs.readFile(path.join(DIST, s), 'utf8').catch(() => '');
  for (const entry of xml.matchAll(/<url>(.*?)<\/url>/gs)) {
    const loc = entry[1].match(/<loc>([^<]+)<\/loc>/)?.[1] ?? '';
    if (!/<lastmod>[^<]+<\/lastmod>/.test(entry[1])) issues.push(`sitemap entry without lastmod: ${loc}`);
    listed.add(new URL(loc).pathname);
  }
}
for (const p of indexable) if (!listed.has(p)) issues.push(`indexable page missing from sitemap: ${p}`);
for (const p of listed) if (!indexable.has(p)) issues.push(`sitemap lists a non-indexable or missing page: ${p}`);

// Favicon files and manifest
for (const f of ['favicon.ico', 'favicon.svg', 'favicon-48x48.png', 'favicon-96x96.png', 'apple-touch-icon.png', 'web-app-manifest-192x192.png', 'web-app-manifest-512x512.png', 'site.webmanifest']) {
  if (!(await exists(path.join(DIST, f)))) issues.push(`missing ${f}`);
}
for (const [f, size] of [['favicon-48x48.png', 48], ['favicon-96x96.png', 96], ['apple-touch-icon.png', 180], ['web-app-manifest-192x192.png', 192], ['web-app-manifest-512x512.png', 512]]) {
  const m = await sharp(path.join(DIST, f)).metadata().catch(() => null);
  if (!m || m.width !== size || m.height !== size) issues.push(`${f} must be ${size}x${size}`);
}

// Release must not contain original camera files
const originals = files.filter((f) => /\.(jpe?g|png|mp4)$/i.test(f) && !/(favicon|apple-touch-icon|web-app-manifest|og-default)/.test(f) && !f.includes(`${path.sep}videos${path.sep}selected${path.sep}`));
for (const f of originals) issues.push(`unoptimised original in release: ${path.relative(DIST, f)}`);

const report = { pages: htmlFiles.length, indexable: indexable.size, noindex: htmlFiles.length - indexable.size, sitemapUrls: listed.size, internalReferences: linksChecked, images: imagesChecked, jsonLdBlocks: schemasChecked, issues: issues.length };
console.log(JSON.stringify(report, null, 2));
if (issues.length) {
  console.error(`\n${issues.length} issue(s):\n- ${issues.join('\n- ')}`);
  process.exitCode = 1;
} else {
  console.log('SEO audit passed with no issues.');
}
