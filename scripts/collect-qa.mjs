import fs from 'node:fs/promises';
for(const name of ['browser-matrix','interactions','final-review']){
  const text=await fs.readFile(`output/qa/${name}.txt`,'utf8');
  const result=text.match(/### Result\r?\n(\{[^\n]+\})/);
  if(!result)throw new Error(`${name}: no completed report`);
  const report=JSON.parse(result[1]);
  await fs.writeFile(`output/qa/${name}.json`,JSON.stringify(report,null,2));
  const failures=['failed','consoleErrors','failedResponses','brokenImages','overflow','accessibility','escapedHeadings','hiddenRevealContent'].flatMap(key=>report[key]||[]);
  if(failures.length)throw new Error(`${name}: ${JSON.stringify(failures)}`);
  console.log(`${name}: PASS${report.passed?` (${report.passed.length} interaction checks)`:''}${report.viewportChecks?` (${report.viewportChecks} viewport checks)`:''}`);
}
