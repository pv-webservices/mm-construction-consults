import fs from 'node:fs';
import path from 'node:path';

/** Every built page URL, read from dist (run `npm run build` first). */
export function builtPages(): string[] {
  const dist = path.resolve('dist');
  const walk = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
  return walk(dist)
    .filter((f) => f.endsWith('index.html'))
    .map((f) => `/${path.relative(dist, f).split(path.sep).join('/').replace(/index\.html$/, '')}`)
    .sort();
}

export const VIEWPORTS = [320, 375, 768, 1024, 1440];
