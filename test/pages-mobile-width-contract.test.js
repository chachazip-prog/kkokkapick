import assert from 'node:assert/strict';import fs from 'node:fs';
const css=fs.readFileSync('styles/release.css','utf8');
assert.ok(css.includes('repeat(2,minmax(0,1fr))'));assert.ok(css.includes('min-width: 0'));
assert.ok(!css.includes('overflow-x: hidden'),'Do not mask width defects');
console.log('Intrinsic mobile containment PASS (browser suite checks 320/375/390/430)');
