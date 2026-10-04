const frame=document.getElementById('screen');
document.querySelectorAll('nav a').forEach(link=>link.addEventListener('click',()=>{
 document.querySelectorAll('nav a').forEach(item=>item.removeAttribute('aria-current'));
 link.setAttribute('aria-current','page');
 const label=link.querySelector('strong').textContent;
 document.getElementById('screenLabel').textContent=label;
 frame.title='꼬까픽 '+label+' 미리보기';
 document.getElementById('openScreen').href=link.href;
 if(window.matchMedia('(max-width:740px)').matches)document.querySelector('.preview').scrollIntoView({block:'start'});
}));
document.getElementById('previewWidth').addEventListener('change',event=>{frame.style.width=event.target.value+'px';});
