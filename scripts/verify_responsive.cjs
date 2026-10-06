// Browser checks for the shared responsive layout. Optional SITE_BASE verifies a deployment.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const base=process.env.SITE_BASE||'http://127.0.0.1:8766/';
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const files=['index','research','publications','activities','cv','contact'];
 const widths=process.env.SITE_BASE?[1440,390]:[1920,1440,1024,901,900,820,780,600,540,430,390,360,320];
 let layouts=0;
 for(const width of widths){
  await page.setViewportSize({width,height:900});
  for(const file of files){
   await page.goto(`${base}${file}.html?lang=ru`);await page.waitForLoadState('networkidle');
   for(const lang of ['ru','en']){
    await page.locator(`[data-lang="${lang}"]`).click();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${file}/${lang}/${width}: overflow`);
    const small=await page.locator('button:visible,input:visible,select:visible,.pub-actions a:visible').evaluateAll(els=>els.filter(el=>el.getBoundingClientRect().height<43.9||el.getBoundingClientRect().width<43.9).map(el=>el.textContent.trim()||el.id));
    assert.deepEqual(small,[],`${file}/${lang}/${width}: undersized controls`);
    const alignment=await page.evaluate(()=>({header:document.querySelector('.header-inner').getBoundingClientRect().left,content:document.querySelector('main .container').getBoundingClientRect().left}));
    assert(Math.abs(alignment.header-alignment.content)<1,`${file}: common left edge`);
    if(file==='index'){
     const sizes=await page.locator('.hero-actions .button').evaluateAll(els=>els.map(el=>({w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height})));
     assert(Math.abs(sizes[0].w-sizes[1].w)<1);assert(Math.abs(sizes[0].h-sizes[1].h)<1);
     const chips=await page.locator('.research-chips a').evaluateAll(els=>els.map(el=>({top:el.getBoundingClientRect().top,h:el.getBoundingClientRect().height})));
     assert(Math.abs(chips[0].top-chips[1].top)<1);assert(Math.abs(chips[2].top-chips[3].top)<1);
     assert.equal(await page.locator('.news-card').count(),8);
    }
    if(file==='publications'){
     assert.equal(await page.locator('.publication').count(),64);
     assert.equal(await page.locator('.publication:has(sub)').count(),12);
     assert.equal(await page.locator('.pdf-link').count(),19);
     assert(await page.locator('#search').evaluate(el=>parseFloat(getComputedStyle(el).fontSize)>=16));
    }
    if(width<=900){
     await page.locator('#menu-toggle').click();assert.equal(await page.locator('#nav').isVisible(),true);
     assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'true');
     const links=await page.locator('#nav a').evaluateAll(els=>els.map(el=>el.getBoundingClientRect().height));assert(links.every(h=>h>=44));
     await page.locator('h1').click();assert.equal(await page.locator('#nav').isVisible(),false);
     assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'false');
    }
    if([1440,820,390,320].includes(width)&&lang==='ru'){
     await page.evaluate(()=>document.activeElement.blur());
     await page.mouse.move(0,0);
     await page.screenshot({path:`.preview/refined-${file}-${width}.png`,fullPage:file!=='publications'});
    }
    layouts++;
   }
  }
  console.log(`Verified ${width}px: six pages, RU/EN, alignment and 44px controls`);
 }
 // Resize an expanded menu across its breakpoint: state must reset.
 await page.setViewportSize({width:390,height:844});await page.goto(base+'index.html?lang=ru');
 await page.locator('#menu-toggle').click();await page.setViewportSize({width:1440,height:900});
 await page.waitForFunction(()=>document.querySelector('#menu-toggle').getAttribute('aria-expanded')==='false');
 assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'false');
 await page.setViewportSize({width:390,height:844});assert.equal(await page.locator('#nav').isVisible(),false);
 assert.deepEqual(errors,[]);await browser.close();console.log(JSON.stringify({layouts,consoleErrors:errors,status:'passed'}));
})().catch(e=>{console.error(e);process.exit(1)});
