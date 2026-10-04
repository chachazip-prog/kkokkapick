import assert from 'node:assert/strict';import fs from 'node:fs';
const css=fs.readFileSync('styles/release.css','utf8');assert.match(css,/input, select \{[^}]*font-size: 16px/);
assert.ok(!/input(?!::placeholder)[^{}]*\{[^}]*font-size: (?:1[0-5]|\d)px/.test(css));
console.log('iOS 16px form controls PASS');
