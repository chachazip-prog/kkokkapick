import assert from 'node:assert/strict';import fs from 'node:fs';
const html=fs.readFileSync('index.html','utf8'),ui=fs.readFileSync('src/release-ui.js','utf8');
for(const id of ['myPage','myNav','searchNav'])assert.ok(html.includes(`id="${id}"`));
assert.ok(ui.includes('function renderMy()'));assert.ok(ui.includes("$('catalogSection').hidden=next==='my'"));
assert.ok(!ui.includes("$('q').focus()"));
console.log('Dedicated search and account views PASS');
