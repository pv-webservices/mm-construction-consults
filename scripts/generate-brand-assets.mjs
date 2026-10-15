// Generates the favicon set and the default social-sharing (Open Graph) image from the logo master.
// Usage: node scripts/generate-brand-assets.mjs   (also part of `npm run media`)
// Output: public/favicon.ico, favicon.svg, favicon-48x48.png, favicon-96x96.png, apple-touch-icon.png,
//         web-app-manifest-192x192.png, web-app-manifest-512x512.png, images/brand/og-default.jpg
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const pub = path.join(root, 'public');
const LOGO = path.join(root, 'source-files/images/brand/logo.jpeg'); // logo without the TM mark: clearer at 16–48px
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };
const NAVY = '#0b2545';

const trimmed = await sharp(LOGO).trim({ threshold: 30 }).toBuffer();

/** Square icon: the logo centred on a solid white background with a small margin. */
async function icon(size, margin = 0.06) {
  const inner = Math.round(size * (1 - margin * 2));
  const logo = await sharp(trimmed).resize({ width: inner, height: inner, fit: 'contain', background: WHITE, kernel: 'lanczos3' }).toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: WHITE } })
    .composite([{ input: logo, gravity: 'centre' }])
    .flatten({ background: WHITE })
    .png({ compressionLevel: 9, palette: size >= 96, quality: 90 })
    .toBuffer();
}

/** ICO container holding PNG images (supported by every current browser and by Google). */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

const files = {
  'favicon-48x48.png': 48,
  'favicon-96x96.png': 96,
  'apple-touch-icon.png': 180,
  'web-app-manifest-192x192.png': 192,
  'web-app-manifest-512x512.png': 512,
};
for (const [name, size] of Object.entries(files)) await fs.writeFile(path.join(pub, name), await icon(size));
await fs.writeFile(path.join(pub, 'favicon.ico'), ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await icon(size, 0.03) })))));

// SVG favicon: the raster logo embedded in a square SVG (the logo has a bevelled raster texture, no vector master exists).
const svgPng = (await icon(96, 0.04)).toString('base64');
await fs.writeFile(path.join(pub, 'favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 128 128" width="128" height="128"><rect width="128" height="128" fill="#fff"/><image width="128" height="128" href="data:image/png;base64,${svgPng}" xlink:href="data:image/png;base64,${svgPng}"/></svg>\n`);

// Open Graph image, 1200×630: site photograph with a navy panel, logo and company name.
const W = 1200, H = 630;
const photo = await sharp(path.join(root, 'source-files/images/projects/kapil-ratna-chs-1.jpeg')).rotate().resize(W, H, { fit: 'cover', position: 'attention' }).toBuffer();
const card = await sharp(trimmed).resize({ width: 300, height: 230, fit: 'contain', background: WHITE }).flatten({ background: WHITE }).png().toBuffer();
const overlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${NAVY}" stop-opacity=".97"/><stop offset=".62" stop-color="${NAVY}" stop-opacity=".9"/><stop offset="1" stop-color="${NAVY}" stop-opacity=".25"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect x="60" y="60" width="340" height="270" rx="18" fill="#fff"/>
  <rect x="0" y="${H - 14}" width="${W}" height="14" fill="#d7141c"/>
  <text x="60" y="410" font-family="Arial, Helvetica, sans-serif" font-size="54" font-weight="700" fill="#fff">M.M. Construction &amp; Consults</text>
  <text x="60" y="470" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#dbe4f0">Structural audit · NDT · Repairs · Waterproofing</text>
  <text x="60" y="530" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="#dbe4f0">Mumbai &amp; Maharashtra · ISO 9001:2015 certified</text>
</svg>`);
await sharp(photo)
  .composite([{ input: overlay }, { input: card, left: 80, top: 80 }])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(path.join(pub, 'images/brand/og-default.jpg'));

console.log('Favicons and Open Graph image written.');
