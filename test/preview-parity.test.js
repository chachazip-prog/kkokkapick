const fs=require('node:fs');
const html=fs.readFileSync('index.html','utf8');
const required=['꼬까픽 Preview · D03/v10','우리 아이 옷, 더 쉽게 고르는 방법','FOR YOUR KID · KKOKKAFIT','우리 아이를 위한 추천','상품명이나 브랜드를 검색해보세요','계속 둘러보세요','@media(max-width:360px)','-webkit-line-clamp:3'];
for(const token of required){if(!html.includes(token))throw new Error('preview parity token missing: '+token);}
if(!html.includes('data/catalog.json'))throw new Error('preview catalog loading missing');
for(const token of ['id="searchTools"','id="homeHero"','id="homeNav"','id="searchNav"',"setView('search')","setView('favorites')"]){
  if(!html.includes(token))throw new Error('preview job navigation token missing: '+token);
}
const header=html.match(/<header class="top">([\s\S]*?)<\/header>/)?.[1]||'';
if(header.includes('id="q"'))throw new Error('Home header must not duplicate the dedicated Search input');
if(!html.includes("document.getElementById('searchTools').hidden=next!=='search'"))throw new Error('Search controls must be scoped to Search view');
console.log('Pages preview parity contract PASS');
