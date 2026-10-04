import assert from 'node:assert/strict';import fs from 'node:fs';
const tokens=fs.readFileSync('styles/tokens.css','utf8'),css=fs.readFileSync('styles/release.css','utf8');
assert.ok(tokens.includes('--weight-body: 400'));assert.ok(tokens.includes('--weight-heading: 500'));
assert.ok(!/font-weight:\s*[89]\d\d/.test(css));assert.ok(!css.includes('@import'));
console.log('Release typography tokens PASS');
