import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const sw=fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8');

test('Pages service worker does not pin the app shell to stale cache',()=>{
  assert.match(sw,/kkokkapick-release-ui-reference-v4/);
  assert.match(sw,/event\.request\.mode==='navigate'/);
  assert.match(sw,/isAppCode/);
  assert.match(sw,/event\.respondWith\(networkFirst\(event\.request\)\)/);
  assert.match(sw,/keys\.filter\(key=>key!==CACHE\)/);
});

test('critical module graph is precached for offline fallback',()=>{
  for(const path of [
    './config.public.js','./src/release-ui.js','./styles/tokens.css','./styles/release.css',
    './src/public-commercial-client.js',
    './src/popup-policy.js',
    './src/commercial-client.js',
    './src/kkokkafit-engine.js',
    './src/brand-size-charts.js',
    './src/price-tracker.js',
    './src/recommendation-ranker.js',
    './data/catalog.json'
  ]) assert.ok(sw.includes(path),path);
});
