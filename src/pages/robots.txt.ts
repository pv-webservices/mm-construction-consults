import type { APIRoute } from 'astro';

// Everything is crawlable (noindex pages must stay crawlable so Google can read their robots meta).
export const GET: APIRoute = ({ site }) => new Response(
  `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap-index.xml', site).href}\n`,
  { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
);
