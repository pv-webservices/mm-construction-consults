async (page) => {
  const base='http://127.0.0.1:4330';
  const routes=['/ndt-services','/projects','/videos','/contact','/terms-conditions'];
  const report={viewportChecks:0,overflow:[],escapedHeadings:[],accessibility:[],hiddenRevealContent:[],screenshots:[]};
  for(const route of routes){
    await page.goto(base+route,{waitUntil:'networkidle'});
    const heading=await page.locator('h1').textContent();
    if(heading.includes('<br'))report.escapedHeadings.push({route,heading});
    for(const width of [320,375,430,768,1024,1280,1440,1920]){
      await page.setViewportSize({width,height:900});
      await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
      if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))report.overflow.push({route,width});
      report.viewportChecks++;
    }
    for(const width of [1440,375]){
      await page.setViewportSize({width,height:1000});
      const elements=page.locator('.reveal');
      for(let i=0;i<await elements.count();i++){await elements.nth(i).scrollIntoViewIfNeeded();await page.waitForTimeout(60);}
      await page.waitForTimeout(1100);
      await page.addScriptTag({path:'F:/Project/--INDIAN CLIENTS--/Custom/mm-construction-consults/node_modules/axe-core/axe.min.js'});
      const violations=await page.evaluate(async()=>{const r=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}});return r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}));});
      if(violations.length)report.accessibility.push({route,width,violations});
      await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
      await page.waitForTimeout(400);
      if(route!=='/terms-conditions'){const file=`output/playwright/${route.slice(1)}-${width}.png`;await page.screenshot({path:file,fullPage:true});report.screenshots.push(file);}
    }
  }
  for(const width of [1440,375]){
    await page.setViewportSize({width,height:1000});await page.goto(base,{waitUntil:'networkidle'});
    const elements=page.locator('.reveal');
    for(let i=0;i<await elements.count();i++){await elements.nth(i).scrollIntoViewIfNeeded();await page.waitForTimeout(60);}
    await page.waitForTimeout(1100);
    const hidden=await elements.evaluateAll(els=>els.filter(el=>getComputedStyle(el).opacity!=='1').map(el=>el.className));
    report.hiddenRevealContent.push(...hidden.map(className=>({width,className})));
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(400);
    const file=`output/playwright/home-${width}.png`;await page.screenshot({path:file,fullPage:true});report.screenshots.push(file);
    if(width===1440)await page.screenshot({path:'output/playwright/home-preview.png'});
  }
  await page.setViewportSize({width:1440,height:900});await page.goto(base);
  return report;
}
