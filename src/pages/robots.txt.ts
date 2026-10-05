import { site } from '../data/site';
export function GET() { return new Response(site.url?`User-agent: *\nAllow: /\nSitemap: ${new URL('/sitemap.xml',site.url).href}\n`:'User-agent: *\nDisallow: /\n',{headers:{'Content-Type':'text/plain'}}); }
