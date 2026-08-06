(()=>{
'use strict';
const EPKEY='minhaMarvel.episodes.v5';
const PLANKEY='minhaMarvel.smartPlan.v1';
let catalog={};
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const fmt=m=>`${Math.floor(m/60)}h${m%60?String(m%60).padStart(2,'0'):''}`;
const dayKey=d=>d.toISOString().slice(0,10);
const today=()=>{const d=new Date();d.setHours(12,0,0,0);return d};
const epState=()=>JSON.parse(localStorage.getItem(EPKEY)||'{"done":{}}');

async function loadCatalog(){
 try{const r=await fetch(`episodes-data.json?smart=${Date.now()}`,{cache:'no-store'});if(r.ok)catalog=await r.json()}catch(e){}
}
function units(){
 const eps=epState().done||{};
 const out=[];
 for(const item of ITEMS){
  if(item.status==='upcoming')continue;
  const entry=catalog[item.id];
  const all=(entry?.seasons||[]).flatMap(season=>(season.episodes||[]).map(ep=>({season,ep})));
  if(all.length){
   const fallback=Math.max(1,Math.round(item.minutes/all.length));
   for(const {season,ep} of all){
    const key=`${item.id}:s${season.seasonNumber}:e${ep.episodeNumber}`;
    out.push({key,itemId:item.id,title:item.title,label:`S${String(season.seasonNumber).padStart(2,'0')}E${String(ep.episodeNumber).padStart(2,'0')} · ${ep.name||`Episódio ${ep.episodeNumber}`}`,minutes:Number(ep.runtime)||fallback,done:!!eps[key],kind:'episode'});
   }
  }else{
   out.push({key:item.id,itemId:item.id,title:item.title,label:item.kind||'Produção',minutes:Number(item.minutes)||0,done:!!S.done[item.id],kind:'content'});
  }
 }
 return out;
}
function metrics(){
 const all=units(),total=all.reduce((a,u)=>a+u.minutes,0),watched=all.filter(u=>u.done).reduce((a,u)=>a+u.minutes,0),remaining=all.filter(u=>!u.done);
 const start=today(),target=new Date((S.target||'2026-12-17')+'T12:00:00'),daysLeft=Math.max(1,Math.floor((target-start)/86400000)+1),pace=Math.ceil((total-watched)/daysLeft);
 return{all,total,watched,remaining,left:total-watched,daysLeft,pace,start,target};
}
function baseline(m){
 let b=JSON.parse(localStorage.getItem(PLANKEY)||'null');
 const sig=`${S.target}|${m.total}`;
 if(!b||b.sig!==sig){b={sig,start:dayKey(m.start),baseWatched:m.watched,total:m.total};localStorage.setItem(PLANKEY,JSON.stringify(b))}
 return b;
}
function rhythm(m){
 const b=baseline(m),start=new Date(b.start+'T12:00:00'),elapsed=Math.max(0,Math.floor((m.start-start)/86400000)),totalDays=Math.max(1,Math.floor((m.target-start)/86400000)+1),daily=(b.total-b.baseWatched)/totalDays,expected=Math.min(b.total,b.baseWatched+daily*elapsed),delta=m.watched-expected,dayDelta=daily?delta/daily:0;
 if(dayDelta>=.75)return{class:'ahead',icon:'🟢',title:`${Math.floor(dayDelta)} dia${Math.floor(dayDelta)===1?'':'s'} adiantado`,detail:`Você assistiu ${fmt(Math.round(delta))} além do previsto.`};
 if(dayDelta<=-.75)return{class:'late',icon:'🔴',title:`${Math.abs(Math.ceil(dayDelta))} dia${Math.abs(Math.ceil(dayDelta))===1?'':'s'} atrasado`,detail:`Faltam ${fmt(Math.abs(Math.round(delta)))} para recuperar o ritmo.`};
 return{class:'ok',icon:'🟡',title:'Exatamente no cronograma',detail:'Seu progresso está compatível com a data-alvo.'};
}
function buildPlan(m){
 const days=[];for(let i=0;i<m.daysLeft;i++){const d=new Date(m.start);d.setDate(d.getDate()+i);days.push({date:d,minutes:0,items:[]})}
 let di=0;for(const u of m.remaining){if(di>=days.length)di=days.length-1;let current=days[di];const target=Math.max(1,m.pace);if(current.items.length&&current.minutes+u.minutes>target&&di<days.length-1){di++;current=days[di]}current.items.push(u);current.minutes+=u.minutes}
 return days.filter(d=>d.items.length);
}
function renderSummary(){
 const m=metrics(),r=rhythm(m);
 const watched=document.querySelector('#watched'),remaining=document.querySelector('#remaining'),pace=document.querySelector('#pace');
 if(watched)watched.textContent=fmt(m.watched);if(remaining)remaining.textContent=fmt(m.left);if(pace)pace.textContent=`${fmt(m.pace)}/dia`;
 let card=document.querySelector('#smartRhythmCard');
 if(!card){card=document.createElement('section');card.id='smartRhythmCard';card.className='smartRhythmCard';const metricsBox=document.querySelector('#dashboard .metrics');metricsBox?.insertAdjacentElement('afterend',card)}
 if(card)card.innerHTML=`<div class="smartRhythmTop"><span>${r.icon}</span><div><small>SEU RITMO ATÉ DOOMSDAY</small><h3>${r.title}</h3><p>${r.detail}</p></div></div><div class="smartRhythmGrid"><div><b>${fmt(m.pace)}</b><span>necessário por dia</span></div><div><b>${m.remaining.filter(x=>x.kind==='episode').length}</b><span>episódios restantes</span></div><div><b>${m.daysLeft}</b><span>dias restantes</span></div></div>`;
}
function smartRenderCalendar(){
 const el=document.querySelector('#calendarList');if(!el)return;
 const m=metrics(),plan=buildPlan(m),r=rhythm(m);
 el.innerHTML=`<div class="smartCalendarStatus ${r.class}"><b>${r.icon} ${r.title}</b><span>${fmt(m.left)} restantes · média necessária de ${fmt(m.pace)} por dia</span></div>`+plan.map((d,i)=>`<section class="smartDay ${i===0?'today':''}"><header><div><small>${i===0?'HOJE':d.date.toLocaleDateString('pt-BR',{weekday:'long'}).toUpperCase()}</small><h3>${d.date.toLocaleDateString('pt-BR',{day:'2-digit',month:'long'})}</h3></div><b>${fmt(d.minutes)}</b></header>${d.items.map(u=>`<div class="smartItem"><div><strong>${esc(u.title)}</strong><span>${esc(u.label)}</span></div><b>${fmt(u.minutes)}</b></div>`).join('')}</section>`).join('');
}
function refresh(){renderSummary();smartRenderCalendar()}

const style=document.createElement('style');style.textContent=`
.smartRhythmCard{margin:14px 0 22px;padding:18px;border-radius:22px;background:linear-gradient(145deg,#171c27,#0d1017);border:1px solid #ffffff12}.smartRhythmTop{display:flex;gap:13px}.smartRhythmTop>span{font-size:26px}.smartRhythmTop small{font-size:9px;letter-spacing:1.4px;color:#929baa}.smartRhythmTop h3{margin:4px 0;font-size:18px}.smartRhythmTop p{margin:0;color:#aab2bf;font-size:12px;line-height:1.45}.smartRhythmGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:15px}.smartRhythmGrid div{padding:12px;border-radius:14px;background:#ffffff08}.smartRhythmGrid b,.smartRhythmGrid span{display:block}.smartRhythmGrid b{font-size:16px}.smartRhythmGrid span{font-size:9px;color:#9199a7;margin-top:3px}.smartCalendarStatus{padding:15px;border-radius:17px;margin-bottom:14px;background:#171c27;border:1px solid #ffffff12}.smartCalendarStatus b,.smartCalendarStatus span{display:block}.smartCalendarStatus span{font-size:11px;color:#aab2bf;margin-top:5px}.smartCalendarStatus.ahead{border-color:#2ecc7155}.smartCalendarStatus.late{border-color:#ff4d5e66}.smartDay{border:1px solid #ffffff10;border-radius:19px;overflow:hidden;margin-bottom:14px;background:#10141c}.smartDay.today{box-shadow:0 0 0 1px var(--gold),0 12px 35px #0005}.smartDay header{display:flex;justify-content:space-between;align-items:center;padding:14px 15px;background:#171c27}.smartDay header small{font-size:9px;color:var(--gold);letter-spacing:1.2px}.smartDay header h3{margin:3px 0 0;font-size:15px;text-transform:capitalize}.smartDay header>b{font-size:13px}.smartItem{display:flex;justify-content:space-between;gap:12px;padding:13px 15px;border-top:1px solid #ffffff0c}.smartItem strong,.smartItem span{display:block}.smartItem strong{font-size:12px}.smartItem span{font-size:10px;color:#929baa;margin-top:4px}.smartItem>b{font-size:11px;white-space:nowrap;color:var(--gold)}
`;
document.head.appendChild(style);

loadCatalog().then(()=>{
 try{renderCalendar=smartRenderCalendar}catch(e){}
 const oldDash=typeof renderDash==='function'?renderDash:null;
 if(oldDash){try{renderDash=function(){oldDash();setTimeout(renderSummary,0)}}catch(e){}}
 refresh();
 const obs=new MutationObserver(()=>setTimeout(refresh,60));obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
 document.addEventListener('click',()=>setTimeout(refresh,100),true);
});
window.__SMART_CALENDAR__={refresh,metrics,units};
})();