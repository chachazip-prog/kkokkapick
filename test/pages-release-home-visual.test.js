import assert from 'node:assert/strict';import fs from 'node:fs';
const html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('styles/release.css','utf8');
for(const s of ['신생아','베이비','유아','토들러','키즈'])assert.ok(html.includes(`data-home-stage="${s}"`));
assert.ok(html.includes('assets/hero-proposals/hero-3.webp'));assert.ok(!html.includes('reference-hero'));assert.ok(!/background[^;{}]*linear-gradient/.test(css),'no background gradients; image-edge mask is allowed');
assert.match(css,/\.pic img[^}]*object-fit: contain/);
console.log('Product Owner reference campaign structure PASS; visual approval requires actual review');
