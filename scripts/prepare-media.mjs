// Builds every published image (and, unless --images-only, every published video) from the
// full-resolution masters in source-files/. Masters are never modified and are not deployed.
// Usage: node scripts/prepare-media.mjs [--images-only]
// Requires ffmpeg on PATH (video frames and video encoding).
import sharp from 'sharp';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const src = (...p) => path.join(root, 'source-files', ...p);
const pub = path.join(root, 'public');
const imagesOut = path.join(pub, 'images');
const videoOut = path.join(pub, 'videos/selected');
const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'mm-media-'));
const imagesOnly = process.argv.includes('--images-only');
// Folders under public/images that this script owns (brand logos in material-brands are hand-supplied).
const OWNED = ['brand', 'certificates', 'people', 'projects', 'services', 'video-posters'];
const PHOTO_QUALITY = 66;
// AVIF is served first through <picture>; WebP is the fallback (see src/components/Picture.astro).
const AVIF_QUALITY = 50;

for (const dir of OWNED) {
  await fs.rm(path.join(imagesOut, dir), { recursive: true, force: true });
  await fs.mkdir(path.join(imagesOut, dir), { recursive: true });
}

const ffmpeg = (args) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args]);

function frame(video, seconds, filter) {
  const file = path.join(tmp, `${path.basename(video, '.mp4')}-${seconds}.png`);
  ffmpeg(['-ss', String(seconds), '-i', video, '-frames:v', '1', ...(filter ? ['-vf', filter] : []), file]);
  return file;
}

/** Writes <name>.webp/.avif (largest width) and <name>-<w>.webp/.avif for each smaller width. */
async function write(input, name, { widths = [480, 960], crop, upscale, sharpen = 0, quality = PHOTO_QUALITY, trim = false, avif = true } = {}) {
  let base = sharp(input).rotate();
  if (trim) base = base.trim({ threshold: 20 });
  if (crop) base = base.extract(crop);
  if (upscale) base = sharp(await base.resize({ width: upscale, kernel: 'lanczos3' }).toBuffer());
  // Downscaling already sharpens; extra sharpening is only applied to upscaled crops and frames.
  if (sharpen) base = base.sharpen({ sigma: sharpen });
  const buffer = await base.modulate({ saturation: 1.04 }).toBuffer();
  const { width: native } = await sharp(buffer).metadata();
  const sizes = [...new Set(widths.map((w) => Math.min(w, native)))];
  const largest = Math.max(...sizes);
  for (const width of sizes) {
    const file = path.join(imagesOut, width === largest ? name : `${name}-${width}`);
    await sharp(buffer).resize({ width }).webp({ quality, effort: 6, smartSubsample: true }).toFile(`${file}.webp`);
    if (avif) await sharp(buffer).resize({ width }).avif({ quality: AVIF_QUALITY, effort: 4 }).toFile(`${file}.avif`);
  }
}

// Brand
await write(src('images/brand/logo-tm.jpeg'), 'brand/logo', { widths: [160, 240], trim: true, sharpen: 0.4, quality: 88, avif: false });

// Company work photographs. The hero photograph gets an extra mid-size variant for phones.
const LARGE = [480, 800, 1170];
await write(src('images/projects/kapil-ratna-chs-1.jpeg'), 'projects/kapil-ratna-chs-1', { widths: LARGE });
await write(src('images/projects/himgiri-sai-shyam-chs-1.jpeg'), 'projects/himgiri-sai-shyam-chs-1', { widths: LARGE });
await write(src('images/site-work/repair-site-condition.jpeg'), 'projects/repair-site-condition', { widths: LARGE });
await write(src('images/site-work/rcc-column-repair-before-after.jpeg'), 'projects/rcc-column-repair-before-after', { widths: LARGE });

// Society project photographs (kapil-ratna-chs-1 and himgiri-sai-shyam-chs-1 are written above).
for (const file of (await fs.readdir(src('images/projects'))).sort()) {
  const name = file.replace(/\.jpe?g$/i, '');
  if (name === 'kapil-ratna-chs-1' || name === 'himgiri-sai-shyam-chs-1') continue;
  await write(src('images/projects', file), `projects/${name}`, { widths: [480, 960] });
}

// ISO certificate: higher quality so the text stays legible.
await write(src('images/certificates/iso-9001-2015-certificate.jpeg'), 'certificates/iso-9001-2015-certificate', { widths: [480, 900], sharpen: 0.4, quality: 82 });

// Representative service photographs (AI-generated PNG masters, see scripts/generate-images.mjs).
for (const file of (await fs.readdir(src('images/generated'))).sort()) {
  await write(src('images/generated', file), `services/${file.replace(/\.png$/, '')}`, { widths: [480, 960] });
}
// Small brochure crops: upscaled with Lanczos and sharpened so they stay crisp in cards.
const brochure = src('images/brochure/services-brochure-2.jpeg');
await write(brochure, 'services/rebound-hammer-test', { crop: { left: 303, top: 805, width: 239, height: 145 }, upscale: 720, sharpen: 1, widths: [480, 720] });
await write(brochure, 'services/thermal-imaging', { crop: { left: 303, top: 1000, width: 239, height: 145 }, upscale: 720, sharpen: 1, widths: [480, 720] });

// Founder portrait and brand-film poster from the supplied animated film.
const film = src('videos/raw/client-work-animated-video.mp4');
await write(frame(film, 130.5), 'people/founder', { crop: { left: 304, top: 35, width: 252, height: 338 }, upscale: 600, sharpen: 0.9, widths: [300, 600], quality: 75 });
await write(frame(film, 4), 'video-posters/brand-film', { widths: [480, 848] });

// Posters for the selected site clips (also used as real-work card photographs).
export const clips = [
  { n: 3, t: 2.94 },
  { n: 4, t: 2.9, filter: 'crop=464:640:8:106' },
  { n: 6, t: 5.63 },
  { n: 8, t: 4.73 },
  { n: 10, t: 16.84 },
  { n: 11, t: 12.34 },
  { n: 23, t: 0.66 },
  { n: 24, t: 15.91 },
  { n: 31, t: 19.12 },
];
for (const { n, t, filter } of clips) {
  await write(frame(src(`videos/raw/client-work-video-${n}.mp4`), t, filter), `video-posters/work-${n}`, { widths: [480], sharpen: 0.8 });
}

export const projectVideos = [
  { slug: 'atharva-heights', file: 'atharva-heights-chs.mp4', t: 1.5 },
  { slug: 'hamza-tower', file: 'hamza-tower.mp4', t: 1 },
  { slug: 'prestige-park', file: 'prestige-park-chs.mp4', t: 3 },
];
for (const { slug, file, t } of projectVideos) {
  await write(frame(src('videos/projects', file), t), `video-posters/project-${slug}`, { widths: [480], sharpen: 0.8 });
}

if (!imagesOnly) {
  await fs.rm(videoOut, { recursive: true, force: true });
  await fs.mkdir(videoOut, { recursive: true });
  const encode = (input, output, vf, audio = ['-an']) => ffmpeg(['-i', input, '-vf', vf, '-c:v', 'libx264', '-preset', 'medium', '-crf', '26', ...audio, '-movflags', '+faststart', output]);
  for (const n of [3, 4, 6, 8, 10, 24, 31]) {
    const crop = n === 4 ? 'crop=464:640:8:106,' : '';
    encode(src(`videos/raw/client-work-video-${n}.mp4`), path.join(videoOut, `work-${n}.mp4`), `${crop}scale=trunc(min(720\\,iw)/2)*2:-2`);
  }
  for (const { slug, file } of projectVideos) {
    encode(src('videos/projects', file), path.join(videoOut, `project-${slug}.mp4`), 'scale=trunc(min(720\\,iw)/2)*2:-2');
  }
  // The brand film keeps its narration.
  ffmpeg(['-i', film, '-c:v', 'libx264', '-preset', 'medium', '-crf', '27', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', path.join(videoOut, 'brand-film.mp4')]);
}

// Dimensions of every published raster image, used for width/height and srcset at build time.
const manifest = {};
for (const dir of [...OWNED, 'material-brands']) {
  for (const name of (await fs.readdir(path.join(imagesOut, dir))).sort()) {
    if (name.endsWith('.avif')) continue; // AVIF twins share the WebP dimensions
    const { width, height } = await sharp(path.join(imagesOut, dir, name)).metadata();
    manifest[`/images/${dir}/${name}`] = { width, height };
  }
}
await fs.writeFile(path.join(root, 'src/data/media.json'), `${JSON.stringify(manifest, null, 2)}\n`);
await fs.rm(tmp, { recursive: true, force: true });
console.log(`Wrote ${Object.keys(manifest).length} images${imagesOnly ? '' : ' and selected videos'}. Masters in source-files/ untouched.`);
