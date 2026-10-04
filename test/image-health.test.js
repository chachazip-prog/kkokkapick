import assert from 'node:assert/strict';
import { probeImageUrl, validateProductImages } from "../src/image-health.js";

function response(status, contentType) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: name => name.toLowerCase() === "content-type" ? contentType : null },
    body: { cancel: async () => {} },
  };
}

const good = await probeImageUrl("https://cdn.example.com/a.jpg", {
  fetchImpl: async () => response(200, "image/jpeg"),
});
assert.ok(good.ok === true);

const dead = await probeImageUrl("https://cdn.example.com/missing.jpg", {
  fetchImpl: async () => response(404, "text/html; charset=utf-8"),
});
assert.ok(dead.ok === false && dead.status === 404);

const nonImage = await probeImageUrl("https://cdn.example.com/a.jpg", {
  fetchImpl: async () => response(200, "text/html"),
});
assert.ok(nonImage.ok === false && nonImage.reason === "non_image");

const products = await validateProductImages([
  { name: "good", imageUrl: "https://cdn.example.com/good.jpg" },
  { name: "dead", imageUrl: "https://cdn.example.com/dead.jpg" },
], {
  concurrency: 2,
  fetchImpl: async url => String(url).includes("good")
    ? response(200, "image/webp")
    : response(404, "text/html"),
});
assert.ok(products[0].imageUrl?.includes("good"));
assert.ok(products[0].imageHealth.ok === true);
assert.ok(products[1].imageUrl === null);
assert.ok(products[1].imageHealth.status === 404);
console.log("image health normalization PASS");

let calls=0;const waits=[];
const recovered=await probeImageUrl('https://cdn.example.com/transient.jpg',{fetchImpl:async()=>response(++calls===1?400:200,calls===1?'text/html':'image/jpeg'),waitImpl:async ms=>waits.push(ms)});
assert.equal(recovered.ok,true);assert.equal(calls,2);assert.deepEqual(waits,[250]);
calls=0;
const expired=await probeImageUrl('https://cdn.example.com/expired.jpg',{fetchImpl:async()=>{calls++;return response(404,'text/html')},waitImpl:async()=>assert.fail('404 must not be retried')});
assert.equal(expired.ok,false);assert.equal(calls,1);
calls=0;
await probeImageUrl('https://cdn.example.com/permanent.jpg',{fetchImpl:async()=>{calls++;return response(400,'text/html')},waitImpl:async()=>{}});
assert.equal(calls,3,'gateway retries are bounded');
calls=0;
const throttled=await probeImageUrl('https://cdn.example.com/throttled.jpg',{fetchImpl:async()=>{calls++;return {ok:false,status:429,headers:{get:name=>name==='retry-after'?'60':'text/html'},body:{cancel:async()=>{}}}},waitImpl:async()=>assert.fail('must not retry sooner than provider requested')});
assert.equal(calls,1);assert.equal(throttled.reason,'retry_later');
