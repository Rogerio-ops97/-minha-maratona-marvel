(()=>{
'use strict';
const KEY='minhaMarvel.theme.v1';
const APPKEY='minhaMarvel.v2';
const themes={
 origins:{name:'Origens',accent:'#d7263d',accent2:'#f5c451',bg:'#07090e',glow:'rgba(215,38,61,.34)',message:'O início de uma era'},
 shield:{name:'Era S.H.I.E.L.D.',accent:'#198dd1',accent2:'#78d7ff',bg:'#040b13',glow:'rgba(25,141,209,.34)',message:'Protegendo o comum do extraordinário'},
 defenders:{name:'Defensores',accent:'#b20f2c',accent2:'#ef536b',bg:'#090508',glow:'rgba(178,15,44,.38)',message:'As ruas também precisam de heróis'},
 cosmic:{name:'Era Cósmica',accent:'#7d45c7',accent2:'#50cce3',bg:'#080611',glow:'rgba(125,69,199,.38)',message:'A jornada alcançou as estrelas'},
 infinity:{name:'Guerra Infinita',accent:'#c79a36',accent2:'#f7db83',bg:'#0c0904',glow:'rgba(199,154,54,.38)',message:'Tudo está conectado'},
 aftermath:{name:'Legado',accent:'#64748b',accent2:'#d4d9e2',bg:'#080a0e',glow:'rgba(100,116,139,.32)',message:'Um universo reconstruído'},
 multiverse:{name:'Multiverso',accent:'#b642d8',accent2:'#5fe4cf',bg:'#08050d',glow:'rgba(182,66,216,.4)',message:'A linha do tempo está se abrindo'},
 doomsday:{name:'Doomsday',accent:'#e21b38',accent2:'#65d0ff',bg:'#05070c',glow:'rgba(226,27,56,.4)',message:'O destino se aproxima'}
};
let cfg=Object.assign({mode:'auto',manual:'origins',resolved:'origins'},JSON.parse(localStorage.getItem(KEY)||'{}'));
const items=()=>window.MARVEL_ITEMS||[];
const state=()=>{try{return JSON.parse(localStorage.getItem(APPKEY)||'{}')}catch(e){return{done:{}}}};
function infer(){
 const list=items(),done=state().done||{};if(!list.length)return cfg.resolved||'origins';
 const next=list.find(i=>!done[i.id])||list[list.length-1];
 const title=(next.title||'').toLowerCase(),group=(next.group||'').toLowerCase();
 const idx=Math.max(0,list.indexOf(next)),ratio=idx/Math.max(1,list.length-1);
 if(/demolidor|jessica jones|luke cage|punho de ferro|justiceiro|defensores/.test(title))return'defenders';
 if(/s\.h\.i\.e\.l\.d|agent carter/.test(title))return'shield';
 if(/guardiões|capitã marvel|thor: ragnarok|eternos|marvels/.test(title)||group.includes('cósm'))return'cosmic';
 if(/guerra infinita|ultimato/.test(title)||(ratio>.40&&ratio<.55))return'infinity';
 if(/loki|wandavision|what if|doutor estranho.*multiverso|homem-aranha.*sem volta/.test(title)||group.includes('multiverso'))return'multiverse';
 if(/quarteto fantástico|thunderbolts|doomsday|born again|renascido/.test(title)||ratio>.86)return'doomsday';
 if(ratio>.55)return'aftermath';
 return'origins';
}
function current(){return cfg.mode==='manual'&&themes[cfg.manual]?cfg.manual:infer()}
function save(){localStorage.setItem(KEY,JSON.stringify(cfg))}
function apply(){
 const id=current(),t=themes[id];cfg.resolved=id;save();
 const r=document.documentElement;r.dataset.marvelTheme=id;
 r.style.setProperty('--theme-accent',t.accent);r.style.setProperty('--theme-accent-2',t.accent2);r.style.setProperty('--theme-bg',t.bg);r.style.setProperty('--theme-glow',t.glow);
 r.style.setProperty('--gold',t.accent2);r.style.setProperty('--red',t.accent);
 let style=document.getElementById('progressThemeStyle');if(!style){style=document.createElement('style');style.id='progressThemeStyle';document.head.appendChild(style)}
 style.textContent=`body{background:var(--theme-bg)!important}.bg{background:radial-gradient(circle at 15% 5%,var(--theme-glow),transparent 35%),radial-gradient(circle at 88% 28%,color-mix(in srgb,var(--theme-accent-2) 18%,transparent),transparent 30%),linear-gradient(180deg,var(--theme-bg),#05070c)!important;transition:background 1s ease}.logo,.primary,.v7Primary{background:linear-gradient(135deg,var(--theme-accent),color-mix(in srgb,var(--theme-accent) 68%,#000))!important}.track i,.v7Track i{background:linear-gradient(90deg,var(--theme-accent),var(--theme-accent-2))!important}.hero{box-shadow:0 20px 80px var(--theme-glow)}.themeEraChip{display:inline-flex;align-items:center;gap:7px;margin:12px 18px 0;padding:8px 11px;border-radius:999px;border:1px solid #ffffff18;background:#0b0e14cc;color:#fff;font-size:10px;font-weight:800;letter-spacing:.8px;text-transform:uppercase}.themeEraChip i{width:8px;height:8px;border-radius:50%;background:var(--theme-accent);box-shadow:0 0 12px var(--theme-accent)}`;
 let chip=document.querySelector('.themeEraChip');if(!chip){chip=document.createElement('div');chip.className='themeEraChip';document.querySelector('header')?.insertAdjacentElement('afterend',chip)}
 if(chip)chip.innerHTML=`<i></i>${t.name} · ${t.message}`;
 const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=t.accent;
}
function addSettings(){
 const body=document.querySelector('#settings .modalBody');if(!body||body.querySelector('#themeMode'))return;
 const anchor=body.querySelector('#tmdbToken');const wrap=document.createElement('div');wrap.innerHTML=`<label>Tema visual</label><select id="themeMode"><option value="auto">Automático conforme o progresso</option><option value="manual">Escolher manualmente</option></select><select id="themeManual">${Object.entries(themes).map(([id,t])=>`<option value="${id}">${t.name}</option>`).join('')}</select><p class="hint">No modo automático, cores, fundo e introdução evoluem conforme sua posição na cronologia.</p>`;anchor?.insertAdjacentElement('beforebegin',wrap);wrap.querySelector('#themeMode').value=cfg.mode;wrap.querySelector('#themeManual').value=cfg.manual;wrap.querySelector('#themeManual').style.display=cfg.mode==='manual'?'block':'none';wrap.querySelector('#themeMode').onchange=e=>{cfg.mode=e.target.value;wrap.querySelector('#themeManual').style.display=cfg.mode==='manual'?'block':'none';save();apply()};wrap.querySelector('#themeManual').onchange=e=>{cfg.manual=e.target.value;save();apply()};
}
const oldSet=window.setInterval(()=>{if(items().length){clearInterval(oldSet);apply();addSettings()}},40);
document.addEventListener('click',e=>{if(e.target.closest('[data-v7ep],[data-done],#toggleDone,#v7Done,#saveSettings'))setTimeout(apply,120)},true);
new MutationObserver(()=>addSettings()).observe(document.body,{subtree:true,childList:true});
window.__MARVEL_PROGRESS_THEME__={apply,themes,get:()=>current()};
})();
(()=>{const brand=document.querySelector('.brand span');if(brand)brand.textContent='RESPONSIVE EDITION 7.3.1';document.title='Minha Marvel 7.3.1';const im=document.createElement('script');im.src='image-fallback.js?v=7.3.1';im.onload=()=>window.__MARVEL_IMAGE_FALLBACK__?.scan?.();document.body.appendChild(im);const s=document.createElement('script');s.src='smart-calendar.js?v=7.3.1';document.body.appendChild(s)})();