(()=>{
'use strict';
const KEY='minhaMarvel.intro.settings';
const prefs=Object.assign({enabled:true,sound:true,oncePerSession:true,duration:6200},JSON.parse(localStorage.getItem(KEY)||'{}'));
const finishEarly=!prefs.enabled||(prefs.oncePerSession&&sessionStorage.getItem('minhaMarvelIntroPlayed'));
if(finishEarly){document.documentElement.classList.add('intro-finished');return;}
sessionStorage.setItem('minhaMarvelIntroPlayed','1');

const css=document.createElement('style');
css.textContent=`
html:not(.intro-finished) body{overflow:hidden}.app{transition:filter .8s ease,opacity .8s ease}html:not(.intro-finished) .app{filter:blur(12px);opacity:.05}
#minhaMarvelIntro{position:fixed;inset:0;z-index:999999;background:#020204;overflow:hidden;color:#fff;opacity:1;visibility:visible;transition:opacity .9s ease,visibility .9s ease;font-family:Arial,Helvetica,sans-serif}
#minhaMarvelIntro.hide{opacity:0;visibility:hidden;pointer-events:none}
#minhaMarvelIntro:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 45%,rgba(223,15,47,.28),transparent 38%),linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.9));z-index:4;pointer-events:none}
#minhaMarvelIntro .heroWall{position:absolute;inset:-7%;display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:48%;gap:8px;transform:perspective(900px) rotateX(5deg) rotateZ(-2deg) scale(1.12);animation:mmWall 6.2s cubic-bezier(.18,.7,.2,1) both;filter:saturate(.72) contrast(1.2)}
#minhaMarvelIntro .heroTile{position:relative;overflow:hidden;background:linear-gradient(145deg,#191b22,#4a0918 65%,#08090d);box-shadow:0 0 0 1px rgba(255,255,255,.06) inset}
#minhaMarvelIntro .heroTile img{width:100%;height:100%;object-fit:cover;opacity:.67;transform:scale(1.12);animation:mmTile 6.2s ease both;filter:grayscale(.25)}
#minhaMarvelIntro .heroTile:nth-child(2n) img{animation-direction:reverse}#minhaMarvelIntro .heroTile:nth-child(3n){transform:translateY(-8%)}
#minhaMarvelIntro .scan{position:absolute;inset:-20%;z-index:5;background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.16) 49%,rgba(237,18,55,.4) 52%,transparent 66%);transform:translateX(-70%);animation:mmScan 4.7s ease-in-out .3s both;mix-blend-mode:screen}
#minhaMarvelIntro .grain{position:absolute;inset:0;z-index:6;opacity:.18;background-image:radial-gradient(rgba(255,255,255,.35) .55px,transparent .7px);background-size:4px 4px;animation:mmGrain .28s steps(2) infinite}
#minhaMarvelIntro .brandReveal{position:absolute;inset:0;z-index:10;display:grid;place-items:center;text-align:center;padding:24px}
#minhaMarvelIntro .brandBox{opacity:0;transform:scale(.68);animation:mmBrand 6.2s cubic-bezier(.18,.8,.22,1) both}
#minhaMarvelIntro .brandFrame{display:inline-block;position:relative;padding:14px 18px 11px;border:2px solid rgba(255,255,255,.92);background:linear-gradient(135deg,rgba(226,20,55,.95),rgba(130,0,24,.96));box-shadow:0 0 60px rgba(226,20,55,.48),inset 0 0 28px rgba(255,255,255,.09);overflow:hidden}
#minhaMarvelIntro .brandFrame:after{content:"";position:absolute;inset:-30%;background:linear-gradient(110deg,transparent 35%,rgba(255,255,255,.62) 50%,transparent 65%);transform:translateX(-85%);animation:mmLogoSweep 1.2s ease 4.15s both}
#minhaMarvelIntro .brandMain{position:relative;z-index:2;font-weight:1000;font-size:clamp(42px,13vw,84px);line-height:.85;letter-spacing:-4px;text-transform:uppercase;white-space:nowrap;text-shadow:0 2px 0 rgba(0,0,0,.18)}
#minhaMarvelIntro .brandSub{margin-top:15px;font-size:clamp(9px,2.8vw,13px);font-weight:800;letter-spacing:5px;text-transform:uppercase;color:#e8e8ec;opacity:.9}
#minhaMarvelIntro .progress{position:absolute;left:0;right:0;bottom:0;height:3px;z-index:12;background:rgba(255,255,255,.08)}#minhaMarvelIntro .progress i{display:block;height:100%;width:0;background:linear-gradient(90deg,#9e001d,#ff294e,#fff);animation:mmProgress 6.2s linear both}
#minhaMarvelIntro .skip{position:absolute;right:18px;bottom:calc(22px + env(safe-area-inset-bottom));z-index:15;border:1px solid rgba(255,255,255,.2);background:rgba(5,5,9,.56);color:#fff;padding:10px 16px;border-radius:999px;font-weight:700;font-size:12px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
@keyframes mmWall{0%{opacity:0;transform:perspective(900px) rotateX(8deg) rotateZ(-5deg) scale(1.35)}15%{opacity:1}68%{opacity:.88}100%{opacity:.12;transform:perspective(900px) rotateX(0) rotateZ(0) scale(1.02)}}
@keyframes mmTile{0%{transform:scale(1.35) translateY(4%)}100%{transform:scale(1.04) translateY(-3%)}}
@keyframes mmScan{0%{transform:translateX(-75%);opacity:0}18%{opacity:1}78%{opacity:.85}100%{transform:translateX(75%);opacity:0}}
@keyframes mmGrain{0%{transform:translate(0,0)}25%{transform:translate(-1%,1%)}50%{transform:translate(1%,-1%)}75%{transform:translate(.5%,1%)}100%{transform:translate(0,0)}}
@keyframes mmBrand{0%,50%{opacity:0;transform:scale(.68)}66%{opacity:1;transform:scale(1.045)}84%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.08)}}
@keyframes mmLogoSweep{to{transform:translateX(85%)}}
@keyframes mmProgress{to{width:100%}}
@media(max-width:520px){#minhaMarvelIntro .heroWall{grid-template-columns:repeat(3,1fr);grid-auto-rows:36%;inset:-5% -18%}.heroTile:nth-child(n+10){display:none}}
@media(prefers-reduced-motion:reduce){#minhaMarvelIntro *{animation-duration:.01ms!important;animation-delay:0s!important}}
`;
document.head.appendChild(css);

const overlay=document.createElement('div');
overlay.id='minhaMarvelIntro';
overlay.innerHTML=`<div class="heroWall" aria-hidden="true">${'<div class="heroTile"></div>'.repeat(12)}</div><div class="scan"></div><div class="grain"></div><div class="brandReveal"><div class="brandBox"><div class="brandFrame"><div class="brandMain">MINHA MARVEL</div></div><div class="brandSub">Doomsday Edition</div></div></div><button class="skip" type="button" aria-label="Pular introdução">Pular</button><div class="progress"><i></i></div>`;
document.body.prepend(overlay);

async function loadHeroes(){
 try{
  const r=await fetch(`tmdb-data.json?intro=${Date.now()}`,{cache:'no-store'});if(!r.ok)return;
  const meta=await r.json();
  const preferred=['m006','m010','m015','m024','m030','m037','m045','m052','m061','m074','m095','m118'];
  const values=preferred.map(id=>meta[id]).filter(Boolean);
  if(values.length<8)values.push(...Object.values(meta).filter(x=>x?.backdrop||x?.poster));
  const unique=[];const seen=new Set();for(const x of values){const p=x.backdrop||x.poster;if(p&&!seen.has(p)){seen.add(p);unique.push(p)}if(unique.length===12)break;}
  overlay.querySelectorAll('.heroTile').forEach((tile,i)=>{const path=unique[i%unique.length];if(!path)return;const img=new Image();img.alt='';img.src=`https://image.tmdb.org/t/p/w780${path}`;img.onload=()=>tile.appendChild(img);});
 }catch(e){}
}
loadHeroes();

let audioCtx=null,started=false;
function playSound(){
 if(started||!prefs.sound)return;started=true;
 try{
  audioCtx=new(window.AudioContext||window.webkitAudioContext)();const now=audioCtx.currentTime,master=audioCtx.createGain();master.connect(audioCtx.destination);master.gain.setValueAtTime(.0001,now);master.gain.exponentialRampToValueAtTime(.18,now+.08);master.gain.exponentialRampToValueAtTime(.0001,now+4.6);
  const tones=[55,82.4,110,164.8];tones.forEach((f,i)=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=i<2?'sine':'triangle';o.frequency.setValueAtTime(f,now);o.frequency.exponentialRampToValueAtTime(f*(1.35+i*.08),now+4.4);g.gain.setValueAtTime(.12/(i+1),now);g.gain.exponentialRampToValueAtTime(.0001,now+4.5);o.connect(g);g.connect(master);o.start(now+i*.06);o.stop(now+4.7);});
  const impact=audioCtx.createOscillator(),ig=audioCtx.createGain();impact.type='sine';impact.frequency.setValueAtTime(95,now+3.7);impact.frequency.exponentialRampToValueAtTime(42,now+4.15);ig.gain.setValueAtTime(.0001,now);ig.gain.setValueAtTime(.3,now+3.7);ig.gain.exponentialRampToValueAtTime(.0001,now+4.3);impact.connect(ig);ig.connect(master);impact.start(now+3.7);impact.stop(now+4.35);
 }catch(e){}
}
function close(){if(overlay.classList.contains('hide'))return;overlay.classList.add('hide');document.documentElement.classList.add('intro-finished');setTimeout(()=>{overlay.remove();css.remove();try{audioCtx?.close()}catch(e){}},950);}
overlay.querySelector('.skip').addEventListener('click',close);
overlay.addEventListener('pointerdown',playSound,{once:true});
setTimeout(close,Math.max(4200,Number(prefs.duration)||6200));
window.__MINHA_MARVEL_INTRO__={close,prefs};
})();