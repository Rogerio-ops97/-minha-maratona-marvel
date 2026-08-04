(()=>{
const KEY='minhaMarvel.premium.v1';
const P=Object.assign({sound:true,volume:.34},JSON.parse(localStorage.getItem(KEY)||'{}'));
const saveP=()=>localStorage.setItem(KEY,JSON.stringify(P));
const episodeCounts={
'Eyes of Wakanda — Temporada 1':4,'Agent Carter — Temporada 1':8,'Agent Carter — Temporada 2':10,
'Agents of S.H.I.E.L.D. — T1E1–E7':7,'Agents of S.H.I.E.L.D. — T1E8–E16':9,'Agents of S.H.I.E.L.D. — T1E17–E22':6,
'Agents of S.H.I.E.L.D. — T2E1–E19':19,'Agents of S.H.I.E.L.D. — T2E20–E22':3,
'Agents of S.H.I.E.L.D. — T3E1–E10':10,'Agents of S.H.I.E.L.D. — T3E11–E19':9,'Agents of S.H.I.E.L.D. — T3E20–E22':3,
'Agents of S.H.I.E.L.D. — T4E1–E8':8,'Agents of S.H.I.E.L.D. — T4E9–E22':14,'Agents of S.H.I.E.L.D.: Slingshot':6,
'Agents of S.H.I.E.L.D. — T5E1–E19':19,'Agents of S.H.I.E.L.D. — T5E20–E22':3,
'Agents of S.H.I.E.L.D. — Temporada 6':13,'Agents of S.H.I.E.L.D. — Temporada 7':13,
'Eu Sou Groot — Temporada 1':5,'Eu Sou Groot — Temporada 2':5,
'Demolidor — Temporada 1':13,'Demolidor — Temporada 2':13,'Demolidor — Temporada 3':13,
'Jessica Jones — Temporada 1':13,'Jessica Jones — Temporada 2':13,'Jessica Jones — Temporada 3':13,
'Luke Cage — Temporada 1':13,'Luke Cage — Temporada 2':13,
'Punho de Ferro — Temporada 1':13,'Punho de Ferro — Temporada 2':10,
'Os Defensores':8,'O Justiceiro — Temporada 1':13,'O Justiceiro — Temporada 2':13,
'Inumanos — Temporada 1':8,'Fugitivos — Temporada 1':10,'Fugitivos — Temporada 2':13,'Fugitivos — Temporada 3':10,
'Manto e Adaga — Temporada 1':10,'Manto e Adaga — Temporada 2':10,'Helstrom — Temporada 1':10,
'WandaVision':9,'Loki — Temporada 1':6,'Loki — Temporada 2':6,
'What If...? — Temporada 1':9,'What If...? — Temporada 2':9,'What If...? — Temporada 3':8,
'Falcão e o Soldado Invernal':6,'Gavião Arqueiro':6,'Cavaleiro da Lua':6,'Ms. Marvel':6,
'Echo':5,'Mulher-Hulk: Defensora de Heróis':9,'Invasão Secreta':6,'Agatha Desde Sempre':9,
'Coração de Ferro — Temporada 1':6,'Demolidor: Renascido — Temporada 1':9,
'X-Men: The Animated Series — Temporadas 1–5':76,'X-Men ’97 — Temporada 1':10,
'Seu Amigão da Vizinhança: Homem-Aranha — Temporada 1':10,'Marvel Zombies — Temporada 1':4
};
function countFor(i){if(episodeCounts[i.title])return episodeCounts[i.title];let m=i.title.match(/E(\d+)–E(\d+)/);if(m)return +m[2]-+m[1]+1;return null}
let AC=null;
function audio(){if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();return AC}
function tone(type='tap'){if(!P.sound)return;try{const c=audio(),now=c.currentTime,g=c.createGain();g.connect(c.destination);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(P.volume,now+.012);g.gain.exponentialRampToValueAtTime(.0001,now+.22);const notes={tap:[420,.08],nav:[300,.07],done:[620,.14],season:[440,.28],achievement:[523,.48],open:[260,.12]}[type]||[360,.1];const o=c.createOscillator();o.type=type==='achievement'?'triangle':'sine';o.frequency.setValueAtTime(notes[0],now);if(type==='done')o.frequency.exponentialRampToValueAtTime(880,now+.13);if(type==='season')o.frequency.exponentialRampToValueAtTime(660,now+.25);if(type==='achievement')o.frequency.exponentialRampToValueAtTime(1046,now+.44);o.connect(g);o.start(now);o.stop(now+notes[1]);}catch(e){}}
function vibrate(pattern){if(navigator.vibrate)navigator.vibrate(pattern)}
function addSoundSettings(){const box=document.querySelector('#settings .modalBody');if(!box||document.querySelector('#soundToggle'))return;const row=document.createElement('div');row.className='settingsToggle';row.innerHTML=`<div><b>Sons e resposta tátil</b><div class="hint">Efeitos originais nas interações.</div></div><input id="soundToggle" type="checkbox" ${P.sound?'checked':''}>`;box.insertBefore(row,document.querySelector('#saveSettings'));row.querySelector('input').onchange=e=>{P.sound=e.target.checked;saveP();tone('done')}}
function patchEpisodeSection(){
 if(typeof current==='undefined'||!current||!document.querySelector('#modal.open'))return;
 const total=countFor(current);if(!total)return;
 const sec=document.querySelector('#episodeSection');if(!sec)return;
 const V3=Object.assign({episodes:{}},JSON.parse(localStorage.getItem('minhaMarvel.v3')||'{}'));
 const key=n=>`${current.id}:e${n}`,done=n=>!!V3.episodes[key(n)];
 const completed=Array.from({length:total},(_,x)=>x+1).filter(done).length,avg=Math.round(current.minutes/total);
 sec.innerHTML=`<div class="episodeHeader"><div><h3>Episódios</h3><small>${completed}/${total} concluídos · média de ${avg} min</small></div><button id="markAllEpisodes">${completed===total?'Desmarcar todos':'Marcar todos'}</button></div><div class="episodeProgress"><i style="width:${Math.round(completed/total*100)}%"></i></div><div class="episodeGrid">${Array.from({length:total},(_,x)=>{const n=x+1;return `<button class="episodeBtn ${done(n)?'done':''}" data-premium-episode="${n}"><b>E${String(n).padStart(2,'0')}</b><small>${done(n)?'Assistido':'Pendente'}</small></button>`}).join('')}</div>`;
 sec.querySelectorAll('[data-premium-episode]').forEach(b=>b.onclick=()=>{const n=+b.dataset.premiumEpisode;V3.episodes[key(n)]=!done(n);S.done[current.id]=Array.from({length:total},(_,x)=>done(x+1)).every(Boolean);localStorage.setItem('minhaMarvel.v3',JSON.stringify(V3));save();tone(S.done[current.id]?'season':'done');vibrate(S.done[current.id]?[35,30,70]:25);openItem(current.id)});
 sec.querySelector('#markAllEpisodes').onclick=()=>{const value=completed!==total;for(let n=1;n<=total;n++)V3.episodes[key(n)]=value;S.done[current.id]=value;localStorage.setItem('minhaMarvel.v3',JSON.stringify(V3));save();tone(value?'season':'tap');vibrate(value?[40,30,90]:20);openItem(current.id)};
}
function bindSounds(){document.addEventListener('click',e=>{if(e.target.closest('nav button'))tone('nav');else if(e.target.closest('.openItem,.gridCard .art,.gridCard .copy'))tone('open');else if(e.target.closest('[data-done],#toggleDone')){tone('done');vibrate(25)}else if(e.target.closest('button'))tone('tap')},true)}
const oldOpen=window.openItem;window.openItem=function(id){oldOpen(id);setTimeout(()=>{patchEpisodeSection();addSoundSettings()},60)};
const oldRender=window.render;window.render=function(){oldRender();setTimeout(addSoundSettings,30)};
bindSounds();setTimeout(addSoundSettings,300);window.__MARVEL_PREMIUM__={episodeCounts,sound:()=>P.sound};
})();