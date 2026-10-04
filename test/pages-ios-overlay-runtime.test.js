import assert from 'node:assert/strict';import fs from 'node:fs';
const css=fs.readFileSync('styles/release.css','utf8'),ui=fs.readFileSync('src/release-ui.js','utf8'),diagnostic=fs.readFileSync('src/runtime-diagnostic.js','utf8');
assert.ok(css.includes('overscroll-behavior:contain;-webkit-overflow-scrolling:touch'));
for(const token of ["function lockPageScroll()","document.body.style.position='fixed'","window.scrollTo(0,overlayScrollY)","if(e.target===sheet)e.preventDefault()"] ) assert.ok(ui.includes(token),token);
assert.ok(diagnostic.includes('if(opaque)return;'));
console.log('iOS overlay containment PASS');
