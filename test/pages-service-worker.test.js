import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const sw=fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8');

test('Pages service worker does not pin the app shell to stale cache',()=>{
  assert.match(sw,/kkokkapick-release-ui-reference-v7/);
  assert.match(sw,/event\.request\.mode==='navigate'/);
  assert.match(sw,/isAppCode/);
  assert.match(sw,/event\.respondWith\(networkFirst\(event\.request\)\)/);
  assert.match(sw,/keys\.filter\(key=>key!==CACHE\)/);
});

test('critical module graph is precached for offline fallback',()=>{
  for(const path of [
    './config.public.js','./src/product-image-availability.js','./src/release-ui.js','./styles/tokens.css','./styles/release.css',
    './src/public-commercial-client.js',
    './src/popup-policy.js',
    './src/commercial-client.js',
    './src/kkokkafit-engine.js',
    './src/brand-size-charts.js',
    './src/price-tracker.js',
    './src/recommendation-ranker.js'
  ]) assert.ok(sw.includes(path),path);
});

import vm from 'node:vm';
test('live catalog requests bypass storage and fail honestly while offline', async()=>{
 const handlers={},calls=[];
 const context={self:{location:{origin:'https://example.test'},addEventListener:(name,handler)=>handlers[name]=handler},URL,
  fetch:async(request,options)=>{calls.push(options);throw new Error('offline')},
  caches:{match:()=>{throw new Error('Live catalog must not read cached product data')},open:()=>{throw new Error('Live catalog must not write cached product data')}}};
 vm.runInNewContext(sw,context);
 for(const name of ['catalog.json','price-history.json']){
  let response;
  handlers.fetch({request:{method:'GET',mode:'cors',url:'https://example.test/data/'+name+'?ts=1'},respondWith:value=>response=value});
  await assert.rejects(response,/offline/);
 }
 assert.equal(calls.length,2);assert.ok(calls.every(options=>options.cache==='no-store'));
});
