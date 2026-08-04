(()=>{
'use strict';
function removeJarvis(){
  document.querySelectorAll('[data-view="jarvis"],#jarvis,.jarvisPage,.jarvisOrb,.jarvisChat,.jarvisInput,.jarvisSuggestions').forEach(el=>el.remove());
  const active=document.querySelector('.view.active');
  if(!active){
    document.getElementById('dashboard')?.classList.add('active');
    document.querySelector('nav [data-view="dashboard"]')?.classList.add('active');
  }
}
removeJarvis();
new MutationObserver(removeJarvis).observe(document.body,{subtree:true,childList:true});
try{
  const state=JSON.parse(localStorage.getItem('minhaMarvel.v7')||'{}');
  if('jarvisHistory' in state){delete state.jarvisHistory;localStorage.setItem('minhaMarvel.v7',JSON.stringify(state));}
}catch(e){}
})();