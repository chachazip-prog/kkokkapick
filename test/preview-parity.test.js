const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8'),ui=fs.readFileSync('src/release-ui.js','utf8');
for(const id of ['homeHero','homeCategories','searchTools','myPage','catalogSection','homeNav','searchNav','favNav','myNav']) assert.ok(html.includes(`id="${id}"`),id);
assert.ok(html.includes('styles/tokens.css')&&html.includes('styles/release.css')&&html.includes('src/release-ui.js'));
assert.ok(!html.includes('<style>'),'legacy override layers must not return');
assert.ok(ui.includes("$('searchTools').hidden=next!=='search'"));
assert.ok(ui.includes("$('catalogSection').hidden=next==='my'"),'search must expose product results');
assert.ok(ui.includes('data/catalog.json'),'live catalog boundary');
console.log('Release UI shell and catalog boundary PASS');
