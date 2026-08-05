(()=>{
'use strict';
const EPKEY='minhaMarvel.episodes.v5',PLANKEY='minhaMarvel.smartPlan.v2';
let catalog={};
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const fmt=m=>{m=Math.max(0,Math.round(Number(m)||0));return `${Math.floor(m/60)}h${m%60?String(m%60).padStart(2,'0'):''}`};
const today=()=>{const d=new Date();d.setHours(12,0,0,0);return d};
const epState=()=>{try{return JSON.parse(localStorage.getItem(EPKEY)||'{"done":{}}')}catch(e){return{done:{}}}};
async function loadCatalog(){try{const r=await fetch(`episodes-data.json?a=${Date.now()}`,{cache:'no-store'});if(r.ok)catalog=await r.json()}catch(e){}}
function canonicalContent(item){const m=(window.META||{})[item.id]||{};return `content:${item.media||item.kind}:${m.tmdbId||m.id||item.query||item.title}:${item.year||''}`}
function units(){
 const eps=epState().done||{},map=new Map(),duplicates=[];
 for(const item of (window.ITEMS||window.MARVEL_ITEMS||[])){
  if(item.status==='upcoming')continue;
  const entry=catalog[item.id],seasons=entry?.seasons||[],all=seasons.flatMap(s=>(s.episodes||[]).map(ep=>({s,ep})));
  if(all.length){
   const fallback=Math.max(1,Math.round((Number(item.minutes)||0)/all.length));
   for(const {s,ep} of all){
    const localKey=`${item.id}:s${s.seasonNumber}:e${ep.episodeNumber}`;
    const canonical=`episode:${entry.tmdbId||item.query||item.title}:s${s.seasonNumber}:e${ep.episodeNumber}`;
    const u={canonical,key:localKey,itemId:item.id,title:item.title,label:`S${String(s.seasonNumber).padStart(2,'0')}E${String(ep.episodeNumber).padStart(2,'0')} · ${ep.name||`Episódio ${ep.episodeNumber}`}`,minutes:Number(ep.runtime)||fallback,done:!!eps[localKey],kind:'episode'};
    if(map.has(canonical)){const old=map.get(canonical);old.done=old.done||u.done;duplicates.push(u);continue}map.set(canonical,u);
   }
  }else{
   const canonical=canonicalContent(item),u={canonical,key:item.id,itemId:item.id,title:item.title,label:item.kind||'Produção',minutes:Number(item.minutes)||0,done:!!window.S?.done?.[item.id],kind:'content'};
   if(map.has(canonical)){const old=map.get(canonical);old.done=old.done||u.done;duplicates.push(u);continue}map.set(canonical,u);
  }
 }
 return{all:[...map.values()].filter(u=>u.minutes>0),duplicates};
}
function metrics(){
 const built=units(),all=built.all,total=all.reduce((a,u)=>a+u.minutes,0),watched=all.filter(u=>u.done).reduce((a,u)=>a+u.minutes,0),remaining=all.filter(u=>!u.done),start=today(),target=new Date(((window.S?.target)||'2026-12-17')+'T12:00:00'),daysLeft=Math.max(1,Math.floor((target-start)/86400000)+1),left=Math.max(0,total-watched),pace=Math.ceil(left/daysLeft);
 return{all,total,watched,remaining,left,pace,start,target,daysLeft,duplicates:built.duplicates,episodes:all.filter(u=>u.kind==='episode').length,episodesLeft:remaining.filter(u=>u.kind==='episode').length,contents:all.filter(u=>u.kind==='content').length};
}
function baseline(m){let b;try{b=JSON.parse(localStorage.getItem(PLANKEY)||'null')}catch(e){}const sig=`${window.S?.target}|${m.total}`;if(!b||b.sig!==sig){b={sig,start:m.start.toISOString().slice(0,10),baseWatched:m.watched,total:m.total};localStorage.setItem(PLANKEY,JSON.stringify(b))}return b}
function rhythm(m){const b=baseline(m),start=new Date(b.start+'T12:00:00'),elapsed=Math.max(0,Math.floor((m.start-start)/86400000)),totalDays=Math.max(1,Math.floor((m.target-start)/86400000)+1),ideal=(b.total-b.baseWatched)/totalDays,expected=b.baseWatched+ideal*elapsed,delta=m.watched-expected,dayDelta=ideal?delta/ideal:0;if(dayDelta>=.75)return{class:'ahead',icon:'🟢',title:`${Math.floor(dayDelta)} dia${Math.floor(dayDelta)===1?'':'s'} adiantado`,detail:`Sua média necessária caiu para ${fmt(m.pace)} por dia.`};if(dayDelta<=-.75)return{class:'late',icon:'🔴',title:`${Math.abs(Math.ceil(dayDelta))} dia${Math.abs(Math.ceil(dayDelta))===1?'':'s'} atrasado`,detail:`Para recuperar, a média atual é ${fmt(m.pace)} por dia.`};return{class:'ok',icon:'🟡',title:'No cronograma',detail:`Mantenha em média ${fmt(m.pace)} por dia até a data-alvo.`}}
function buildPlan(m){const days=[];for(let i=0;i<m.daysLeft;i++){const d=new Date(m.start);d.setDate(d.getDate()+i);days.push({date:d,minutes:0,items:[]})}let di=0;for(const u of m.remaining){if(di>=days.length)di=days.length-1;let d=days[di];if(d.items.length&&d.minutes+u.minutes>Math.max(1,m.pace)&&di<days.length-1)d=days[++di];d.items.push(u);d.minutes+=u.minutes}return days.filter(d=>d.items.length)}
function removeLegacy(){document.querySelectorAll('#dashboard>*').forEach(el=>{if(el.id==='smartRhythmCard'||el.classList.contains('metrics'))return;const t=(el.textContent||'').toLowerCase();if(t.includes('atrás do ritmo ideal')||t.includes('adiantado do ritmo ideal'))el.style.display='none'})}
function renderSummary(){
 const m=metrics(),r=rhythm(m);removeLegacy();
 const watched=document.querySelector('#watched'),remaining=document.querySelector('#remaining'),pace=document.querySelector('#pace');
 if(watched)watched.textContent=fmt(m.watched);if(remaining)remaining.textContent=fmt(m.left);if(pace)pace.textContent=`${fmt(m.pace)}/dia`;
 let card=document.querySelector('#smartRhythmCard');if(!card){card=document.createElement('section');card.id='smartRhythmCard';card.className='smartRhythmCard';document.querySelector('#dashboard .metrics')?.insertAdjacentElement('afterend',card)}
 if(card)card.innerHTML=`<div class="smartRhythmTop"><span>${r.icon}</span><div><small>RITMO ADAPTATIVO</small><h3>${r.title}</h3><p>${r.detail} Cada episódio marcado reduz automaticamente o tempo restante; a cada novo dia sem progresso, a média é recalculada.</p></div></div><button class="auditToggle" type="button">Ver auditoria do cálculo</button><div class="auditPanel" hidden><div><b>${fmt(m.total)}</b><span>catálogo auditado</span></div><div><b>${fmt(m.watched)}</b><span>já assistido</span></div><div><b>${fmt(m.left)}</b><span>tempo restante</span></div><div><b>${m.all.length}</b><span>unidades únicas</span></div><div><b>${m.episodesLeft}</b><span>episódios pendentes</span></div><div><b>${m.duplicates.length}</b><span>duplicidades ignoradas</span></div></div>`;
 card.querySelector('.auditToggle').onclick=()=>{const p=card.querySelector('.auditPanel');p.hidden=!p.hidden};
}
function smartRenderCalendar(){const el=document.querySelector('#calendarList');if(!el)return;const m=metrics(),plan=buildPlan(m),r=rhythm(m);el.innerHTML=`<div class="smartCalendarStatus ${r.class}"><b>${r.icon} ${r.title}</b><span>${fmt(m.left)} restantes · média dinâmica de ${fmt(m.pace)} por dia</span></div>`+plan.map((d,i)=>`<section class="smartDay ${i===0?'today':''}"><header><div><small>${i===0?'HOJE':d.date.toLocaleDateString('pt-BR',{weekday:'long'}).toUpperCase()}</small><h3>${d.date.toLocaleDateString('pt-BR',{day:'2-digit',month:'long'})}</h3></div><b>${fmt(d.minutes)}</b></header>${d.items.map(u=>`<div class="smartItem"><div><strong>${esc(u.title)}</strong><span>${esc(u.label)}</span></div><b>${fmt(u.minutes)}</b></div>`).join('')}</section>`).join('')}
function refresh(){renderSummary();smartRenderCalendar()}
const style=document.createElement('style');style.textContent=`.smartRhythmCard{margin:14px 0 22px;padding:18px;border-radius:22px;background:linear-gradient(145deg,#171c27,#0d1017);border:1px solid #ffffff12}.smartRhythmTop{display:flex;gap:13px}.smartRhythmTop>span{font-size:26px}.smartRhythmTop small{font-size:9px;letter-spacing:1.4px;color:#929baa}.smartRhythmTop h3{margin:4px 0;font-size:18px}.smartRhythmTop p{margin:0;color:#aab2bf;font-size:12px;line-height:1.5}.auditToggle{margin-top:14px;border:0;background:transparent;color:var(--gold);font-size:11px;font-weight:800;padding:0}.auditPanel{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:13px}.auditPanel[hidden]{display:none}.auditPanel div{padding:11px;border-radius:13px;background:#ffffff08}.auditPanel b,.auditPanel span{display:block}.auditPanel b{font-size:15px}.auditPanel span{font-size:9px;color:#929baa;margin-top:3px}.smartCalendarStatus{padding:15px;border-radius:17px;margin-bottom:14px;background:#171c27;border:1px solid #ffffff12}.smartCalendarStatus b,.smartCalendarStatus span{display:block}.smartCalendarStatus span{font-size:11px;color:#aab2bf;margin-top:5px}.smartCalendarStatus.ahead{border-color:#2ecc7155}.smartCalendarStatus.late{border-color:#ff4d5e66}.smartDay{border:1px solid #ffffff10;border-radius:19px;overflow:hidden;margin-bottom:14px;background:#10141c}.smartDay.today{box-shadow:0 0 0 1px var(--gold),0 12px 35px #0005}.smartDay header{display:flex;justify-content:space-between;align-items:center;padding:14px 15px;background:#171c27}.smartDay header small{font-size:9px;color:var(--gold);letter-spacing:1.2px}.smartDay header h3{margin:3px 0 0;font-size:15px;text-transform:capitalize}.smartItem{display:flex;justify-content:space-between;gap:12px;padding:13px 15px;border-top:1px solid #ffffff0c}.smartItem strong,.smartItem span{display:block}.smartItem strong{font-size:12px}.smartItem span{font-size:10px;color:#929baa;margin-top:4px}.smartItem>b{font-size:11px;white-space:nowrap;color:var(--gold)}`;document.head.appendChild(style);
loadCatalog().then(()=>{try{window.renderCalendar=smartRenderCalendar}catch(e){}refresh();new MutationObserver(()=>setTimeout(refresh,80)).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});document.addEventListener('click',e=>{if(e.target.closest('[data-v7ep],[data-done],#toggleDone,#v7Done,#saveSettings'))setTimeout(refresh,140)},true)});
window.__SMART_CALENDAR__={refresh,metrics,units};
})();