(()=>{
'use strict';
function castBlocks(){
  return [...document.querySelectorAll('#modal .modalBody > div')].filter(el=>{
    const label=el.querySelector(':scope > label');
    return label && label.textContent.trim()==='Elenco principal' && el.querySelector('.castRail');
  });
}
function clearInjectedModal(){
  castBlocks().forEach(el=>el.remove());
  document.querySelectorAll('#modal #v3Meta,#modal #cinemaBar,#modal #episodeSection').forEach(el=>el.remove());
}
function dedupe(){
  const blocks=castBlocks();
  if(blocks.length>1) blocks.slice(0,-1).forEach(el=>el.remove());
}
const previousOpen=window.openItem;
if(typeof previousOpen==='function'){
  window.openItem=function(id){
    clearInjectedModal();
    const result=previousOpen(id);
    setTimeout(dedupe,80);
    setTimeout(dedupe,220);
    return result;
  };
}
const observer=new MutationObserver(()=>dedupe());
observer.observe(document.querySelector('#modal')||document.body,{childList:true,subtree:true});
window.__MARVEL_MODAL_CLEANUP__={clearInjectedModal,dedupe};
})();