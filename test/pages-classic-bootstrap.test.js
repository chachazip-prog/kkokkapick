import assert from 'node:assert/strict';import fs from 'node:fs';
const html=fs.readFileSync('index.html','utf8'),ui=fs.readFileSync('src/release-ui.js','utf8');
assert.ok(!html.includes('type="module"'));assert.ok(!/^\s*import\s/m.test(ui));
for(const token of ['function evaluateFit','function getLatestPriceChange','function compareRecommended','window.__kkokkapickBooted=true','loadProducts()'])assert.ok(ui.includes(token),token);
console.log('Classic external bootstrap PASS');
