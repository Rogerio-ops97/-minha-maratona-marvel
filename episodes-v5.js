(()=>{
'use strict';
const KEY='minhaMarvel.episodes.v5';
const state=Object.assign({done:{}},JSON.parse(localStorage.getItem(KEY)||'{}'));
const saveState=()=>localStorage.setItem(KEY,JSON.stringify(state));
let catalog={};

async function loadCatalog(){
  try{
    const response=await fetch('episodes-data.json?v=5.0',{cache:'no-store'});
    if(response.ok)catalog=await response.json();
  }catch(error){console.error('Falha ao carregar episodes-data.json',error)}
}

function currentItem(){
  if(typeof current!=='undefined'&&current?.id)return current;
  const title=document.querySelector('#modalTitle')?.textContent?.trim();
  if(!title||!window.MARVEL_ITEMS)return null;
  return window.MARVEL_ITEMS.find(item=>item.title===title)||null;
}

function episodeKey(itemId,seasonNumber,episodeNumber){return `${itemId}:s${seasonNumber}:e${episodeNumber}`}
function episodeDone(itemId,seasonNumber,episodeNumber){return !!state.done[episodeKey(itemId,seasonNumber,episodeNumber)]}
function allEpisodes(entry){return (entry?.seasons||[]).flatMap(season=>season.episodes.map(ep=>({season,ep})))}

function syncMain(item,entry){
  const all=allEpisodes(entry);
  const finished=all.length>0&&all.every(({season,ep})=>episodeDone(item.id,season.seasonNumber,ep.episodeNumber));
  try{
    if(typeof S!=='undefined'&&S?.done){S.done[item.id]=finished;if(typeof save==='function')save()}
  }catch(error){}
}

function episodeImage(ep){return ep.still?`https://image.tmdb.org/t/p/w500${ep.still}`:''}
function fmtRuntime(runtime){return runtime?`${runtime} min`:'Duração não informada'}

function render(){
  const modal=document.querySelector('#modal.open');
  if(!modal)return;
  const item=currentItem();
  if(!item)return;
  const body=modal.querySelector('.modalBody');
  if(!body)return;

  body.querySelectorAll('#episodeSection,#episodeSectionV4,#episodeSectionV5,.episodeSection').forEach(section=>section.remove());

  const entry=catalog[item.id];
  const isSeries=item.media==='tv'||/série|minissérie|temporada|animação|websérie/i.test(item.kind||'')||/temporada|T\dE/i.test(item.title);
  if(!isSeries)return;

  const section=document.createElement('section');
  section.id='episodeSectionV5';
  section.className='episodeSection episodeSourceOfficial';

  if(!entry||!entry.seasons?.length){
    section.innerHTML='<div class="episodeHeader"><div><h3>Episódios</h3><small>Dados oficiais ainda não sincronizados.</small></div></div><p class="episodeEmpty">Execute o workflow “Atualizar catálogo TMDB” para carregar temporadas e episódios.</p>';
    body.appendChild(section);
    return;
  }

  const total=allEpisodes(entry).length;
  const completed=allEpisodes(entry).filter(({season,ep})=>episodeDone(item.id,season.seasonNumber,ep.episodeNumber)).length;
  section.innerHTML=`<div class="episodeHeader"><div><h3>Episódios</h3><small>${completed}/${total} concluídos · dados oficiais do TMDB</small></div><button id="markAllEpisodesV5">${completed===total?'Desmarcar todos':'Marcar todos'}</button></div><div class="episodeProgress"><i style="width:${total?Math.round(completed/total*100):0}%"></i></div><div class="seasonListV5"></div>`;

  const list=section.querySelector('.seasonListV5');
  for(const season of entry.seasons){
    const seasonDone=season.episodes.filter(ep=>episodeDone(item.id,season.seasonNumber,ep.episodeNumber)).length;
    const block=document.createElement('div');
    block.className='seasonBlockV5';
    block.innerHTML=`<div class="seasonTitleV5"><div><b>${season.name||`Temporada ${season.seasonNumber}`}</b><small>${seasonDone}/${season.episodes.length} episódios</small></div><button data-season-all="${season.seasonNumber}">${seasonDone===season.episodes.length?'Desmarcar temporada':'Marcar temporada'}</button></div><div class="episodeListV5"></div>`;
    const episodeList=block.querySelector('.episodeListV5');
    for(const ep of season.episodes){
      const done=episodeDone(item.id,season.seasonNumber,ep.episodeNumber);
      const card=document.createElement('button');
      card.className=`episodeCardV5 ${done?'done':''}`;
      card.dataset.season=season.seasonNumber;
      card.dataset.episode=ep.episodeNumber;
      card.innerHTML=`${ep.still?`<img src="${episodeImage(ep)}" alt="">`:''}<div class="episodeCopyV5"><div class="episodeTopV5"><b>S${String(season.seasonNumber).padStart(2,'0')}E${String(ep.episodeNumber).padStart(2,'0')} · ${ep.name||`Episódio ${ep.episodeNumber}`}</b><span>${done?'✓ Assistido':'Pendente'}</span></div><small>${fmtRuntime(ep.runtime)}${ep.airDate?` · ${new Date(ep.airDate+'T12:00:00').toLocaleDateString('pt-BR')}`:''}</small>${ep.overview?`<p>${ep.overview}</p>`:''}</div>`;
      card.addEventListener('click',()=>{
        const key=episodeKey(item.id,season.seasonNumber,ep.episodeNumber);
        state.done[key]=!state.done[key];
        saveState();syncMain(item,entry);render();
      });
      episodeList.appendChild(card);
    }
    block.querySelector('[data-season-all]').addEventListener('click',()=>{
      const value=seasonDone!==season.episodes.length;
      for(const ep of season.episodes)state.done[episodeKey(item.id,season.seasonNumber,ep.episodeNumber)]=value;
      saveState();syncMain(item,entry);render();
    });
    list.appendChild(block);
  }

  section.querySelector('#markAllEpisodesV5').addEventListener('click',()=>{
    const value=completed!==total;
    for(const {season,ep} of allEpisodes(entry))state.done[episodeKey(item.id,season.seasonNumber,ep.episodeNumber)]=value;
    saveState();syncMain(item,entry);render();
  });
  body.appendChild(section);
}

const style=document.createElement('style');
style.textContent=`.episodeSourceOfficial{margin-top:28px}.seasonListV5{display:grid;gap:18px;margin-top:16px}.seasonBlockV5{border:1px solid var(--line);border-radius:18px;overflow:hidden;background:#0f121a}.seasonTitleV5{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px;background:#171b25}.seasonTitleV5 b,.seasonTitleV5 small{display:block}.seasonTitleV5 small{color:var(--muted);margin-top:3px}.seasonTitleV5 button{border:0;border-radius:10px;background:#2a3040;color:#fff;padding:9px;font-size:11px}.episodeListV5{display:grid}.episodeCardV5{border:0;border-top:1px solid var(--line);background:#10131b;color:#fff;padding:0;display:grid;grid-template-columns:110px 1fr;text-align:left;overflow:hidden}.episodeCardV5.done{background:#112119}.episodeCardV5 img{width:110px;height:100%;min-height:104px;object-fit:cover}.episodeCopyV5{padding:12px}.episodeTopV5{display:flex;justify-content:space-between;gap:10px}.episodeTopV5 b{font-size:12px;line-height:1.35}.episodeTopV5 span{font-size:9px;color:var(--gold);white-space:nowrap}.episodeCopyV5>small{display:block;color:var(--muted);font-size:10px;margin-top:5px}.episodeCopyV5 p{font-size:11px;line-height:1.4;color:#b9c0cc;margin:8px 0 0;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.episodeEmpty{padding:14px;border:1px dashed var(--line);border-radius:14px;color:var(--muted);font-size:12px}@media(max-width:430px){.episodeCardV5{grid-template-columns:90px 1fr}.episodeCardV5 img{width:90px}.episodeTopV5{display:block}.episodeTopV5 span{display:block;margin-top:4px}}`;
document.head.appendChild(style);

loadCatalog().then(render);
const observer=new MutationObserver(()=>setTimeout(render,50));
observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
document.addEventListener('click',event=>{if(event.target.closest('.gridCard,.openItem,#modal'))setTimeout(render,80)},true);
window.__MARVEL_EPISODES_V5__={render,getCatalog:()=>catalog};
})();