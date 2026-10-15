// 301 /index.html -> / and /about/index.html -> /about/, keeping the query string.
// Edge functions match only the literal request path, so a request for "/" is never affected (no loop).
import type { Config } from '@netlify/edge-functions';

export default (request: Request) => {
  const url = new URL(request.url);
  url.pathname = url.pathname.replace(/index\.html$/, '');
  return Response.redirect(url.href, 301);
};

export const config: Config = { pattern: '^/(.*/)?index\\.html$' };
