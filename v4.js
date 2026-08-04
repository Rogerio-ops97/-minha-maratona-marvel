(()=>{
'use strict';
const KEY='minhaMarvel.v4';
const state=Object.assign({episodes:{}},JSON.parse(localStorage.getItem(KEY)||'{}'));
const saveState=()=>localStorage.setItem(KEY,JSON.stringify(state));
const normalize=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’‘]/g,"'").replace(/[–—]/g,'-').replace(/\s+/g,' ').trim().toLowerCase();

const counts=new Map(Object.entries({
  'eyes of wakanda - temporada 1':4,
  'olhos de wakanda - temporada 1':4,
  'eyes of wakanda':4,
  'olhos de wakanda':4,
  'agent carter - temporada 1':8,'agent carter - temporada 2':10,
  'agents of s.h.i.e.l.d. - t1e1-e7':7,'agents of s.h.i.e.l.d. - t1e8-e16':9,'agents of s.h.i.e.l.d. - t1e17-e22':6,
  'agents of s.h.i.e.l.d. - t2e1-e19':19,'agents of s.h.i.e.l.d. - t2e20-e22':3,
  'agents of s.h.i.e.l.d. - t3e1-e10':10,'agents of s.h.i.e.l.d. - t3e11-e19':9,'agents of s.h.i.e.l.d. - t3e20-e22':3,
  'agents of s.h.i.e.l.d. - t4e1-e8':8,'agents of s.h.i.e.l.d. - t4e9-e22':14,
  'agents of s.h.i.e.l.d.: slingshot':6,'agents of s.h.i.e.l.d. - t5e1-e19':19,'agents of s.h.i.e.l.d. - t5e20-e22':3,
  'agents of s.h.i.e.l.d. - temporada 6':13,'agents of s.h.i.e.l.d. - temporada 7':13,
  'eu sou groot - temporada 1':5,'eu sou groot - temporada 2':5,
  'demolidor - temporada 1':13,'demolidor - temporada 2':13,'demolidor - temporada 3':13,
  'jessica jones - temporada 1':13,'jessica jones - temporada 2':13,'jessica jones - temporada 3':13,
  'luke cage - temporada 1':13,'luke cage - temporada 2':13,
  'punho de ferro - temporada 1':13,'punho de ferro - temporada 2':10,
  'os defensores':8,'o justiceiro - temporada 1':13,'o justiceiro - temporada 2':13,
  'inumanos - temporada 1':8,'fugitivos - temporada 1':10,'fugitivos - temporada 2':13,'fugitivos - temporada 3':10,
  'manto e adaga - temporada 1':10,'manto e adaga - temporada 2':10,'helstrom - temporada 1':10,
  'wandavision':9,'loki - temporada 1':6,'loki - temporada 2':6,
  'what if...? - temporada 1':9,'what if...? - temporada 2':9,'what if...? - temporada 3':8,
  'falcao e o soldado invernal':6,'gaviao arqueiro':6,'cavaleiro da lua':6,'ms. marvel':6,
  'echo':5,'mulher-hulk: defensora de herois':9,'invasao secreta':6,'agatha desde sempre':9,
  'coracao de ferro - temporada 1':6,'demolidor: renascido - temporada 1':9,
  "x-men '97 - temporada 1":10,'seu amigao da vizinhanca: homem-aranha - temporada 1':10,'marvel zombies - temporada 1':4
}));

const countsById={m001:4};
function visibleTitle(){return document.querySelector('#modalTitle')?.textContent?.trim()||''}
function findItem(){
  const title=visibleTitle(),n=normalize(title);
  if(!n||!window.MARVEL_ITEMS)return null;
  return window.MARVEL_ITEMS.find(i=>normalize(i.title)===n)
    ||window.MARVEL_ITEMS.find(i=>normalize(i.title).includes(n)||n.includes(normalize(i.title)))
    ||null;
}
function totalFor(item){
  const titleN=normalize(item?.title||visibleTitle());
  if(item&&countsById[item.id])return countsById[item.id];
  if(counts.has(titleN))return counts.get(titleN);
  if(titleN.includes('wakanda'))return 4;
  if(titleN.includes('demolidor')&&titleN.includes('temporada 1'))return 13;
  if(titleN.includes('demolidor')&&titleN.includes('temporada 2'))return 13;
  if(titleN.includes('demolidor')&&titleN.includes('temporada 3'))return 13;
  const m=titleN.match(/e(\d+)\s*-\s*e(\d+)/);if(m)return Number(m[2])-Number(m[1])+1;
  return null;
}
function key(id,n){return `${id}:e${n}`}
function isDone(id,n){return !!state.episodes[key(id,n)]}
function persistMain(item,total){
  try{
    const raw=JSON.parse(localStorage.getItem('minhaMarvel.v2')||'{}');raw.done=raw.done||{};
    raw.done[item.id]=Array.from({length:total},(_,x)=>isDone(item.id,x+1)).every(Boolean);
    localStorage.setItem('minhaMarvel.v2',JSON.stringify(raw));
    if(typeof S!=='undefined'&&S?.done){S.done[item.id]=raw.done[item.id];if(typeof save==='function')save();}
  }catch(e){}
}
function renderEpisodes(){
  const modal=document.querySelector('#modal.open');if(!modal)return;
  const item=findItem();const total=totalFor(item);if(!item||!total)return;
  const body=modal.querySelector('.modalBody');if(!body)return;
  body.querySelectorAll('#episodeSection,#episodeSectionV4').forEach(el=>el.remove());
  const completed=Array.from({length:total},(_,x)=>isDone(item.id,x+1)).filter(Boolean).length;
  const avg=Math.max(1,Math.round(item.minutes/total));
  const sec=document.createElement('section');sec.id='episodeSectionV4';sec.className='episodeSection';
  sec.innerHTML=`<div class="episodeHeader"><div><h3>Episódios</h3><small>${completed}/${total} concluídos · ~${avg} min cada</small></div><button id="markAllEpisodesV4">${completed===total?'Desmarcar todos':'Marcar todos'}</button></div><div class="episodeProgress"><i style="width:${Math.round(completed/total*100)}%"></i></div><div class="episodeGrid">${Array.from({length:total},(_,x)=>{const n=x+1,d=isDone(item.id,n);return `<button class="episodeBtn ${d?'done':''}" data-v4-episode="${n}"><b>E${String(n).padStart(2,'0')}</b><small>${d?'Assistido':'Pendente'}</small></button>`}).join('')}</div>`;
  body.appendChild(sec);
  sec.querySelectorAll('[data-v4-episode]').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();const n=Number(btn.dataset.v4Episode);state.episodes[key(item.id,n)]=!isDone(item.id,n);saveState();persistMain(item,total);renderEpisodes();}));
  sec.querySelector('#markAllEpisodesV4').addEventListener('click',e=>{e.stopPropagation();const value=completed!==total;for(let n=1;n<=total;n++)state.episodes[key(item.id,n)]=value;saveState();persistMain(item,total);renderEpisodes();});
}
const style=document.createElement('style');style.textContent='#episodeSection{display:none!important}#episodeSectionV4{display:block!important}';document.head.appendChild(style);
let timer;function schedule(){clearTimeout(timer);timer=setTimeout(renderEpisodes,120)}
new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});
document.addEventListener('click',schedule,true);window.addEventListener('load',schedule);
window.__MARVEL_V4__={counts,renderEpisodes};
})();