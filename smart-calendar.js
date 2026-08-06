(()=>{
'use strict';
const APPKEY='minhaMarvel.v2';
const EPKEY='minhaMarvel.episodes.v5';
const PLANKEY='minhaMarvel.smartPlan.v4';
let catalog={};
let refreshTimer=null;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const fmt=m=>{m=Math.max(0,Math.round(Number(m)||0));return `${Math.floor(m/60)}h${m%60?String(m%60).padStart(2,'0'):''}`};
const today=()=>{const d=new Date();d.setHours(12,0,0,0);return d};
const readJSON=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch(e){return fallback}};
const appState=()=>readJSON(APPKEY,{done:{},target:'2026-12-17'});
const epState=()=>readJSON(EPKEY,{done:{}});
async function loadCatalog(){try{const r=await fetch(`episodes-data.json?smart=${Date.now()}`,{cache:'no-store'});if(r.ok)catalog=await r.json()}catch(e){console.warn('Calendário: falha ao carregar episódios',e)}}
function sourceItems(){return window.ITEMS||window.MARVEL_ITEMS||[]}
function canonicalContent(item){const meta=(window.META||{})[item.id]||{};return `content:${item.media||item.kind||''}:${meta.tmdbId||meta.id||item.query||item.title}:${item.year||''}`}
function units(){
 const app=appState(),eps=epState().done||{},map=new Map(),duplicates=[];
 for(const item of sourceItems()){
  if(item.status==='upcoming')continue;
  const entry=catalog[item.id],episodes=(entry?.seasons||[]).flatMap(season=>(season.episodes||[]).map(ep=>({season,ep})));
  if(episodes.length){
   const fallback=Math.max(1,Math.round((Number(item.minutes)||0)/episodes.length));
   for(const {season,ep} of episodes){
    const localKey=`${item.id}:s${season.seasonNumber}:e${ep.episodeNumber}`;
    const canonical=`episode:${entry.tmdbId||item.query||item.title}:s${season.seasonNumber}:e${ep.episodeNumber}`;
    const unit={canonical,key:localKey,itemId:item.id,title:item.title,label:`S${String(season.seasonNumber).padStart(2,'0')}E${String(ep.episodeNumber).padStart(2,'0')} · ${ep.name||`Episódio ${ep.episodeNumber}`}`,minutes:Number(ep.runtime)||fallback,done:!!eps[localKey],kind:'episode'};
    if(map.has(canonical)){const kept=map.get(canonical);kept.done=kept.done||unit.done;duplicates.push(unit)}else map.set(canonical,unit);
   }
  }else{
   const canonical=canonicalContent(item),unit={canonical,key:item.id,itemId:item.id,title:item.title,label:item.kind||'Produção',minutes:Number(item.minutes)||0,done:!!app.done?.[item.id],kind:'content'};
   if(map.has(canonical)){const kept=map.get(canonical);kept.done=kept.done||unit.done;duplicates.push(unit)}else map.set(canonical,unit);
  }
 }
 return{all:[...map.values()].filter(u=>u.minutes>0),duplicates};
}
function metrics(){
 const built=units(),all=built.all,total=all.reduce((s,u)=>s+u.minutes,0),watched=all.filter(u=>u.done).reduce((s,u)=>s+u.minutes,0),remaining=all.filter(u=>!u.done),app=appState(),start=today(),target=new Date((app.target||'2026-12-17')+'T12:00:00');
 const daysLeft=Math.max(1,Math.floor((target-start)/86400000)+1),left=Math.max(0,total-watched),pace=Math.ceil(left/daysLeft),progress=total?watched/total*100:0;
 return{all,total,watched,remaining,left,pace,start,target,daysLeft,progress,duplicates:built.duplicates,episodesLeft:remaining.filter(u=>u.kind==='episode').length};
}
function baseline(m){let b=readJSON(PLANKEY,null);const app=appState(),sig=`${app.target||'2026-12-17'}|${m.total}`;if(!b||b.sig!==sig){b={sig,start:m.start.toISOString().slice(0,10),baseWatched:m.watched,total:m.total};localStorage.setItem(PLANKEY,JSON.stringify(b))}return b}
function rhythm(m){
 const b=baseline(m),start=new Date(b.start+'T12:00:00'),elapsed=Math.max(0,Math.floor((m.start-start)/86400000)),totalDays=Math.max(1,Math.floor((m.target-start)/86400000)+1),ideal=(b.total-b.baseWatched)/totalDays,expected=b.baseWatched+ideal*elapsed,delta=m.watched-expected,dayDelta=ideal?delta/ideal:0;
 if(dayDelta>=.75)return{state:'ahead',title:`Você está ${Math.max(1,Math.floor(dayDelta))} dia${Math.floor(dayDelta)===1?'':'s'} adiantado`,detail:`Média atual: ${fmt(m.pace)} por dia.`};
 if(dayDelta<=-.75)return{state:'late',title:'Você está atrasado',detail:`Média necessária agora: ${fmt(m.pace)} por dia.`};
 return{state:'ok',title:'Você está no ritmo',detail:`Mantenha a média de ${fmt(m.pace)} por dia.`};
}
function buildPlan(m){const days=[];for(let i=0;i<m.daysLeft;i++){const d=new Date(m.start);d.setDate(d.getDate()+i);days.push({date:d,minutes:0,items:[]})}let di=0;for(const u of m.remaining){if(di>=days.length)di=days.length-1;let d=days[di];if(d.items.length&&d.minutes+u.minutes>Math.max(1,m.pace)&&di<days.length-1)d=days[++di];d.items.push(u);d.minutes+=u.minutes}return days.filter(d=>d.items.length)}
function findStatusCard(){const dashboard=document.querySelector('#dashboard');if(!dashboard)return null;return [...dashboard.children].find(el=>{const t=(el.textContent||'').toLowerCase();return t.includes('você está no ritmo')||t.includes('você está atrasado')||t.includes('você está adiantado')||t.includes('ritmo ideal')})||null}
function updateStatus(r){
 document.querySelector('#smartRhythmCard')?.remove();const card=findStatusCard();if(!card)return;
 const heads=card.querySelectorAll('h2,h3,b,strong'),title=[...heads].find(x=>(x.textContent||'').toLowerCase().includes('você está'))||heads[0];if(title)title.textContent=r.title;
 const texts=card.querySelectorAll('p,span'),detail=[...texts].find(x=>/ritmo|atualizado|cronograma|média/i.test(x.textContent||''));if(detail)detail.textContent=r.detail;card.dataset.paceState=r.state;
}
function updateProgress(m){const pct=Math.round(m.progress*10)/10,pctEl=document.querySelector('#pct');if(pctEl)pctEl.textContent=`${pct.toLocaleString('pt-BR',{minimumFractionDigits:pct<10?1:0,maximumFractionDigits:1})}%`;const ring=document.querySelector('#ring');if(ring)ring.style.background=`conic-gradient(var(--theme-accent-2,#65d0ff) ${m.progress*3.6}deg,#2b303b 0deg)`}
function renderSummary(){const m=metrics(),r=rhythm(m);updateProgress(m);updateStatus(r);const watched=document.querySelector('#watched'),remaining=document.querySelector('#remaining'),pace=document.querySelector('#pace');if(watched)watched.textContent=fmt(m.watched);if(remaining)remaining.textContent=fmt(m.left);if(pace)pace.textContent=`${fmt(m.pace)}/dia`}
function smartRenderCalendar(){const el=document.querySelector('#calendarList');if(!el)return;const m=metrics(),plan=buildPlan(m),r=rhythm(m);el.innerHTML=`<div class="smartCalendarStatus ${r.state}"><b>${esc(r.title)}</b><span>${fmt(m.left)} restantes · média dinâmica de ${fmt(m.pace)} por dia</span></div>`+plan.map((d,i)=>`<section class="smartDay ${i===0?'today':''}"><header><div><small>${i===0?'HOJE':d.date.toLocaleDateString('pt-BR',{weekday:'long'}).toUpperCase()}</small><h3>${d.date.toLocaleDateString('pt-BR',{day:'2-digit',month:'long'})}</h3></div><b>${fmt(d.minutes)}</b></header>${d.items.map(u=>`<div class="smartItem"><div><strong>${esc(u.title)}</strong><span>${esc(u.label)}</span></div><b>${fmt(u.minutes)}</b></div>`).join('')}</section>`).join('')}
function refresh(){renderSummary();smartRenderCalendar()}
function scheduleRefresh(delay=120){clearTimeout(refreshTimer);refreshTimer=setTimeout(refresh,delay)}
const style=document.createElement('style');style.textContent=`.smartCalendarStatus{padding:15px;border-radius:17px;margin-bottom:14px;background:#171c27;border:1px solid #ffffff12}.smartCalendarStatus b,.smartCalendarStatus span{display:block}.smartCalendarStatus span{font-size:11px;color:#aab2bf;margin-top:5px}.smartCalendarStatus.ahead{border-color:#2ecc7155}.smartCalendarStatus.late{border-color:#ff4d5e66}.smartDay{border:1px solid #ffffff10;border-radius:19px;overflow:hidden;margin-bottom:14px;background:#10141c}.smartDay.today{box-shadow:0 0 0 1px var(--gold),0 12px 35px #0005}.smartDay header{display:flex;justify-content:space-between;align-items:center;padding:14px 15px;background:#171c27}.smartDay header small{font-size:9px;color:var(--gold);letter-spacing:1.2px}.smartDay header h3{margin:3px 0 0;font-size:15px;text-transform:capitalize}.smartItem{display:flex;justify-content:space-between;gap:12px;padding:13px 15px;border-top:1px solid #ffffff0c}.smartItem strong,.smartItem span{display:block}.smartItem strong{font-size:12px}.smartItem span{font-size:10px;color:#929baa;margin-top:4px}.smartItem>b{font-size:11px;white-space:nowrap;color:var(--gold)}`;document.head.appendChild(style);
loadCatalog().then(()=>{refresh();document.addEventListener('click',e=>{if(e.target.closest('.episodeCardV5,[data-season-all],#markAllEpisodesV5,[data-v7ep],[data-done],#toggleDone,#v7Done,#saveSettings'))scheduleRefresh(220)},true);window.addEventListener('storage',scheduleRefresh);document.addEventListener('visibilitychange',()=>{if(!document.hidden)scheduleRefresh(50)});setInterval(()=>scheduleRefresh(0),60000)});
window.__SMART_CALENDAR__={refresh,metrics,units};
})();