(()=>{
'use strict';
const detail=()=>document.getElementById('detailV7');
function preserveAfterEpisodeToggle(event){
  const button=event.target.closest('[data-v7ep]');
  const page=detail();
  if(!button||!page||!page.classList.contains('open'))return;
  const top=page.scrollTop;
  const restore=()=>{const current=detail();if(current?.classList.contains('open'))current.scrollTop=top};
  requestAnimationFrame(restore);
  setTimeout(restore,0);
  setTimeout(restore,40);
  setTimeout(restore,100);
}
document.addEventListener('click',preserveAfterEpisodeToggle,true);
})();