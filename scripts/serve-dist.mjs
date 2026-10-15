// Minimal static server for browser tests, mimicking Netlify for dist/:
// directory index, 301 /path -> /path/, gzip for text, and 404.html served with a real 404 status.
// Usage: node scripts/serve-dist.mjs [port]
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';

const ROOT = path.resolve('dist');
const PORT = Number(process.argv[2] ?? 4399);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
  '.woff': 'font/woff', '.mp4': 'video/mp4', '.webmanifest': 'application/manifest+json',
};

const isFile = (p) => fs.stat(p).then((s) => s.isFile(), () => false);

http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
  const pathname = decodeURIComponent(url.pathname);
  const file = path.join(ROOT, pathname);
  if (!file.startsWith(ROOT)) { res.writeHead(400).end(); return; }
  let target = pathname.endsWith('/') ? path.join(file, 'index.html') : file;
  if (!pathname.endsWith('/') && !(await isFile(file)) && (await isFile(path.join(file, 'index.html')))) {
    res.writeHead(301, { Location: `${pathname}/${url.search}` }).end();
    return;
  }
  let status = 200;
  if (!(await isFile(target))) { target = path.join(ROOT, '404.html'); status = 404; }
  const type = TYPES[path.extname(target)] ?? 'application/octet-stream';
  const body = await fs.readFile(target);
  if (/text|javascript|json|xml|svg|manifest/.test(type) && /gzip/.test(req.headers['accept-encoding'] ?? '')) {
    res.writeHead(status, { 'Content-Type': type, 'Content-Encoding': 'gzip', Vary: 'Accept-Encoding' });
    res.end(zlib.gzipSync(body));
    return;
  }
  res.writeHead(status, { 'Content-Type': type });
  res.end(body);
}).listen(PORT, '127.0.0.1', () => console.log(`Serving dist on http://127.0.0.1:${PORT}`));
