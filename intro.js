(()=>{
'use strict';
const KEY='minhaMarvel.intro.settings';
const prefs=Object.assign({enabled:true,sound:true,oncePerSession:true},JSON.parse(localStorage.getItem(KEY)||'{}'));
if(!prefs.enabled||(prefs.oncePerSession&&sessionStorage.getItem('marvelIntroPlayed'))){document.documentElement.classList.add('intro-finished');return;}
sessionStorage.setItem('marvelIntroPlayed','1');
const css=document.createElement('style');
css.textContent=`
html:not(.intro-finished) body{overflow:hidden}
#marvelIntro{position:fixed;inset:0;z-index:99999;background:#030307;display:grid;place-items:center;overflow:hidden;opacity:1;transition:opacity .65s ease,visibility .65s ease}
#marvelIntro.hide{opacity:0;visibility:hidden;pointer-events:none}
#marvelIntro .introGlow{position:absolute;inset:-25%;background:radial-gradient(circle at 50% 50%,rgba(220,15,45,.38),transparent 45%),linear-gradient(120deg,transparent 25%,rgba(255,255,255,.06) 50%,transparent 75%);animation:introSweep 3.2s ease-in-out both}
#marvelIntro .introFrames{position:absolute;inset:0;display:grid;grid-template-columns:repeat(6,1fr);gap:6px;opacity:.28;transform:scale(1.2);filter:grayscale(1) contrast(1.25);animation:introZoom 3.4s cubic-bezier(.2,.7,.2,1) both}
#marvelIntro .introFrames i{background:linear-gradient(145deg,#2b2e38,#06070b 55%,#601020);border:1px solid rgba(255,255,255,.08);transform:skewX(-7deg)}
#marvelIntro .introMark{position:relative;display:flex;flex-direction:column;align-items:center;gap:12px;transform:scale(.72);opacity:0;animation:introMark 3.2s cubic-bezier(.18,.78,.22,1) .2s both}
#marvelIntro .introM{width:150px;height:150px;border-radius:32px;background:linear-gradient(145deg,#ff1f45,#a9001e);box-shadow:0 0 70px rgba(237,16,55,.52),inset 0 1px 0 rgba(255,255,255,.35);display:grid;place-items:center;color:#fff;font:900 108px/1 Arial,sans-serif;letter-spacing:-12px;padding-right:12px}
#marvelIntro .introTitle{font:800 25px/1.05 Arial,sans-serif;letter-spacing:8px;color:#fff;text-align:center;text-shadow:0 0 24px rgba(255,255,255,.22)}
#marvelIntro .introSub{font:600 10px/1 Arial,sans-serif;letter-spacing:4px;color:#cfd3dc;text-transform:uppercase}
#marvelIntro .introSkip{position:absolute;right:20px;bottom:calc(22px + env(safe-area-inset-bottom));border:1px solid rgba(255,255,255,.16);background:rgba(8,9,14,.55);color:#dfe3ea;padding:10px 14px;border-radius:999px;font:600 12px Arial,sans-serif;backdrop-filter:blur(10px)}
@keyframes introSweep{0%{transform:translateX(-28%);opacity:0}35%{opacity:1}100%{transform:translateX(28%);opacity:.25}}
@keyframes introZoom{0%{transform:scale(1.35) rotate(-2deg);opacity:0}20%{opacity:.32}100%{transform:scale(1.03) rotate(0);opacity:.12}}
@keyframes introMark{0%{opacity:0;transform:scale(.65) translateY(18px)}35%{opacity:1;transform:scale(1.04) translateY(0)}72%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.08)}}
@media (prefers-reduced-motion:reduce){#marvelIntro .introGlow,#marvelIntro .introFrames,#marvelIntro .introMark{animation:none!important}#marvelIntro .introMark{opacity:1;transform:none}}
`;
document.head.appendChild(css);
const overlay=document.createElement('div');overlay.id='marvelIntro';overlay.innerHTML=`<div class="introGlow"></div><div class="introFrames">${'<i></i>'.repeat(30)}</div><div class="introMark"><div class="introM">M</div><div class="introTitle">MINHA MARATONA</div><div class="introSub">Doomsday Edition</div></div><button class="introSkip" type="button">Pular</button>`;
document.body.prepend(overlay);
let audioCtx;
function playSound(){if(!prefs.sound)return;try{audioCtx=new(window.AudioContext||window.webkitAudioContext)();const now=audioCtx.currentTime,master=audioCtx.createGain();master.gain.setValueAtTime(.0001,now);master.gain.exponentialRampToValueAtTime(.16,now+.12);master.gain.exponentialRampToValueAtTime(.0001,now+2.8);master.connect(audioCtx.destination);[110,165,220].forEach((f,i)=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=i===0?'sine':'triangle';o.frequency.setValueAtTime(f,now);o.frequency.exponentialRampToValueAtTime(f*1.7,now+2.6);g.gain.setValueAtTime(.12/(i+1),now);o.connect(g);g.connect(master);o.start(now+i*.08);o.stop(now+2.9)});}catch(e){}}
function close(){overlay.classList.add('hide');document.documentElement.classList.add('intro-finished');setTimeout(()=>overlay.remove(),700);try{audioCtx?.close()}catch(e){}}
overlay.querySelector('.introSkip').addEventListener('click',close);
window.addEventListener('pointerdown',playSound,{once:true,capture:true});
setTimeout(close,3400);
})();