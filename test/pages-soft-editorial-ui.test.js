import assert from 'node:assert/strict';import fs from 'node:fs';
const html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('styles/release.css','utf8');
for(const s of ['홈','검색','찜','마이'])assert.ok(html.includes(`aria-label="${s}"`));
assert.ok(!html.includes('concept-pills'));assert.ok(!css.includes('box-shadow'));assert.ok(html.includes('id="photoMode"'));assert.ok(html.includes('id="photoGrid"'));assert.ok(html.includes('id="photoCard"'));
assert.match(css,/\.nav\.on span \{[^}]*background: var\(--surface-accent\)/);
console.log('Clean commerce navigation PASS');
