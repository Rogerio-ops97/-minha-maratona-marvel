(()=>{
'use strict';
const css=document.createElement('style');
css.textContent=`
#detailV7{overscroll-behavior-y:contain;touch-action:pan-y;background:#07090e}
#detailV7 .v7Hero{min-height:720px;height:auto;padding-top:calc(78px + env(safe-area-inset-top));background-position:center top;background-size:cover;display:flex;align-items:flex-end}
#detailV7 .v7Hero:after{background:linear-gradient(180deg,rgba(4,5,9,.08) 0%,rgba(4,5,9,.24) 34%,rgba(7,9,14,.9) 78%,#07090e 100%),linear-gradient(90deg,rgba(4,5,9,.7),transparent 75%)}
#detailV7 .v7HeroCopy{position:relative;left:auto;right:auto;bottom:auto;width:100%;padding:0 32px 42px;box-sizing:border-box;max-width:860px}
#detailV7 .v7HeroCopy h1{font-size:clamp(42px,8vw,72px);line-height:.96;margin:16px 0 18px;overflow-wrap:anywhere}
#detailV7 .v7HeroCopy p{font-size:clamp(18px,2.8vw,25px);line-height:1.55;max-width:760px;margin:0;color:#e3e6ec;text-shadow:0 2px 14px rgba(0,0,0,.65)}
#detailV7 .v7Badges{padding-top:4px}
#detailV7 .v7Actions{margin-top:24px}
#detailV7 .v7Back{left:28px;top:calc(18px + env(safe-area-inset-top));width:50px;height:50px}
#detailV7 .v7Body{padding:0 32px;max-width:1120px}
#detailV7 .v7Section{margin:42px 0}
@media(max-width:520px){
 #detailV7 .v7Hero{min-height:760px;padding-top:calc(72px + env(safe-area-inset-top));background-position:center top}
 #detailV7 .v7HeroCopy{padding:0 32px 36px}
 #detailV7 .v7HeroCopy h1{font-size:clamp(42px,12.8vw,58px);line-height:.96;margin-top:14px}
 #detailV7 .v7HeroCopy p{font-size:18px;line-height:1.48}
 #detailV7 .v7Body{padding:0 32px}
 #detailV7 .v7Back{left:28px}
}
#detailV7.swiping{transition:none!important}
`;
document.head.appendChild(css);

const detail=document.getElementById('detailV7');
if(!detail)return;
let startX=0,startY=0,currentX=0,tracking=false;
const closeDetail=()=>{detail.style.transform='';detail.style.opacity='';detail.classList.remove('swiping','open');};
detail.addEventListener('touchstart',e=>{
 if(!detail.classList.contains('open')||e.touches.length!==1)return;
 const t=e.touches[0];
 if(t.clientX>34)return;
 startX=currentX=t.clientX;startY=t.clientY;tracking=true;detail.classList.add('swiping');
},{passive:true});
detail.addEventListener('touchmove',e=>{
 if(!tracking)return;
 const t=e.touches[0],dx=t.clientX-startX,dy=Math.abs(t.clientY-startY);
 if(dy>Math.abs(dx)){tracking=false;detail.classList.remove('swiping');return;}
 if(dx<=0)return;
 currentX=t.clientX;
 detail.style.transform=`translateX(${Math.min(dx,innerWidth)}px)`;
 detail.style.opacity=String(Math.max(.35,1-dx/innerWidth));
},{passive:true});
detail.addEventListener('touchend',()=>{
 if(!tracking)return;
 const dx=currentX-startX;tracking=false;detail.classList.remove('swiping');
 if(dx>Math.min(120,innerWidth*.28))closeDetail();
 else{detail.style.transition='.25s ease';detail.style.transform='';detail.style.opacity='';setTimeout(()=>detail.style.transition='',260);}
},{passive:true});
window.addEventListener('popstate',()=>{if(detail.classList.contains('open'))closeDetail();});
const obs=new MutationObserver(()=>{
 if(detail.classList.contains('open')&&!history.state?.minhaMarvelDetail)history.pushState({minhaMarvelDetail:true},'');
});
obs.observe(detail,{attributes:true,attributeFilter:['class']});
})();