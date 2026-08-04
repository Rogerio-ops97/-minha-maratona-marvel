(()=>{
const KEY='minhaMarvel.premium.v1';
const P=Object.assign({sound:true,volume:.34},JSON.parse(localStorage.getItem(KEY)||'{}'));
const saveP=()=>localStorage.setItem(KEY,JSON.stringify(P));
let AC=null;
function audio(){if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();return AC}
function tone(type='tap'){if(!P.sound)return;try{const c=audio(),now=c.currentTime,g=c.createGain();g.connect(c.destination);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(P.volume,now+.012);g.gain.exponentialRampToValueAtTime(.0001,now+.22);const notes={tap:[420,.08],nav:[300,.07],done:[620,.14],season:[440,.28],achievement:[523,.48],open:[260,.12]}[type]||[360,.1];const o=c.createOscillator();o.type=type==='achievement'?'triangle':'sine';o.frequency.setValueAtTime(notes[0],now);if(type==='done')o.frequency.exponentialRampToValueAtTime(880,now+.13);if(type==='season')o.frequency.exponentialRampToValueAtTime(660,now+.25);o.connect(g);o.start(now);o.stop(now+notes[1]);}catch(e){}}
function vibrate(p){if(navigator.vibrate)navigator.vibrate(p)}
function addSoundSettings(){const box=document.querySelector('#settings .modalBody');if(!box||document.querySelector('#soundToggle'))return;const row=document.createElement('div');row.className='settingsToggle';row.innerHTML=`<div><b>Sons e resposta tátil</b><div class="hint">Efeitos originais nas interações.</div></div><input id="soundToggle" type="checkbox" ${P.sound?'checked':''}>`;box.insertBefore(row,document.querySelector('#saveSettings'));row.querySelector('input').onchange=e=>{P.sound=e.target.checked;saveP();tone('done')}}
document.addEventListener('click',e=>{if(e.target.closest('nav button'))tone('nav');else if(e.target.closest('.openItem,.gridCard .art,.gridCard .copy'))tone('open');else if(e.target.closest('[data-done],#toggleDone')){tone('done');vibrate(25)}else if(e.target.closest('button'))tone('tap')},true);
setTimeout(addSoundSettings,300);
const hotfix=document.createElement('script');hotfix.src='episode-hotfix.js?v=3.3';hotfix.defer=true;document.body.appendChild(hotfix);
window.__MARVEL_PREMIUM__={sound:()=>P.sound};
})();