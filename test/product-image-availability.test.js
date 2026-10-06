import test from 'node:test';
import assert from 'node:assert/strict';
import images from '../src/product-image-availability.js';
const now=Date.parse('2026-10-05T01:00:00Z'),stamp='2026-10-05T00:00:00Z',url='https://example.test/one.jpg',other='https://example.test/two.jpg';
test('only a valid newer observation resets failed URLs',()=>{
 const state=images.createState();assert.equal(state.setSnapshot(stamp,now),true);state.markFailed(url);
 assert.deepEqual(state.urls({imageUrl:url,imageUrls:[url,other]}),[other]);
 for(const s of [stamp,'2026-10-04T23:00:00Z','invalid','2026-10-05T02:00:00Z'])assert.equal(state.setSnapshot(s,now),false);
 assert.equal(state.failedCount(),1);assert.equal(state.setSnapshot('2026-10-05T00:30:00Z',now),true);assert.equal(state.failedCount(),0);
});
test('recovery shares two retries across all cards for a URL',async()=>{
 let count=0;const state=images.createState({probeImpl:async()=>{count++;return false},waitImpl:async()=>{}});
 state.setSnapshot(stamp,now);assert.deepEqual(await Promise.all([state.recover(url),state.recover(url),state.recover(url)]),['unavailable','unavailable','unavailable']);assert.equal(count,2);await state.recover(url);assert.equal(count,2);
 assert.deepEqual(state.urls({imageUrl:url,imageUrls:[other]}),[other]);state.markFailed(other);assert.deepEqual(state.urls({imageUrl:url,imageUrls:[other]}),[]);
});
test('old generation completion cannot quarantine refreshed photos',async()=>{
 let resolve;const state=images.createState({probeImpl:()=>new Promise(r=>resolve=r),waitImpl:async()=>{}});
 state.setSnapshot(stamp,now);const old=state.generation(),pending=state.recover(url,old);await Promise.resolve();await Promise.resolve();
 state.setSnapshot('2026-10-05T00:30:00Z',now);resolve(false);assert.equal(await pending,'stale');assert.equal(state.markFailed(url,old),false);assert.equal(state.failedCount(),0);
});
test('offline errors preserve source photos and allow bounded recovery after reconnect',async()=>{
 let online=false,count=0;const state=images.createState({onlineImpl:()=>online,probeImpl:async()=>{count++;return false},waitImpl:async()=>{}});
 state.setSnapshot(stamp,now);assert.equal(await state.recover(url),'offline');assert.equal(state.markFailed(url),false);assert.equal(count,0);assert.deepEqual(state.urls({imageUrl:url}),[url]);
 online=true;assert.equal(await state.recover(url),'unavailable');assert.equal(count,2);
});
test('successful alternate recovery does not change product identity or source fields',async()=>{
 const p={id:'real-product',imageUrl:url,imageUrls:[url,other],offers:[{price:12000}],checkedAt:stamp};const before=JSON.stringify(p);
 const state=images.createState({probeImpl:async u=>u===other,waitImpl:async()=>{}});state.setSnapshot(stamp,now);
 assert.equal(await state.recover(url),'unavailable');assert.equal(await state.recover(other),'available');assert.deepEqual(state.urls(p),[other]);assert.equal(JSON.stringify(p),before);
});
