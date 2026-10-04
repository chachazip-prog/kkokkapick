import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const html=fs.readFileSync('index.html','utf8');
const files=[...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]);assert.ok(files.length>=2);
for(const f of files)assert.doesNotThrow(()=>new vm.Script(fs.readFileSync(f,'utf8'),{filename:f}));
assert.ok(!html.includes('onclick="savePriceAlert('));
console.log('External classic scripts parse PASS');
