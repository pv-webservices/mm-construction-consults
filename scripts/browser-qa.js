async (page) => {
  const base='http://127.0.0.1:4330';
  const widths=[320,375,430,768,1024,1280,1440,1920];
  const routes=['/','/about','/services','/ndt-services','/projects','/videos','/contact','/services/ndt-structural-audit','/services/structural-repairs-rehabilitation','/services/cf-wrapping-strengthening','/services/waterproofing','/services/terrace-waterproofing','/services/external-painting','/services/plumbing-drainage','/services/paver-work','/services/visual-inspection-documentation','/services/concrete-core-testing','/projects/building-rehabilitation','/projects/rcc-column-repair','/projects/building-exterior','/projects/concrete-investigation','/videos/work-4','/videos/work-7','/videos/work-23','/videos/work-24','/videos/work-25','/videos/work-31','/privacy-policy','/terms-conditions','/sitemap','/404.html'];
  const report={routes:routes.length,viewportChecks:0,consoleErrors:[],failedResponses:[],brokenImages:[],overflow:[],accessibility:[],screenshots:[]};
  page.on('pageerror',error=>report.consoleErrors.push(error.message));
  page.on('response',response=>{if(response.status()>=400 && !response.url().endsWith('/404.html'))report.failedResponses.push({url:response.url(),status:response.status()});});
  for(const route of routes){
    await page.setViewportSize({width:1440,height:1000});
    await page.goto(base+route,{waitUntil:'networkidle'});
    await page.evaluate(async()=>{
      await document.fonts.ready;
      document.querySelectorAll('img').forEach(img=>{img.loading='eager';});
      await Promise.all([...document.images].map(img=>img.decode().catch(()=>null)));
    });
    const broken=await page.evaluate(()=>[...document.images].filter(img=>!img.naturalWidth).map(img=>img.currentSrc||img.src));
    report.brokenImages.push(...broken.map(src=>({route,src})));
    for(const width of widths){
      await page.setViewportSize({width,height:900});
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      const overflow=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth,elements:[...document.querySelectorAll('body *')].filter(el=>{const rect=el.getBoundingClientRect();return rect.width>0 && (rect.right>innerWidth+1||rect.left< -1)&&getComputedStyle(el).position!=='fixed';}).slice(0,8).map(el=>el.tagName+'.'+el.className)}));
      if(overflow.document>width+1)report.overflow.push({route,width,...overflow});
      report.viewportChecks++;
    }
    for(const width of [1440,375]){
      await page.setViewportSize({width,height:1000});
      await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=650){scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,45));}scrollTo({top:0,behavior:'instant'});});
      await page.waitForTimeout(650);
      await page.addScriptTag({path:'F:/Project/--INDIAN CLIENTS--/Custom/mm-construction-consults/node_modules/axe-core/axe.min.js'});
      const violations=await page.evaluate(async()=>{const r=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}});return r.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary})).slice(0,8)}));});
      if(violations.length)report.accessibility.push({route,width,violations});
      if(['/', '/services','/ndt-services','/contact','/projects','/videos'].includes(route)){
        const file='output/playwright/'+(route==='/'?'home':route.slice(1))+'-'+width+'.png';
        await page.screenshot({path:file,fullPage:true});report.screenshots.push(file);
      }
    }
  }
  await page.setViewportSize({width:1440,height:900});
  await page.goto(base);
  return report;
}
