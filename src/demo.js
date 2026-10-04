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
const widthSelect=document.getElementById('previewWidth');
const screenWrap=document.querySelector('.screen-wrap');
function fitPreview(){const width=Number(widthSelect.value);const height=window.matchMedia('(max-width:740px)').matches?740:844;const available=Math.max(1,screenWrap.clientWidth-16);const scale=Math.min(1,available/width);frame.style.width=width+'px';frame.style.height=height+'px';frame.style.transform='scale('+scale+')';frame.style.left=Math.max(0,(available-width*scale)/2)+'px';screenWrap.style.height=height*scale+18+'px';}
widthSelect.addEventListener('change',fitPreview);
new ResizeObserver(fitPreview).observe(screenWrap);
fitPreview();
