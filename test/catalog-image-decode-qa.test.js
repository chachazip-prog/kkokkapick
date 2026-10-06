const test=require('node:test'),assert=require('node:assert/strict');
const {decoded,runBoundedUrl,summarize,requestBelongsTo}=require('../scripts/catalog-image-decode-qa.cjs');
const url='https://photo-fixture.invalid/original.jpg',loaded={reason:'loaded',httpStatus:200,width:640,height:640};
async function run(rows){const calls=[],delays=[];const result=await runBoundedUrl(url,async(u,attempt)=>{calls.push({u,attempt});return rows[attempt-1]},async ms=>delays.push(ms));return{result,calls,delays}}
test('first successful real decode needs one attempt',async()=>{const r=await run([loaded]);assert.equal(r.result.ok,true);assert.equal(r.calls.length,1);assert.deepEqual(r.delays,[])});
test('HTTP400 recovers within exactly two additional unchanged URL probes',async()=>{
 const before={syncedAt:'2026-10-06T12:35:41.520Z',expiresAt:'2026-10-07T12:35:41.520Z'},copy=JSON.stringify(before);
 const r=await run([{reason:'error',httpStatus:400,width:0,height:0},{reason:'error',httpStatus:400,width:0,height:0},loaded]);
 assert.equal(r.result.recovered,true);assert.equal(r.calls.length,3);assert.deepEqual(r.delays,[350,900]);assert.ok(r.calls.every(c=>c.u===url));assert.equal(JSON.stringify(before),copy);
 assert.deepEqual(summarize([r.result]),{firstPass:{checked:1,ok:0,failed:1},finalCounts:{checked:1,ok:1,failed:0},boundedRecovered:1,totalAttempts:3});
});
test('HTTP404 and unknown timeout are not retried',async()=>{for(const httpStatus of [404,null]){const r=await run([{reason:'error',httpStatus,width:0,height:0}]);assert.equal(r.calls.length,1);assert.equal(r.result.ok,false)}});
test('400 then404 stops before the third attempt',async()=>{const r=await run([{reason:'error',httpStatus:400},{reason:'error',httpStatus:404}]);assert.equal(r.calls.length,2);assert.deepEqual(r.delays,[350]);assert.equal(r.result.ok,false)});
test('a persistent400 fails after the bounded third attempt',async()=>{const r=await run(Array.from({length:3},()=>({reason:'error',httpStatus:400})));assert.equal(r.calls.length,3);assert.equal(r.result.ok,false);assert.equal(r.result.recovered,false)});
test('HTTP200 with zero natural dimensions and HTTP404 image bodies fail decode',()=>{assert.equal(decoded({...loaded,width:0}),false);assert.equal(decoded({...loaded,httpStatus:404}),false);assert.equal(decoded({...loaded,httpStatus:null}),true)});
test('response request attribution cannot reuse a previous attempt request',()=>{
 const previous={redirectedFrom:()=>null},current={redirectedFrom:()=>null},redirect={redirectedFrom:()=>current};
 assert.equal(requestBelongsTo(previous,current),false);assert.equal(requestBelongsTo(redirect,current),true);assert.equal(requestBelongsTo(current,current),true);
});
