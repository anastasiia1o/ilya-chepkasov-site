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
   for(const img of await page.locator('img:visible').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode());}
   assert.equal(await page.evaluate(()=>[...document.images].filter(i=>i.getClientRects().length).every(i=>i.complete&&i.naturalWidth>0)),true,file);
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
 assert.equal(await page.locator('.publication').count(),64);
 assert.equal(await page.locator('.pagination').count(),0);
 const titles=await page.locator('.publication h2').allTextContents();
 assert.equal(new Set(titles).size,64);
 await page.locator('.publication').last().scrollIntoViewIfNeeded();
 assert(await page.evaluate(()=>scrollY>0));
 await page.evaluate(()=>scrollTo(0,0));
 await page.locator('[data-type="review"]').click();assert.equal(await page.locator('.publication').count(),3);
 await page.locator('#year').selectOption('2024');assert.equal(await page.locator('.publication').count(),1);
 await page.locator('#search').fill('core shell');assert.equal(await page.locator('.publication').count(),1);
 await page.locator('[data-lang="en"]').click();assert.equal(await page.locator('.publication').count(),1);
 assert.equal(await page.locator('#search').inputValue(),'core shell');
 assert.equal(await page.locator('#year').inputValue(),'2024');
 await page.reload();assert.equal(await page.locator('.publication').count(),1);
 await page.locator('#search').fill('zzzznonexistent');assert.equal(await page.locator('.publication').count(),0);assert.equal(await page.locator('#empty').isVisible(),true);
 await page.locator('#reset').click();assert.equal(await page.locator('.publication').count(),64);
 await page.locator('#sort').selectOption('old');assert.equal(await page.locator('.publication-year').first().textContent(),'2010');
 await page.locator('#sort').selectOption('type');assert.equal(await page.locator('.type-label').first().textContent(),'Review');
 await page.locator('summary').first().click();assert.equal(await page.locator('details').first().getAttribute('open'),'');
 await page.locator('#search').fill('10.1002/smll.202510144');assert.equal(await page.locator('.publication').count(),1);
 await page.locator('#search').fill('');await page.locator('#sort').selectOption('new');
 await page.screenshot({path:'.preview/publications-desktop.png',fullPage:false});
 await page.goto('http://127.0.0.1:8766/index.html?lang=ru');await page.screenshot({path:'.preview/home-desktop.png',fullPage:true});
 await page.locator('[data-lang="en"]').click();await page.screenshot({path:'.preview/home-english.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.reload();await page.locator('#menu-toggle').click();assert.equal(await page.locator('#nav').isVisible(),true);
 await page.locator('#nav a[href*="research.html"]').click();assert.equal(await page.locator('html').getAttribute('lang'),'en');
 await page.goto('http://127.0.0.1:8766/publications.html?lang=ru');
 assert.equal(await page.locator('.publication').count(),64);
 const desktopHeights=[];
 for(const size of [{width:1440,height:900},{width:1366,height:768}]){
  await page.setViewportSize(size);
  for(const file of paths){
   await page.goto(`http://127.0.0.1:8766/${file}?lang=ru`);
   for(const language of ['ru','en']){
    await page.locator(`[data-lang="${language}"]`).click();
    const height=await page.evaluate(()=>document.documentElement.scrollHeight);
    desktopHeights.push({...size,file,language,documentHeight:height});
    if(file==='publications.html')assert(height>size.height);
    else if(file==='index.html')assert(height<=1150,`${file} ${language}: excessive homepage height ${height}`);
    else assert(height<=size.height,`${file} ${language}: ${height} > ${size.height}`);
   }
  }
 }
 await page.goto('http://127.0.0.1:8766/research.html?lang=ru');
 assert(await page.locator('#panel-catalysis .study-description').innerText());
 assert.equal(await page.locator('#panel-catalysis img').count(),1);
 assert.equal(await page.locator('#panel-catalysis h2').count(),0);
 assert(await page.locator('#tab-catalysis').evaluate(el=>el.getBoundingClientRect().height)>=76);
 assert.equal(await page.locator('#panel-catalysis img').evaluate(i=>getComputedStyle(i).filter),'none');
 await page.evaluate(async()=>{const i=new Image();i.src='assets/images/pt-carbon.jpg';await i.decode();});
 await page.screenshot({path:'.preview/research-background.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'.preview/research-background-mobile.png',fullPage:true});
 const areas=['catalysis','batteries','2d','thermoelectrics','modeling'];
 for(const viewport of [{width:1366,height:768},{width:780,height:1000},{width:390,height:844},{width:320,height:700}]){
  await page.setViewportSize(viewport);
  for(const area of areas){
   await page.locator(`[data-area="${area}"]`).click();
   assert.equal(await page.locator('[role="tabpanel"]:visible').count(),1);
   assert.equal(await page.locator(`[data-area="${area}"]`).getAttribute('aria-selected'),'true');
   assert.equal(new URL(page.url()).searchParams.get('area'),area);
   for(const img of await page.locator('img:visible').all())await img.evaluate(i=>i.decode());
   for(const language of ['en','ru']){
    await page.locator(`[data-lang="${language}"]`).click();
    assert.equal(await page.locator(`#panel-${area}`).isVisible(),true);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    if(viewport.width>780)assert(await page.evaluate(()=>document.documentElement.scrollHeight)<=viewport.height);
   }
   if(viewport.width===1366||viewport.width===390)await page.screenshot({path:`.preview/research-${area}-${viewport.width}.png`,fullPage:true});
  }
 }
 await page.goto('http://127.0.0.1:8766/research.html?lang=en&area=2d');
 assert.equal(await page.locator('#panel-2d').isVisible(),true);
 await page.locator('#tab-2d').focus();await page.keyboard.press('ArrowDown');
 assert.equal(await page.locator('#panel-thermoelectrics').isVisible(),true);
 await page.keyboard.press('Home');assert.equal(await page.locator('#panel-catalysis').isVisible(),true);
 await page.keyboard.press('End');assert.equal(await page.locator('#panel-modeling').isVisible(),true);
 for(const area of areas){
  await page.locator(`[data-area="${area}"]`).click();
  await page.locator(`#panel-${area} [data-open-image]`).click();
  assert.equal(await page.locator('#figure-viewer').isVisible(),true);
  await page.locator('#figure-original').evaluate(i=>i.decode());
  const expected=await page.locator(`#panel-${area} img`).getAttribute('data-alt-en');
  assert.equal(await page.locator('#figure-original').getAttribute('alt'),expected);
  assert.equal(await page.evaluate(()=>{const box=document.querySelector('#figure-viewer').getBoundingClientRect();return box.left>=0&&box.right<=innerWidth&&box.top>=0&&box.bottom<=innerHeight;}),true);
  await page.keyboard.press('Escape');assert.equal(await page.locator('#figure-viewer').isVisible(),false);
 }
 await page.goto('http://127.0.0.1:8766/index.html?lang=ru');
 assert.equal(await page.locator('.news-card').count(),8);
 const newsDates=await page.locator('.news-card time').evaluateAll(items=>items.map(item=>item.dateTime));
 assert.deepEqual(newsDates,[...newsDates].sort().reverse());
 assert.equal(await page.locator('.hero .eyebrow').count(),0);
 assert((await page.locator('.hero-role').innerText()).includes('Сколковский институт науки и технологий'));
 assert.equal(await page.locator('#news-prev').isDisabled(),true);
 await page.locator('#news-next').click();
 await page.waitForFunction(()=>!document.querySelector('#news-prev').disabled);
 assert.equal(await page.locator('#news-prev').isDisabled(),false);
 await page.locator('#news-list').focus();await page.keyboard.press('End');
 await page.waitForFunction(()=>document.querySelector('#news-next').disabled);
 assert.equal(await page.locator('#news-next').isDisabled(),true);
 assert(await page.locator('.news-card a[href="https://www.kommersant.ru/doc/8097907"]').count()>0);
 await page.locator('[data-lang="en"]').click();
 assert.equal(await page.locator('#news-heading').innerText(),'News & media');
 await page.locator('#news-list').focus();await page.keyboard.press('Home');
 assert.equal(await page.locator('#news-list').evaluate(el=>el.scrollLeft),0);
 await page.locator('[data-lang="ru"]').click();
 await page.locator('.research-chips a').nth(1).click();
 assert.equal(await page.locator('#panel-batteries').isVisible(),true);
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
 for(const href of await page.locator('.study-caption a').evaluateAll(links=>links.map(a=>a.href))){
  assert(pubs.some(p=>'https://doi.org/'+p.doi.toLowerCase()===href.toLowerCase()),href);
 }
 console.log(JSON.stringify({pages:6,widths:[1440,780,390,320],languages:2,publications:pubs.length,reviews:3,researchAreas:5,localLinks:links,consoleErrors:errors,checks:'scrollable catalog and filters; research tabs, deep links, keyboard, original-image viewer, verified DOI matches; bilingual responsive and compact desktop pages'},null,2));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
