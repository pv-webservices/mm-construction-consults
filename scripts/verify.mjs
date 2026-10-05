import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('dist');
async function files(dir) {const entries=await fs.readdir(dir,{withFileTypes:true});return (await Promise.all(entries.map(e=>e.isDirectory()?files(path.join(dir,e.name)):path.join(dir,e.name)))).flat();}
const all=await files(root), html=all.filter(f=>f.endsWith('.html'));
const failures=[],titles=new Set(),descriptions=new Set();let links=0,images=0,schemas=0,inlineClientJsBytes=0;
for(const file of html){
  const text=await fs.readFile(file,'utf8'),rel=path.relative(root,file);
  const title=text.match(/<title>(.*?)<\/title>/s)?.[1];
  const description=text.match(/<meta name="description" content="([^"]*)"/)?.[1];
  if(!title||titles.has(title))failures.push(`${rel}: missing or duplicate title`);titles.add(title);
  if(!description||descriptions.has(description))failures.push(`${rel}: missing or duplicate description`);descriptions.add(description);
  if((text.match(/<h1[ >]/g)||[]).length!==1)failures.push(`${rel}: needs one H1`);
  if(/<h1[^>]*>[^<]*&lt;br/i.test(text))failures.push(`${rel}: escaped line break in heading`);
  if(!text.includes('lang="en"'))failures.push(`${rel}: missing document language`);
  inlineClientJsBytes=Math.max(inlineClientJsBytes,[...text.matchAll(/<script type="module">(.*?)<\/script>/gs)].reduce((sum,m)=>sum+Buffer.byteLength(m[1]),0));
  for(const schema of text.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)){try{JSON.parse(schema[1]);schemas++;}catch{failures.push(`${rel}: invalid schema`);}}
  const refs=[...text.matchAll(/(?:href|src)="([^"#]+)"/g)].map(m=>m[1].replaceAll('&amp;','&'));
  for(const ref of refs){
    if(!ref.startsWith('/'))continue;
    const p=decodeURIComponent(ref.split(/[?#]/)[0]);
    const target=path.join(root,p);
    try{let stat=await fs.stat(target);if(stat.isDirectory())stat=await fs.stat(path.join(target,'index.html'));if(!stat.isFile())throw new Error('not file');links++;}catch{failures.push(`${rel}: broken reference ${ref}`);}
  }
  for(const img of text.matchAll(/<img\b[^>]*>/g)){images++;if(!/alt="[^"]*"/.test(img[0]))failures.push(`${rel}: image missing alt`);}
  for(const set of text.matchAll(/srcset="([^"]+)"/g)){
    for(const source of set[1].split(',')){const p=source.trim().split(' ')[0];try{await fs.stat(path.join(root,p));}catch{failures.push(`${rel}: broken srcset ${p}`);}}
  }
}
const rootPhotos=all.filter(f=>path.dirname(f)===path.join(root,'images'));
const rootVideos=all.filter(f=>path.dirname(f)===path.join(root,'videos') && f.endsWith('.mp4'));
if(rootPhotos.length||rootVideos.length)failures.push('Release contains unselected original media');
const js=all.filter(f=>f.endsWith('.js'));let jsBytes=0;for(const f of js)jsBytes+=(await fs.stat(f)).size;
const report={pages:html.length,uniqueTitles:titles.size,uniqueDescriptions:descriptions.size,internalReferences:links,imageReferences:images,schemas,externalClientJsBytes:jsBytes,maxInlineClientJsBytes:inlineClientJsBytes,selectedVideos:all.filter(f=>f.endsWith('.mp4')).length,failures};
await fs.mkdir('output/qa',{recursive:true});await fs.writeFile('output/qa/static-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(failures.length)process.exitCode=1;
