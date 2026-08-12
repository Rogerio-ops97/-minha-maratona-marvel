(()=>{
'use strict';
const TMDB='https://image.tmdb.org/';
const PROXY='https://wsrv.nl/?url=';
const seen=new WeakSet();
function proxify(url){
  if(!url||typeof url!=='string')return url;
  if(url.startsWith(PROXY))return url;
  if(!url.startsWith(TMDB))return url;
  return `${PROXY}${encodeURIComponent(url)}&output=webp&q=90`;
}
function fixImg(img){
  if(!img||seen.has(img))return;
  const src=img.getAttribute('src')||'';
  if(src.startsWith(TMDB)){
    seen.add(img);
    const original=src;
    img.src=proxify(src);
    img.onerror=()=>{if(img.src!==original){img.onerror=null;img.src=original;}};
  }
}
function fixStyle(el){
  if(!el?.style)return;
  const bg=el.style.backgroundImage||'';
  if(!bg.includes(TMDB))return;
  const next=bg.replace(/https:\/\/image\.tmdb\.org\/[^"')]+/g,m=>proxify(m));
  if(next!==bg)el.style.backgroundImage=next;
}
function scan(root=document){
  if(root.nodeType===1){fixImg(root);fixStyle(root)}
  root.querySelectorAll?.('img').forEach(fixImg);
  root.querySelectorAll?.('[style*="image.tmdb.org"]').forEach(fixStyle);
}
scan();
new MutationObserver(muts=>{
  for(const m of muts){
    if(m.type==='attributes'){fixImg(m.target);fixStyle(m.target)}
    m.addedNodes.forEach(n=>{if(n.nodeType===1)scan(n)});
  }
}).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','style']});
window.__MARVEL_IMAGE_FALLBACK__={scan,proxify};
})();