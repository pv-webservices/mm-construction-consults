import fs from 'node:fs/promises';
import path from 'node:path';
// Source media remain in public. Release output contains only curated derivatives.
const dist=path.resolve('dist');
for (const relative of ['images','videos']) {
  const dir=path.resolve(dist,relative);
  if (!dir.startsWith(dist+path.sep)) throw new Error('Invalid output path');
  for (const entry of await fs.readdir(dir,{withFileTypes:true})) {
    if(entry.isFile() && /\.(?:jpe?g|png|mp4)$/i.test(entry.name)) await fs.unlink(path.join(dir,entry.name));
  }
}
console.log('Release media pruned: optimized images and selected video copies only.');
