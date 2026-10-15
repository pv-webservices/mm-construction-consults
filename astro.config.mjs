import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { NOINDEX_PATHS } from './src/data/seo.mjs';

// Canonical production origin. PUBLIC_SITE_URL can override it (e.g. for a staging domain).
const SITE = process.env.PUBLIC_SITE_URL || 'https://mmconstructionconsults.com';
const BUILT_AT = new Date().toISOString();

export default defineConfig({
  site: SITE,
  output: 'static',
  // Every page URL ends in "/" (matches Netlify's directory output); /about redirects to /about/.
  trailingSlash: 'always',
  // CSS is inlined: one stylesheet (~10 KB gzipped) would otherwise block the first paint on mobile.
  build: { format: 'directory', inlineStylesheets: 'always' },
  integrations: [
    sitemap({
      // Only indexable pages: utility pages (404, thank-you, HTML sitemap) are noindex and left out.
      filter: (page) => !NOINDEX_PATHS.includes(new URL(page).pathname),
      lastmod: new Date(BUILT_AT),
    }),
  ],
  vite: { server: { fs: { strict: true } } },
});
