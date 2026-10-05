// Generates the service photographs that the supplied media does not cover.
// Usage: node --env-file=.env scripts/generate-images.mjs [name ...]
// Raw model output is kept in media-src/generated; optimized WebP goes to public/images/optimized.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { Buffer } from 'node:buffer';

const MODEL = 'gemini-3.1-flash-lite-image';
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) throw new Error('GEMINI_API_KEY is missing from .env');

const STYLE =
  'Photorealistic professional construction photography, natural daylight, sharp focus, realistic textures, ' +
  'shot on a full-frame DSLR, 35mm lens, true-to-life colours. Indian workers wearing proper PPE ' +
  '(safety helmet, high-visibility vest, gloves). Mumbai residential context. ' +
  'No text, no captions, no logos, no watermarks, no brand names anywhere in the image.';

const IMAGES = {
  'ndt-upv':
    'A civil engineer in a white safety helmet and hi-vis vest performing ultrasonic pulse velocity (UPV) non-destructive testing ' +
    'on a weathered reinforced concrete column of an older Mumbai apartment building, holding two transducers against the concrete ' +
    'with a portable digital testing unit showing a waveform. Medium close-up, background softly blurred apartment blocks.',
  'core-testing':
    'A technician operating a rig-mounted concrete core cutting machine drilling a cylindrical core sample out of a concrete column ' +
    'at a building site, water cooling the diamond core bit, an extracted grey concrete core cylinder resting on the floor beside the rig. ' +
    'Close, detailed, industrial.',
  'cf-wrapping':
    'Two workers applying black carbon-fibre reinforced polymer (CFRP) wrap sheets around a square reinforced concrete column ' +
    'for structural strengthening, smoothing the sheet with a roller, epoxy primer visible on the column, stilt-parking area of a ' +
    'Mumbai residential building. Clean, professional.',
  'waterproofing':
    'A worker applying a grey cementitious waterproofing coating with a wide brush to the inside wall of an empty concrete ' +
    'underground water tank / sump, the floor and lower walls already coated, ladder and bucket nearby, work lights. Clean, methodical work.',
  'terrace-waterproofing':
    'A worker kneeling on a flat building terrace in Mumbai rolling out and torching a black bituminous waterproofing membrane, ' +
    'another worker applying white heat-reflective coating in the background, Mumbai high-rise skyline under a blue sky.',
  'external-painting':
    'Two painters on bamboo-free steel scaffolding painting the exterior facade of a six-storey Mumbai residential building ' +
    'with rollers, fresh light-cream and terracotta paint, half the facade freshly finished and half weathered, bright daylight, ' +
    'wide shot from the street showing the building.',
  'plumbing-drainage':
    'A plumber in a hi-vis vest fixing vertical PVC and CPVC drainage and water supply pipes on the exterior duct wall of a ' +
    'Mumbai apartment building, using a pipe wrench, clamps and new grey pipes, clean organised installation.',
  'paver-work':
    'Workers laying red and grey interlocking concrete paver blocks in a residential society compound in Mumbai, one worker ' +
    'tamping blocks with a rubber mallet, neat herringbone pattern, sand bedding and kerb stones visible, apartment building behind.',
};

const outRaw = path.resolve('media-src/generated');
const outWeb = path.resolve('public/images/optimized');
await fs.mkdir(outRaw, { recursive: true });
await fs.mkdir(outWeb, { recursive: true });

async function generate(name, prompt) {
  const body = {
    contents: [{ parts: [{ text: `${prompt}\n\n${STYLE}` }] }],
    generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '4:3', imageSize: '1K' } },
  };
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': API_KEY },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status} ${(await res.text()).slice(0, 400)}`);
  const json = await res.json();
  const part = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  if (!part) throw new Error(`${name}: no image returned ${JSON.stringify(json).slice(0, 400)}`);
  const buffer = Buffer.from(part.inlineData.data, 'base64');
  await fs.writeFile(path.join(outRaw, `${name}.png`), buffer);
  const base = sharp(buffer);
  for (const width of [480, 960]) {
    const suffix = width === 960 ? '' : `-${width}`;
    await base.clone().resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(outWeb, `${name}${suffix}.webp`));
  }
  const meta = await base.metadata();
  console.log(`${name}: ${meta.width}x${meta.height}`);
}

const requested = process.argv.slice(2);
const names = requested.length ? requested : Object.keys(IMAGES);
for (const name of names) {
  if (!IMAGES[name]) throw new Error(`Unknown image: ${name}`);
  await generate(name, IMAGES[name]);
}
