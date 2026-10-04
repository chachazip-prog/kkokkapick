import assert from 'node:assert/strict';import fs from 'node:fs';
const html=fs.readFileSync('index.html','utf8'),d=fs.readFileSync('src/runtime-diagnostic.js','utf8');
assert.ok(html.indexOf('src/runtime-diagnostic.js')<html.indexOf('src/release-ui.js'));
for(const token of ["addEventListener('error'","addEventListener('unhandledrejection'",'BOOT_TIMEOUT'])assert.ok(d.includes(token));
console.log('Runtime diagnostics precede application PASS');
