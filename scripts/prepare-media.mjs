// Builds every optimized image and video used by the website from the supplied originals.
// Usage: node scripts/prepare-media.mjs [--images-only]
// Originals in public/images and public/videos are never modified.
// AI-generated service photographs are produced separately by scripts/generate-images.mjs.
import sharp from 'sharp';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const imagesIn = path.join(root, 'public/images');
const videosIn = path.join(root, 'public/videos');
const out = path.join(root, 'public/images/optimized');
const videoOut = path.join(root, 'public/videos/selected');
const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'mm-media-'));
const imagesOnly = process.argv.includes('--images-only');
const GENERATED = /^(ndt-upv|core-testing|cf-wrapping|waterproofing|terrace-waterproofing|external-painting|plumbing-drainage|paver-work)(-480)?\.webp$/;

await fs.mkdir(out, { recursive: true });
// Remove stale derivatives, but keep the generated photographs.
for (const name of await fs.readdir(out)) {
  if (!GENERATED.test(name)) await fs.unlink(path.join(out, name));
}

const ffmpeg = (args) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args]);

function frame(video, seconds, filter) {
  const file = path.join(tmp, `${path.basename(video, '.mp4')}-${seconds}.png`);
  ffmpeg(['-ss', String(seconds), '-i', path.join(videosIn, video), '-frames:v', '1', ...(filter ? ['-vf', filter] : []), file]);
  return file;
}

/** Writes name.webp (largest) and name-<w>.webp for each smaller width. */
async function write(input, name, { widths = [480, 960], crop, upscale, sharpen = 0.6, quality = 82, trim = false } = {}) {
  let base = sharp(input).rotate();
  if (trim) base = base.trim({ threshold: 20 });
  if (crop) base = base.extract(crop);
  if (upscale) base = sharp(await base.resize({ width: upscale, kernel: 'lanczos3' }).toBuffer());
  const buffer = await base.sharpen({ sigma: sharpen }).modulate({ saturation: 1.04 }).toBuffer();
  const { width: native } = await sharp(buffer).metadata();
  const sizes = [...new Set(widths.map((w) => Math.min(w, native)))];
  const largest = Math.max(...sizes);
  for (const width of sizes) {
    const file = width === largest ? `${name}.webp` : `${name}-${width}.webp`;
    await sharp(buffer).resize({ width }).webp({ quality }).toFile(path.join(out, file));
  }
}

// Supplied work photographs: refined and sharpened.
await write(path.join(imagesIn, 'website-logo-tm.jpeg'), 'logo', { widths: [240, 480], trim: true, sharpen: 0.4, quality: 90 });
await write(path.join(imagesIn, 'client work image-4.jpeg'), 'scaffold', { widths: [600, 1170] });
await write(path.join(imagesIn, 'client work image-3.jpeg'), 'completed', { widths: [600, 1170] });
await write(path.join(imagesIn, 'client work image-1.jpeg'), 'inspection', { widths: [600, 1170] });
await write(path.join(imagesIn, 'client work image-2.jpeg'), 'repair', { widths: [600, 1170] });

// Small brochure crops: upscaled with Lanczos and sharpened so they stay crisp in cards.
const brochure = path.join(imagesIn, 'services-image-2.jpeg');
await write(brochure, 'rebound', { crop: { left: 303, top: 805, width: 239, height: 145 }, upscale: 720, sharpen: 1, widths: [720] });
await write(brochure, 'thermal', { crop: { left: 303, top: 1000, width: 239, height: 145 }, upscale: 720, sharpen: 1, widths: [720] });

// Founder portrait and brand-film poster from the supplied animated film.
const film = 'client work animated video.mp4';
await write(frame(film, 130.5), 'founder', { crop: { left: 304, top: 35, width: 252, height: 338 }, upscale: 600, sharpen: 0.9, widths: [600] });
await write(frame(film, 4), 'film-poster', { widths: [848] });

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
  await write(frame(`client work video-${n}.mp4`, t, filter), `video-${n}`, { widths: [480], sharpen: 0.8 });
}

// Society project photographs, ISO certificate and project clips supplied in Oct 2026.
const projectsIn = path.join(root, 'public/new project images & videos');
export const projectPhotos = {
  'park-corner': ['Park corner sagar shilp chs.jpeg'],
  'kapil-ratna': ['Kapil Ratna Chs-1.jpeg', 'Kapil Ratna Chs-1a.jpeg'],
  'himgiri-sai-shyam': ['Himgiri Sai Shyam CHS.jpeg'],
  'atharva-heights': ['Atharva Heights Chs-1a.jpeg', 'Atharva Heights Chs-1b.jpeg'],
  'hamza-tower': ['HAMZA TOWER-1a.jpeg', 'HAMZA TOWER-1b.jpeg', 'HAMZA TOWER-1c.jpeg'],
  'prestige-park': ['Prestige Park CHS 1a.jpeg', 'Prestige Park CHS 1b.jpeg'],
  'sukur-enclave': ['Sukur enclave 1a.jpeg', 'Sukur enclave 1b.jpeg'],
  'sunshine': ['Sunshine chs.jpeg'],
  'mahindra-park': ['Mahindra park chs 1a.jpeg', 'Mahindra park chs 1b.jpeg'],
  'neelkanth-nagar': ['Neelkanth Nagar chs.jpeg'],
  'zelam': ['Zelam Chs.jpeg'],
  'peace-haven': ['Peace haven chs-1a.jpeg', 'Peace haven chs-1b.jpeg', 'Peace haven chs-1c.jpeg'],
};
for (const [slug, files] of Object.entries(projectPhotos)) {
  for (const [i, file] of files.entries()) {
    await write(path.join(projectsIn, file), `project-${slug}-${i + 1}`, { widths: [480, 960] });
  }
}
await write(path.join(projectsIn, 'certificate.jpeg'), 'certificate', { widths: [480, 900], sharpen: 0.4, quality: 88 });

export const projectVideos = [
  { slug: 'atharva-heights', file: 'Atharva Heights Chs-1 video.mp4', t: 1.5 },
  { slug: 'hamza-tower', file: 'HAMZA TOWER-1 video.mp4', t: 1 },
  { slug: 'prestige-park', file: 'Prestige Park CHS video.mp4', t: 3 },
];
for (const { slug, file, t } of projectVideos) {
  const still = path.join(tmp, `${slug}.png`);
  ffmpeg(['-ss', String(t), '-i', path.join(projectsIn, file), '-frames:v', '1', still]);
  await write(still, `project-${slug}-video`, { widths: [480], sharpen: 0.8 });
}

if (!imagesOnly) {
  await fs.rm(videoOut, { recursive: true, force: true });
  await fs.mkdir(videoOut, { recursive: true });
  for (const n of [3, 4, 6, 8, 10, 24, 31]) {
    const crop = n === 4 ? 'crop=464:640:8:106,' : '';
    ffmpeg(['-i', path.join(videosIn, `client work video-${n}.mp4`), '-vf', `${crop}scale=trunc(min(720\\,iw)/2)*2:-2`,
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '26', '-an', '-movflags', '+faststart', path.join(videoOut, `work-${n}.mp4`)]);
  }
  for (const { slug, file } of projectVideos) {
    ffmpeg(['-i', path.join(projectsIn, file), '-vf', 'scale=trunc(min(720\\,iw)/2)*2:-2',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '26', '-an', '-movflags', '+faststart', path.join(videoOut, `project-${slug}.mp4`)]);
  }
  // The brand film keeps its narration.
  ffmpeg(['-i', path.join(videosIn, film), '-c:v', 'libx264', '-preset', 'medium', '-crf', '27', '-c:a', 'aac', '-b:a', '96k',
    '-movflags', '+faststart', path.join(videoOut, 'brand-film.mp4')]);
}

const manifest = {};
for (const name of (await fs.readdir(out)).sort()) {
  const { width, height } = await sharp(path.join(out, name)).metadata();
  manifest[`/images/optimized/${name}`] = { width, height };
}
await fs.writeFile(path.join(root, 'src/data/media.json'), JSON.stringify(manifest, null, 2));
await fs.rm(tmp, { recursive: true, force: true });
console.log(`Optimized ${Object.keys(manifest).length} images${imagesOnly ? '' : ' and selected videos'}. Originals preserved.`);
