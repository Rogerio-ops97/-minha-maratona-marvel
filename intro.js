(()=>{
'use strict';
const KEY='minhaMarvel.intro.settings';
const prefs=Object.assign({enabled:true,sound:true,oncePerSession:true,duration:6800},JSON.parse(localStorage.getItem(KEY)||'{}'));
const finishEarly=!prefs.enabled||(prefs.oncePerSession&&sessionStorage.getItem('minhaMarvelIntroPlayed'));
if(finishEarly){document.documentElement.classList.add('intro-finished');return;}
sessionStorage.setItem('minhaMarvelIntroPlayed','1');

const css=document.createElement('style');
css.textContent=`
html:not(.intro-finished) body{overflow:hidden}.app{transition:filter .8s ease,opacity .8s ease}html:not(.intro-finished) .app{filter:blur(12px);opacity:.04}
#minhaMarvelIntro{position:fixed;inset:0;z-index:999999;background:#020204;overflow:hidden;color:#fff;opacity:1;visibility:visible;transition:opacity .9s ease,visibility .9s ease;font-family:Arial,Helvetica,sans-serif}
#minhaMarvelIntro.hide{opacity:0;visibility:hidden;pointer-events:none}
#minhaMarvelIntro:before{content:"";position:absolute;inset:0;z-index:4;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.16),rgba(0,0,0,.24) 32%,rgba(0,0,0,.44) 58%,rgba(0,0,0,.82)),radial-gradient(circle at 50% 47%,rgba(230,18,54,.28),transparent 42%)}
#minhaMarvelIntro .heroWall{position:absolute;inset:-5%;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-template-rows:repeat(3,minmax(0,1fr));gap:7px;transform:scale(1.16) rotate(-1.5deg);animation:mmWall 6.8s cubic-bezier(.18,.7,.2,1) both;filter:saturate(.82) contrast(1.18)}
#minhaMarvelIntro .heroTile{position:relative;overflow:hidden;background:linear-gradient(145deg,#171922,#4b0a1a 66%,#07080c);box-shadow:0 0 0 1px rgba(255,255,255,.06) inset}
#minhaMarvelIntro .heroTile img{width:100%;height:100%;object-fit:cover;opacity:.82;transform:scale(1.16);animation:mmTile 6.8s ease both;filter:grayscale(.12)}
#minhaMarvelIntro .heroTile:nth-child(2n) img{animation-direction:reverse}#minhaMarvelIntro .heroTile:nth-child(3n){transform:translateY(-3%)}
#minhaMarvelIntro .scan{position:absolute;inset:-20%;z-index:5;background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.16) 49%,rgba(237,18,55,.44) 52%,transparent 66%);transform:translateX(-72%);animation:mmScan 5s ease-in-out .35s both;mix-blend-mode:screen}
#minhaMarvelIntro .grain{position:absolute;inset:0;z-index:6;opacity:.14;background-image:radial-gradient(rgba(255,255,255,.35) .55px,transparent .7px);background-size:4px 4px;animation:mmGrain .28s steps(2) infinite}
#minhaMarvelIntro .brandReveal{position:absolute;inset:0;z-index:10;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px}
#minhaMarvelIntro .brandBox{width:min(92vw,620px);display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;transform:scale(.72);animation:mmBrand 6.8s cubic-bezier(.18,.8,.22,1) both}
#minhaMarvelIntro .brandFrame{display:flex;align-items:center;justify-content:center;position:relative;width:min(88vw,560px);min-height:104px;padding:18px 24px 14px;border:2px solid rgba(255,255,255,.96);background:linear-gradient(135deg,rgba(226,20,55,.96),rgba(126,0,22,.97));box-shadow:0 0 70px rgba(226,20,55,.52),0 18px 50px rgba(0,0,0,.42),inset 0 0 28px rgba(255,255,255,.1);overflow:hidden;box-sizing:border-box}
#minhaMarvelIntro .brandFrame:after{content:"";position:absolute;inset:-30%;background:linear-gradient(110deg,transparent 35%,rgba(255,255,255,.62) 50%,transparent 65%);transform:translateX(-85%);animation:mmLogoSweep 1.2s ease 4.5s both}
#minhaMarvelIntro .brandMain{position:relative;z-index:2;width:100%;font-weight:1000;font-size:clamp(38px,10.5vw,78px);line-height:.92;letter-spacing:-2.5px;text-transform:uppercase;white-space:nowrap;text-align:center;text-shadow:0 2px 0 rgba(0,0,0,.2)}
#minhaMarvelIntro .brandSub{margin-top:16px;width:100%;text-align:center;font-size:clamp(9px,2.7vw,13px);font-weight:800;letter-spacing:4px;text-transform:uppercase;color:#f0f1f5;text-shadow:0 2px 10px rgba(0,0,0,.9)}
#minhaMarvelIntro .startGate{position:absolute;inset:0;z-index:30;display:flex;align-items:flex-end;justify-content:center;padding:0 20px calc(42px + env(safe-area-inset-bottom));background:linear-gradient(180deg,transparent 55%,rgba(0,0,0,.75));transition:opacity .35s ease,visibility .35s ease}
#minhaMarvelIntro .startGate.hidden{opacity:0;visibility:hidden;pointer-events:none}
#minhaMarvelIntro .startBtn{border:1px solid rgba(255,255,255,.28);background:rgba(8,8,12,.72);color:#fff;border-radius:999px;padding:13px 20px;font-weight:800;font-size:13px;letter-spacing:.3px;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 8px 26px rgba(0,0,0,.35)}
#minhaMarvelIntro .progress{position:absolute;left:0;right:0;bottom:0;height:3px;z-index:12;background:rgba(255,255,255,.08)}#minhaMarvelIntro .progress i{display:block;height:100%;width:0;background:linear-gradient(90deg,#9e001d,#ff294e,#fff)}
#minhaMarvelIntro.started .progress i{animation:mmProgress 6.8s linear both}
#minhaMarvelIntro .skip{position:absolute;right:18px;top:calc(16px + env(safe-area-inset-top));z-index:35;border:1px solid rgba(255,255,255,.2);background:rgba(5,5,9,.56);color:#fff;padding:10px 16px;border-radius:999px;font-weight:700;font-size:12px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
@keyframes mmWall{0%{opacity:0;transform:scale(1.34) rotate(-4deg)}15%{opacity:1}72%{opacity:.94}100%{opacity:.34;transform:scale(1.02) rotate(0)}}
@keyframes mmTile{0%{transform:scale(1.34) translateY(3%)}100%{transform:scale(1.03) translateY(-2%)}}
@keyframes mmScan{0%{transform:translateX(-75%);opacity:0}18%{opacity:1}78%{opacity:.85}100%{transform:translateX(75%);opacity:0}}
@keyframes mmGrain{0%{transform:translate(0,0)}25%{transform:translate(-1%,1%)}50%{transform:translate(1%,-1%)}75%{transform:translate(.5%,1%)}100%{transform:translate(0,0)}}
@keyframes mmBrand{0%,48%{opacity:0;transform:scale(.72)}64%{opacity:1;transform:scale(1.035)}86%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.07)}}
@keyframes mmLogoSweep{to{transform:translateX(85%)}}@keyframes mmProgress{to{width:100%}}
@media(max-width:520px){#minhaMarvelIntro .heroWall{inset:-4% -24%;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-rows:repeat(4,minmax(0,1fr))}#minhaMarvelIntro .brandFrame{width:min(91vw,520px);min-height:92px;padding:16px 18px 12px}#minhaMarvelIntro .brandMain{font-size:clamp(34px,10vw,58px);letter-spacing:-1.8px}}
@media(prefers-reduced-motion:reduce){#minhaMarvelIntro *{animation-duration:.01ms!important;animation-delay:0s!important}}
`;
document.head.appendChild(css);

const overlay=document.createElement('div');overlay.id='minhaMarvelIntro';
overlay.innerHTML=`<div class="heroWall" aria-hidden="true">${'<div class="heroTile"></div>'.repeat(12)}</div><div class="scan"></div><div class="grain"></div><div class="brandReveal"><div class="brandBox"><div class="brandFrame"><div class="brandMain">MINHA MARVEL</div></div><div class="brandSub">Doomsday Edition</div></div></div><button class="skip" type="button">Pular</button><div class="startGate"><button class="startBtn" type="button">Toque para iniciar com som</button></div><div class="progress"><i></i></div>`;
document.body.prepend(overlay);

async function loadHeroes(){try{const r=await fetch(`tmdb-data.json?intro=${Date.now()}`,{cache:'no-store'});if(!r.ok)return;const meta=await r.json();const preferred=['m006','m010','m015','m024','m030','m037','m045','m052','m061','m074','m095','m118'];const values=preferred.map(id=>meta[id]).filter(Boolean);if(values.length<12)values.push(...Object.values(meta).filter(x=>x?.backdrop||x?.poster));const unique=[],seen=new Set();for(const x of values){const p=x.backdrop||x.poster;if(p&&!seen.has(p)){seen.add(p);unique.push(p)}if(unique.length===12)break;}overlay.querySelectorAll('.heroTile').forEach((tile,i)=>{const path=unique[i%unique.length];if(!path)return;const img=new Image();img.alt='';img.src=`https://image.tmdb.org/t/p/w780${path}`;img.onload=()=>tile.appendChild(img);});}catch(e){}}
loadHeroes();

let audioCtx=null,timer=null,started=false;
function playSound(){if(!prefs.sound)return;try{audioCtx=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();const now=audioCtx.currentTime,master=audioCtx.createGain();master.connect(audioCtx.destination);master.gain.setValueAtTime(.0001,now);master.gain.exponentialRampToValueAtTime(.26,now+.08);master.gain.exponentialRampToValueAtTime(.0001,now+5.4);[55,82.4,110,164.8].forEach((f,i)=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=i<2?'sine':'triangle';o.frequency.setValueAtTime(f,now);o.frequency.exponentialRampToValueAtTime(f*(1.42+i*.08),now+5.1);g.gain.setValueAtTime(.17/(i+1),now);g.gain.exponentialRampToValueAtTime(.0001,now+5.2);o.connect(g);g.connect(master);o.start(now+i*.07);o.stop(now+5.25);});const impact=audioCtx.createOscillator(),ig=audioCtx.createGain();impact.type='sine';impact.frequency.setValueAtTime(105,now+4.05);impact.frequency.exponentialRampToValueAtTime(38,now+4.65);ig.gain.setValueAtTime(.0001,now);ig.gain.setValueAtTime(.48,now+4.05);ig.gain.exponentialRampToValueAtTime(.0001,now+4.8);impact.connect(ig);ig.connect(master);impact.start(now+4.05);impact.stop(now+4.85);}catch(e){}}
function start(){if(started)return;started=true;overlay.classList.add('started');overlay.querySelector('.startGate').classList.add('hidden');playSound();timer=setTimeout(close,Math.max(5000,Number(prefs.duration)||6800));}
function close(){if(overlay.classList.contains('hide'))return;clearTimeout(timer);overlay.classList.add('hide');document.documentElement.classList.add('intro-finished');setTimeout(()=>{overlay.remove();css.remove();try{audioCtx?.close()}catch(e){}},950);}
overlay.querySelector('.startBtn').addEventListener('click',start);overlay.querySelector('.startGate').addEventListener('click',e=>{if(e.target===e.currentTarget)start()});overlay.querySelector('.skip').addEventListener('click',close);
window.__MINHA_MARVEL_INTRO__={close,start,prefs};
})();