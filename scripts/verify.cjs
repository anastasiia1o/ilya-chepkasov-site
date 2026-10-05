// Uses Playwright from NODE_PATH or a local installation. Requires local preview on 8766.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const paths=['index.html','research.html','publications.html','activities.html','cv.html','contact.html'];
 const heights=[];
 for(const width of [1440,780,390,320]){
  await page.setViewportSize({width,height:1000});
  for(const file of paths){
   await page.goto(`http://127.0.0.1:8766/${file}?lang=ru`);
   await page.waitForLoadState('networkidle');
   assert.equal(await page.locator('h1').count(),1,file);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
   assert.equal(overflow,false,`${file}: horizontal overflow at ${width}`);
   for(const img of await page.locator('img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode());}
   assert.equal(await page.evaluate(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0)),true,file);
   await page.evaluate(()=>scrollTo(0,0));
   await page.locator('[data-lang="en"]').click();
   assert.equal(await page.locator('html').getAttribute('lang'),'en');
   assert.equal(await page.locator('[data-lang="en"]').getAttribute('aria-pressed'),'true');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${file}: EN overflow at ${width}`);
   heights.push({width,file,height:await page.evaluate(()=>document.documentElement.scrollHeight)});
   assert.equal(await page.locator('h1').evaluate(el=>getComputedStyle(el).fontFamily.includes('Georgia')),false);
   if(width===390&&file==='index.html')await page.screenshot({path:'.preview/home-mobile.png',fullPage:true});
  }
 }
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('http://127.0.0.1:8766/publications.html?lang=ru');
 assert.equal(await page.locator('.publication').count(),4);
 assert.equal(await page.locator('#page-status').textContent(),'1 из 16');
 const firstTitle=await page.locator('.publication h2').first().textContent();
 await page.locator('#page-next').click();
 assert.notEqual(await page.locator('.publication h2').first().textContent(),firstTitle);
 assert.equal(await page.locator('#page-status').textContent(),'2 из 16');
 await page.reload();assert.equal(await page.locator('#page-status').textContent(),'2 из 16');
 await page.locator('[data-lang="en"]').click();assert.equal(await page.locator('#page-status').textContent(),'2 of 16');
 await page.locator('[data-lang="ru"]').click();
 await page.locator('#page-prev').click();assert.equal(await page.locator('#page-status').textContent(),'1 из 16');
 // Every catalog item remains reachable exactly once through pagination.
 const titles=[];
 for(let i=0;i<16;i++){
  titles.push(...await page.locator('.publication h2').allTextContents());
  if(i<15)await page.locator('#page-next').click();
 }
 assert.equal(titles.length,64);assert.equal(new Set(titles).size,64);
 assert.equal(await page.locator('#page-next').isDisabled(),true);
 await page.locator('[data-type="review"]').click();assert.equal(await page.locator('.publication').count(),3);
 await page.locator('#year').selectOption('2024');assert.equal(await page.locator('.publication').count(),1);
 await page.locator('#search').fill('core shell');assert.equal(await page.locator('.publication').count(),1);
 await page.locator('[data-lang="en"]').click();assert.equal(await page.locator('.publication').count(),1);
 assert.equal(await page.locator('#search').inputValue(),'core shell');
 assert.equal(await page.locator('#year').inputValue(),'2024');
 await page.reload();assert.equal(await page.locator('.publication').count(),1);
 await page.locator('#search').fill('zzzznonexistent');assert.equal(await page.locator('.publication').count(),0);assert.equal(await page.locator('#empty').isVisible(),true);
 await page.locator('#reset').click();assert.equal(await page.locator('.publication').count(),4);
 await page.locator('#sort').selectOption('old');assert.equal(await page.locator('.publication-year').first().textContent(),'2010');
 await page.locator('#sort').selectOption('type');assert.equal(await page.locator('.type-label').first().textContent(),'Review');
 await page.locator('summary').first().click();assert.equal(await page.locator('details').first().getAttribute('open'),'');
 await page.locator('#search').fill('10.1002/smll.202510144');assert.equal(await page.locator('.publication').count(),1);
 await page.locator('#search').fill('');await page.locator('#sort').selectOption('new');
 await page.screenshot({path:'.preview/publications-desktop.png',fullPage:true});
 await page.goto('http://127.0.0.1:8766/index.html?lang=ru');await page.screenshot({path:'.preview/home-desktop.png',fullPage:true});
 await page.locator('[data-lang="en"]').click();await page.screenshot({path:'.preview/home-english.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.reload();await page.locator('#menu-toggle').click();assert.equal(await page.locator('#nav').isVisible(),true);
 await page.locator('#nav a[href*="research.html"]').click();assert.equal(await page.locator('html').getAttribute('lang'),'en');
 await page.goto('http://127.0.0.1:8766/publications.html?lang=ru');
 assert.equal(await page.locator('.publication').count(),2);
 assert.equal(await page.locator('#page-status').textContent(),'1 из 32');
 const desktopHeights=[];
 for(const size of [{width:1440,height:900},{width:1366,height:768}]){
  await page.setViewportSize(size);
  for(const file of paths){
   await page.goto(`http://127.0.0.1:8766/${file}?lang=ru`);
   for(const language of ['ru','en']){
    await page.locator(`[data-lang="${language}"]`).click();
    const height=await page.evaluate(()=>document.documentElement.scrollHeight);
    desktopHeights.push({...size,file,language,documentHeight:height});
    assert(height<=size.height,`${file} ${language}: ${height} > ${size.height}`);
   }
  }
 }
 assert.deepEqual(errors,[]);
 // Validate every local href/src, including source-language content and data.
 let links=0;
 for(const file of paths){
  const hrefs=await page.evaluate(html=>{const doc=new DOMParser().parseFromString(html,'text/html');return [...doc.querySelectorAll('[href],[src]')].map(el=>el.getAttribute('href')||el.getAttribute('src'));},fs.readFileSync(file,'utf8'));
  for(const href of hrefs){
   if(/^(https?:|mailto:|#)/.test(href))continue;
   assert.equal(fs.existsSync(path.resolve(href.split(/[?#]/)[0])),true,href);links++;
  }
 }
 const pubs=JSON.parse(fs.readFileSync('assets/data/publications.json','utf8'));
 assert.equal(new Set(pubs.filter(r=>r.doi).map(r=>r.doi)).size,pubs.filter(r=>r.doi).length);
 assert(pubs.every(r=>r.authors.toLowerCase().includes('chepkasov')&&r.title&&r.journal&&r.year));
 console.log(JSON.stringify({pages:6,widths:[1440,780,390,320],languages:2,publications:pubs.length,reviews:3,localLinks:links,consoleErrors:errors,desktopHeights,checks:'pagination coverage, boundaries, page reload, search, year, type, sort, empty, reset, language, responsive page size, desktop page length'},null,2));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
