(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const all = (selector) => [...document.querySelectorAll(selector)];
  const params = new URLSearchParams(location.search);
  let saved;
  try { saved = localStorage.getItem('ic-language'); } catch {}
  let lang = ['ru','en'].includes(params.get('lang')) ? params.get('lang') : saved === 'en' ? 'en' : 'ru';
  let type = ['review','article','conference'].includes(params.get('type')) ? params.get('type') : 'all';
  const words = {ru:{review:'Обзор',article:'Статья',conference:'Материалы конференции',authors:'Авторы',copy:'Копировать DOI',copied:'Скопировано',failed:'DOI: ',count:'Найдено',read:'Читать обзор'},en:{review:'Review',article:'Article',conference:'Conference paper',authors:'Authors',copy:'Copy DOI',copied:'Copied',failed:'DOI: ',count:'Found',read:'Read review'}};
  const normalize = s => s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const rows = Array.isArray(window.PUBLICATIONS) ? window.PUBLICATIONS : [];
  const newsList=$('#news-list');
  function updateNewsControls(){
    if(!newsList)return;
    $('#news-prev').disabled=newsList.scrollLeft<2;
    $('#news-next').disabled=newsList.scrollLeft+newsList.clientWidth>=newsList.scrollWidth-2;
  }
  function scrollNews(direction){
    const step=newsList.clientWidth+24;
    newsList.scrollBy({left:direction*step,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
  }
  if(newsList){
    $('#news-prev').addEventListener('click',()=>scrollNews(-1));
    $('#news-next').addEventListener('click',()=>scrollNews(1));
    newsList.addEventListener('scroll',updateNewsControls,{passive:true});
    window.addEventListener('resize',updateNewsControls);
    newsList.addEventListener('keydown',event=>{
      if(event.target!==newsList)return;
      if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();scrollNews(event.key==='ArrowLeft'?-1:1);}
      if(['Home','End'].includes(event.key)){event.preventDefault();newsList.scrollTo({left:event.key==='Home'?0:newsList.scrollWidth,behavior:'instant'});}
    });
  }
  const researchTabs=all('[role="tab"][data-area]');
  function selectArea(area,focus=false) {
    const active=researchTabs.find(tab=>tab.dataset.area===area);
    if(!active)return;
    researchTabs.forEach(tab=>{const selected=tab===active;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;$('#'+tab.getAttribute('aria-controls')).hidden=!selected;});
    const url=new URL(location.href);url.searchParams.set('area',area);history.replaceState(null,'',url);
    if(focus)active.focus();
  }
  researchTabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>selectArea(tab.dataset.area));
    tab.addEventListener('keydown',event=>{
      let next;
      if(['ArrowDown','ArrowRight'].includes(event.key))next=(index+1)%researchTabs.length;
      if(['ArrowUp','ArrowLeft'].includes(event.key))next=(index+researchTabs.length-1)%researchTabs.length;
      if(event.key==='Home')next=0;
      if(event.key==='End')next=researchTabs.length-1;
      if(next!==undefined){event.preventDefault();selectArea(researchTabs[next].dataset.area,true);}
    });
  });
  if(researchTabs.length)selectArea(params.get('area')||'catalysis');
  const viewer=$('#figure-viewer');
  all('[data-open-image]').forEach(link=>link.addEventListener('click',event=>{
    if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    event.preventDefault();
    const caption=link.closest('.study-caption')?.querySelector('[data-ru]');
    const source=link.querySelector('img');
    const ru=caption?.dataset.ru||source.dataset.altRu,en=caption?.dataset.en||source.dataset.altEn;
    const output=$('#figure-caption');output.dataset.ru=ru;output.dataset.en=en;output.textContent=lang==='ru'?ru:en;
    const img=$('#figure-original');img.src=link.href;img.dataset.altRu=ru;img.dataset.altEn=en;img.alt=lang==='ru'?ru:en;
    viewer.showModal();
  }));
  $('#close-figure')?.addEventListener('click',()=>viewer.close());
  viewer?.addEventListener('click',event=>{if(event.target===viewer){const box=viewer.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)viewer.close();}});
  if(researchTabs.length){
    const query=matchMedia('(max-width:780px)');
    const orient=()=>$('.research-tabs').setAttribute('aria-orientation',query.matches?'horizontal':'vertical');
    query.addEventListener('change',orient);orient();
  }
  function translate() {
    document.documentElement.lang = lang;
    document.title = document.body.dataset[lang === 'ru' ? 'titleRu' : 'titleEn'];
    $('[name="description"]').content = lang === 'ru' ? 'Илья Чепкасов — старший научный сотрудник Сколтеха. Вычислительное материаловедение, нанокатализ и материалы для энергетики.' : 'Ilya Chepkasov — Senior Research Scientist at Skoltech. Computational materials science, nanocatalysis and energy materials.';
    all('[data-ru]').forEach(el => { el.textContent = el.dataset[lang]; });
    [['placeholder','Placeholder'],['alt','Alt'],['aria-label','Aria']].forEach(([attr,key]) => {
      all(`[data-${key.toLowerCase()}-ru]`).forEach(el => el.setAttribute(attr,el.dataset[key.toLowerCase()+(lang === 'ru' ? 'Ru' : 'En')]));
    });
    all('[data-lang]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.lang === lang)));
    all('a[href*="scholar.google.com/citations?user="]').forEach(a => {const url = new URL(a.href);url.searchParams.set('hl',lang);a.href=url.href;});
    all('a[href$=".html"],a[href*=".html?"]').forEach(a => {const url = new URL(a.href);url.searchParams.set('lang',lang);a.href=url.href;});
    renderPublications();
    requestAnimationFrame(updateNewsControls);
  }
  all('[data-lang]').forEach(button => button.addEventListener('click',() => {
    lang=button.dataset.lang;
    try {localStorage.setItem('ic-language',lang);} catch {}
    updateUrl();translate();
  }));
  $('#menu-toggle')?.addEventListener('click',() => {
    const open=$('#nav').classList.toggle('open');$('#menu-toggle').setAttribute('aria-expanded',String(open));
  });
  document.addEventListener('keydown',event => {if(event.key==='Escape'){$('#nav').classList.remove('open');$('#menu-toggle').setAttribute('aria-expanded','false');}});
  const years = [...new Set(rows.map(r=>r.year))].sort((a,b)=>b-a);
  if ($('#year')) {
    years.forEach(year=>{const opt=document.createElement('option');opt.value=year;opt.textContent=year;$('#year').append(opt);});
    if(years.includes(Number(params.get('year')))) $('#year').value=params.get('year');
    $('#search').value=params.get('q') ?? '';
    if(['new','old','title','type'].includes(params.get('sort'))) $('#sort').value=params.get('sort');
  }
  function updateUrl() {
    const url=new URL(location.href);url.searchParams.set('lang',lang);
    if ($('#publication-list')) {
      url.searchParams.delete('page');
      const state={q:$('#search').value.trim(),year:$('#year').value,type,sort:$('#sort').value};
      Object.entries(state).forEach(([key,value])=>{if(!value||value==='all'||value==='new')url.searchParams.delete(key);else url.searchParams.set(key,value);});
    }
    try {history.replaceState(null,'',url);} catch {}
  }
  function renderPublications() {
    const target=$('#publication-list');if(!target)return;
    const query=normalize($('#search').value).split(' ').filter(Boolean),year=$('#year').value,sort=$('#sort').value;
    const selected=rows.filter(r=>(type==='all'||r.type===type)&&(year==='all'||String(r.year)===year)&&query.every(word=>normalize(`${r.title} ${r.authors} ${r.journal} ${r.doi} ${r.year}`).includes(word)));
    const alpha=(a,b)=>a.title.localeCompare(b.title,'en');
    selected.sort((a,b)=>sort==='title'?alpha(a,b):sort==='old'?a.year-b.year||alpha(a,b):sort==='type'?(a.type==='review'?0:1)-(b.type==='review'?0:1)||b.year-a.year||alpha(a,b):b.year-a.year||alpha(a,b));
    target.innerHTML=selected.map(r=>`<article class="publication"><span class="publication-year">${r.year}</span><div><h2><a href="${r.doi?'https://doi.org/'+esc(r.doi):'https://scholar.google.com/scholar?q='+encodeURIComponent(r.title)}" target="_blank" rel="noopener noreferrer">${esc(r.title)}</a></h2><div class="pub-meta"><span class="type-label">${words[lang][r.type]}</span>${esc(r.journal)}${r.volume?' · '+esc(r.volume):''}${r.pages?' · '+esc(r.pages):''}</div><details><summary>${words[lang].authors}</summary><p>${esc(r.authors)}</p></details></div><div class="pub-actions">${r.doi?`<a class="text-link" href="https://doi.org/${esc(r.doi)}" target="_blank" rel="noopener noreferrer">DOI </a><button class="copy-doi" data-doi="${esc(r.doi)}">${words[lang].copy}</button>`:`<a href="https://scholar.google.com/scholar?q=${encodeURIComponent(r.title)}" target="_blank" rel="noopener noreferrer">Scholar</a>`}</div></article>`).join('');
    $('#result-count').textContent=`${words[lang].count}: ${selected.length} / ${rows.length}`;
    $('#empty').hidden=selected.length>0;
    all('[data-type]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.type===type)));
  }
  $('#publication-list')?.addEventListener('click',async event=>{
    const button=event.target.closest('[data-doi]');if(!button)return;
    try {await navigator.clipboard.writeText(button.dataset.doi);button.textContent=words[lang].copied;}
    catch {button.textContent=words[lang].failed+button.dataset.doi;}
  });
  all('[data-type]').forEach(b=>b.addEventListener('click',()=>{type=b.dataset.type;renderPublications();updateUrl();}));
  ['search','year','sort'].forEach(id=>$('#'+id)?.addEventListener(id==='search'?'input':'change',()=>{renderPublications();updateUrl();}));
  $('#reset')?.addEventListener('click',()=>{$('#search').value='';$('#year').value='all';$('#sort').value='new';type='all';renderPublications();updateUrl();$('#search').focus();});
  translate();
})();
