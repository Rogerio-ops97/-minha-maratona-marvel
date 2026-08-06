(()=>{
'use strict';
const EPKEY='minhaMarvel.episodes.v5';
const PLANKEY='minhaMarvel.smartPlan.v3';
let catalog={};
let refreshTimer=null;

const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]));
const fmt=m=>{m=Math.max(0,Math.round(Number(m)||0));return `${Math.floor(m/60)}h${m%60?String(m%60).padStart(2,'0'):''}`};
const today=()=>{const d=new Date();d.setHours(12,0,0,0);return d};
const epState=()=>{try{return JSON.parse(localStorage.getItem(EPKEY)||'{"done":{}}')}catch(e){return{done:{}}}};

async function loadCatalog(){
 try{const r=await fetch(`episodes-data.json?smart=${Date.now()}`,{cache:'no-store'});if(r.ok)catalog=await r.json()}catch(e){console.warn('Calendário: falha ao carregar episódios',e)}
}
function sourceItems(){return window.ITEMS||window.MARVEL_ITEMS||[]}
function canonicalContent(item){const meta=(window.META||{})[item.id]||{};return `content:${item.media||item.kind||''}:${meta.tmdbId||meta.id||item.query||item.title}:${item.year||''}`}

function units(){
 const eps=epState().done||{},map=new Map(),duplicates=[];
 for(const item of sourceItems()){
  if(item.status==='upcoming')continue;
  const entry=catalog[item.id];
  const all=(entry?.seasons||[]).flatMap(season=>(season.episodes||[]).map(ep=>({season,ep})));
  if(all.length){
   const fallback=Math.max(1,Math.round((Number(item.minutes)||0)/all.length));
   for(const {season,ep} of all){
    const localKey=`${item.id}:s${season.seasonNumber}:e${ep.episodeNumber}`;
    const canonical=`episode:${entry.tmdbId||item.query||item.title}:s${season.seasonNumber}:e${ep.episodeNumber}`;
    const unit={canonical,key:localKey,itemId:item.id,title:item.title,label:`S${String(season.seasonNumber).padStart(2,'0')}E${String(ep.episodeNumber).padStart(2,'0')} · ${ep.name||`Episódio ${ep.episodeNumber}`}`,minutes:Number(ep.runtime)||fallback,done:!!eps[localKey],kind:'episode'};
    if(map.has(canonical)){const kept=map.get(canonical);kept.done=kept.done||unit.done;duplicates.push(unit)}else map.set(canonical,unit);
   }
  }else{
   const canonical=canonicalContent(item);
   const unit={canonical,key:item.id,itemId:item.id,title:item.title,label:item.kind||'Produção',minutes:Number(item.minutes)||0,done:!!window.S?.done?.[item.id],kind:'content'};
   if(map.has(canonical)){const kept=map.get(canonical);kept.done=kept.done||unit.done;duplicates.push(unit)}else map.set(canonical,unit);
  }
 }
 return{all:[...map.values()].filter(u=>u.minutes>0),duplicates};
}

function metrics(){
 const built=units(),all=built.all;
 const total=all.reduce((sum,u)=>sum+u.minutes,0);
 const watched=all.filter(u=>u.done).reduce((sum,u)=>sum+u.minutes,0);
 const remaining=all.filter(u=>!u.done);
 const start=today(),target=new Date(((window.S?.target)||'2026-12-17')+'T12:00:00');
 const daysLeft=Math.max(1,Math.floor((target-start)/86400000)+1);
 const left=Math.max(0,total-watched),pace=Math.ceil(left/daysLeft);
 const progress=total?Math.min(100,Math.max(0,watched/total*100)):0;
 return{all,total,watched,remaining,left,pace,start,target,daysLeft,progress,duplicates:built.duplicates,episodesLeft:remaining.filter(u=>u.kind==='episode').length};
}

function baseline(m){
 let b;try{b=JSON.parse(localStorage.getItem(PLANKEY)||'null')}catch(e){}
 const sig=`${window.S?.target||'2026-12-17'}|${m.total}`;
 if(!b||b.sig!==sig){b={sig,start:m.start.toISOString().slice(0,10),baseWatched:m.watched,total:m.total,initialPace:m.pace};localStorage.setItem(PLANKEY,JSON.stringify(b))}
 return b;
}
function rhythm(m){
 const b=baseline(m),start=new Date(b.start+'T12:00:00');
 const elapsed=Math.max(0,Math.floor((m.start-start)/86400000));
 const totalDays=Math.max(1,Math.floor((m.target-start)/86400000)+1);
 const ideal=(b.total-b.baseWatched)/totalDays;
 const expected=b.baseWatched+ideal*elapsed;
 const delta=m.watched-expected,dayDelta=ideal?delta/ideal:0;
 if(dayDelta>=.75)return{class:'ahead',icon:'🟢',title:`${Math.floor(dayDelta)} dia${Math.floor(dayDelta)===1?'':'s'} adiantado`,detail:`Você acumulou ${fmt(delta)} além do ritmo-base.`};
 if(dayDelta<=-.75)return{class:'late',icon:'🔴',title:`${Math.abs(Math.ceil(dayDelta))} dia${Math.abs(Math.ceil(dayDelta))===1?'':'s'} atrasado`,detail:`Faltam ${fmt(Math.abs(delta))} para recuperar o ritmo-base.`};
 return{class:'ok',icon:'🟡',title:'No cronograma',detail:'Seu progresso está compatível com a data-alvo.'};
}
function buildPlan(m){
 const days=[];for(let i=0;i<m.daysLeft;i++){const d=new Date(m.start);d.setDate(d.getDate()+i);days.push({date:d,minutes:0,items:[]})}
 let di=0;for(const u of m.remaining){if(di>=days.length)di=days.length-1;let d=days[di];if(d.items.length&&d.minutes+u.minutes>Math.max(1,m.pace)&&di<days.length-1)d=days[++di];d.items.push(u);d.minutes+=u.minutes}
 return days.filter(d=>d.items.length);
}

function hideLegacyStatus(){
 const dashboard=document.querySelector('#dashboard');if(!dashboard)return;
 const candidates=[...dashboard.querySelectorAll('section,article,div')];
 for(const el of candidates){
  if(el.id==='smartRhythmCard'||el.closest('#smartRhythmCard')||el.classList.contains('metrics')||el.closest('.metrics'))continue;
  const text=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
  const legacy=(text.includes('você está atrasado')||text.includes('você está adiantado'))&&text.includes('ritmo ideal');
  if(!legacy)continue;
  let target=el;
  while(target.parentElement&&target.parentElement!==dashboard)target=target.parentElement;
  target.style.display='none';
 }
}
function updateProgress(m){
 const display=m.progress<10?m.progress.toFixed(1):Math.round(m.progress).toString();
 const pctEl=document.querySelector('#pct');if(pctEl)pctEl.textContent=`${display}%`;
 const ring=document.querySelector('#ring');if(ring)ring.style.background=`conic-gradient(var(--theme-accent-2,#65d0ff) ${m.progress*3.6}deg,#2b303b 0deg)`;
}

function renderSummary(){
 const m=metrics(),r=rhythm(m);hideLegacyStatus();updateProgress(m);
 const watched=document.querySelector('#watched'),remaining=document.querySelector('#remaining'),pace=document.querySelector('#pace');
 if(watched)watched.textContent=fmt(m.watched);if(remaining)remaining.textContent=fmt(m.left);if(pace)pace.textContent=`${fmt(m.pace)}/dia`;
 let card=document.querySelector('#smartRhythmCard');
 if(!card){card=document.createElement('section');card.id='smartRhythmCard';card.className='smartRhythmCard';document.querySelector('#dashboard .metrics')?.insertAdjacentElement('afterend',card)}
 if(card)card.innerHTML=`<div class="smartRhythmTop"><span>${r.icon}</span><div><small>RITMO ADAPTATIVO</small><h3>${r.title}</h3><p>${r.detail}</p></div></div><div class="smartRhythmLine"><b>${m.progress.toFixed(1)}%</b><span>do tempo total concluído</span><i></i><b>${fmt(m.pace)}/dia</b><span>média atual até 17/12</span></div><p class="smartRule">Marcar qualquer episódio ou filme sempre reduz a meta no mesmo dia. Ela só aumenta quando os dias passam sem progresso suficiente.</p><button class="auditToggle" type="button">Detalhes do cálculo</button><div class="auditPanel" hidden><div><b>${fmt(m.total)}</b><span>tempo total auditado</span></div><div><b>${fmt(m.watched)}</b><span>tempo assistido</span></div><div><b>${fmt(m.left)}</b><span>tempo restante</span></div><div><b>${m.daysLeft}</b><span>dias restantes</span></div><div><b>${m.episodesLeft}</b><span>episódios pendentes</span></div><div><b>${m.duplicates.length}</b><span>duplicidades ignoradas</span></div></div>`;
 const btn=card?.querySelector('.auditToggle');if(btn)btn.onclick=()=>{const p=card.querySelector('.auditPanel');p.hidden=!p.hidden};
}
function smartRenderCalendar(){
 const el=document.querySelector('#calendarList');if(!el)return;
 const m=metrics(),plan=buildPlan(m),r=rhythm(m);
 el.innerHTML=`<div class="smartCalendarStatus ${r.class}"><b>${r.icon} ${r.title}</b><span>${fmt(m.left)} restantes · média dinâmica de ${fmt(m.pace)} por dia</span></div>`+plan.map((d,i)=>`<section class="smartDay ${i===0?'today':''}"><header><div><small>${i===0?'HOJE':d.date.toLocaleDateString('pt-BR',{weekday:'long'}).toUpperCase()}</small><h3>${d.date.toLocaleDateString('pt-BR',{day:'2-digit',month:'long'})}</h3></div><b>${fmt(d.minutes)}</b></header>${d.items.map(u=>`<div class="smartItem"><div><strong>${esc(u.title)}</strong><span>${esc(u.label)}</span></div><b>${fmt(u.minutes)}</b></div>`).join('')}</section>`).join('');
}
function refresh(){renderSummary();smartRenderCalendar()}
function scheduleRefresh(delay=120){clearTimeout(refreshTimer);refreshTimer=setTimeout(refresh,delay)}

const style=document.createElement('style');
style.textContent=`.smartRhythmCard{margin:14px 0 22px;padding:18px;border-radius:22px;background:linear-gradient(145deg,#171c27,#0d1017);border:1px solid #ffffff12}.smartRhythmTop{display:flex;gap:13px}.smartRhythmTop>span{font-size:26px}.smartRhythmTop small{font-size:9px;letter-spacing:1.4px;color:#929baa}.smartRhythmTop h3{margin:4px 0;font-size:18px}.smartRhythmTop p{margin:0;color:#aab2bf;font-size:12px;line-height:1.5}.smartRhythmLine{display:grid;grid-template-columns:auto 1fr 1px auto 1fr;align-items:center;gap:8px;margin-top:14px;padding:12px;border-radius:14px;background:#ffffff08}.smartRhythmLine b{font-size:15px}.smartRhythmLine span{font-size:9px;color:#929baa}.smartRhythmLine i{height:28px;background:#ffffff12}.smartRule{margin:12px 0 0;color:#8f98a8;font-size:10px;line-height:1.45}.auditToggle{margin-top:12px;border:0;background:transparent;color:var(--gold);font-size:11px;font-weight:800;padding:0}.auditPanel{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:13px}.auditPanel[hidden]{display:none}.auditPanel div{padding:11px;border-radius:13px;background:#ffffff08}.auditPanel b,.auditPanel span{display:block}.auditPanel b{font-size:15px}.auditPanel span{font-size:9px;color:#929baa;margin-top:3px}.smartCalendarStatus{padding:15px;border-radius:17px;margin-bottom:14px;background:#171c27;border:1px solid #ffffff12}.smartCalendarStatus b,.smartCalendarStatus span{display:block}.smartCalendarStatus span{font-size:11px;color:#aab2bf;margin-top:5px}.smartCalendarStatus.ahead{border-color:#2ecc7155}.smartCalendarStatus.late{border-color:#ff4d5e66}.smartDay{border:1px solid #ffffff10;border-radius:19px;overflow:hidden;margin-bottom:14px;background:#10141c}.smartDay.today{box-shadow:0 0 0 1px var(--gold),0 12px 35px #0005}.smartDay header{display:flex;justify-content:space-between;align-items:center;padding:14px 15px;background:#171c27}.smartDay header small{font-size:9px;color:var(--gold);letter-spacing:1.2px}.smartDay header h3{margin:3px 0 0;font-size:15px;text-transform:capitalize}.smartItem{display:flex;justify-content:space-between;gap:12px;padding:13px 15px;border-top:1px solid #ffffff0c}.smartItem strong,.smartItem span{display:block}.smartItem strong{font-size:12px}.smartItem span{font-size:10px;color:#929baa;margin-top:4px}.smartItem>b{font-size:11px;white-space:nowrap;color:var(--gold)}@media(max-width:430px){.smartRhythmLine{grid-template-columns:auto 1fr}.smartRhythmLine i{display:none}}`;
document.head.appendChild(style);

loadCatalog().then(()=>{
 refresh();
 document.addEventListener('click',e=>{if(e.target.closest('.episodeCardV5,[data-season-all],#markAllEpisodesV5,[data-v7ep],[data-done],#toggleDone,#v7Done,#saveSettings'))scheduleRefresh(180)},true);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)scheduleRefresh(50)});
 new MutationObserver(()=>scheduleRefresh(80)).observe(document.querySelector('#dashboard')||document.body,{subtree:true,childList:true});
 setInterval(()=>scheduleRefresh(0),60000);
});
window.__SMART_CALENDAR__={refresh,metrics,units};
})();