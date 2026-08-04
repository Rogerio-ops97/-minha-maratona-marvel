(()=>{
const COUNTS={
'Eyes of Wakanda — Temporada 1':4,
'Demolidor — Temporada 1':13,
'Demolidor — Temporada 2':13,
'Demolidor — Temporada 3':13,
'Demolidor: Renascido — Temporada 1':9,
'Agent Carter — Temporada 1':8,
'Agent Carter — Temporada 2':10,
'WandaVision':9,
'Loki — Temporada 1':6,
'Loki — Temporada 2':6,
'Falcão e o Soldado Invernal':6,
'Gavião Arqueiro':6,
'Cavaleiro da Lua':6,
'Ms. Marvel':6,
'Echo':5,
'Mulher-Hulk: Defensora de Heróis':9,
'Agatha Desde Sempre':9,
'What If...? — Temporada 1':9,
'What If...? — Temporada 2':9,
'What If...? — Temporada 3':8,
'Eu Sou Groot — Temporada 1':5,
'Eu Sou Groot — Temporada 2':5,
'Os Defensores':8
};
let busy=false;
function patch(){
 if(busy||!document.querySelector('#modal.open'))return;
 const title=document.querySelector('#modalTitle')?.textContent?.trim();
 const total=COUNTS[title];
 const sec=document.querySelector('#episodeSection');
 if(!title||!total||!sec)return;
 const item=typeof ITEMS!=='undefined'?ITEMS.find(i=>i.title===title):null;
 if(!item)return;
 const V=Object.assign({episodes:{}},JSON.parse(localStorage.getItem('minhaMarvel.v3')||'{}'));
 const key=n=>`${item.id}:e${n}`;
 const done=n=>!!V.episodes[key(n)];
 const completed=Array.from({length:total},(_,i)=>i+1).filter(done).length;
 const avg=Math.round(item.minutes/total);
 busy=true;
 sec.innerHTML=`<div class="episodeHeader"><div><h3>Episódios</h3><small>${completed}/${total} concluídos · média de ${avg} min</small></div><button id="markAllEpisodes">${completed===total?'Desmarcar todos':'Marcar todos'}</button></div><div class="episodeProgress"><i style="width:${Math.round(completed/total*100)}%"></i></div><div class="episodeGrid">${Array.from({length:total},(_,i)=>{const n=i+1;return `<button class="episodeBtn ${done(n)?'done':''}" data-hotfix-episode="${n}"><b>E${String(n).padStart(2,'0')}</b><small>${done(n)?'Assistido':'Pendente'}</small></button>`}).join('')}</div>`;
 sec.querySelectorAll('[data-hotfix-episode]').forEach(btn=>btn.onclick=()=>{
   const n=Number(btn.dataset.hotfixEpisode);V.episodes[key(n)]=!done(n);
   const all=Array.from({length:total},(_,i)=>!!V.episodes[key(i+1)]).every(Boolean);
   if(typeof S!=='undefined')S.done[item.id]=all;
   localStorage.setItem('minhaMarvel.v3',JSON.stringify(V));
   if(typeof save==='function')save();
   setTimeout(()=>{busy=false;patch()},80);
 });
 sec.querySelector('#markAllEpisodes').onclick=()=>{
   const val=completed!==total;for(let n=1;n<=total;n++)V.episodes[key(n)]=val;
   if(typeof S!=='undefined')S.done[item.id]=val;
   localStorage.setItem('minhaMarvel.v3',JSON.stringify(V));
   if(typeof save==='function')save();
   setTimeout(()=>{busy=false;patch()},80);
 };
 busy=false;
}
new MutationObserver(()=>setTimeout(patch,20)).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
document.addEventListener('click',()=>setTimeout(patch,60),true);
setInterval(patch,500);
})();