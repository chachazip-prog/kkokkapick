import assert from 'node:assert/strict';

import { runPriceAlertPushBatch } from '../src/price-alert-push-worker.js';
import { PushOutcome } from '../src/push-provider-result.js';

const completions=[];
const backend={
  async evaluate(limit){assert.equal(limit,500);return 2;},
  async claim(args){
    assert.equal(args.limit,10);
    assert.equal(args.platform,null);
    return [
      {target_id:'t1',delivery_id:'d1',product_id:'p1',observed_price:12000,platform:'android',token:'raw-token-android-123456',attempt_count:1},
      {target_id:'t2',delivery_id:'d1',product_id:'p1',observed_price:12000,platform:'ios',token:'raw-token-ios-123456',attempt_count:1},
    ];
  },
  async complete(value){completions.push(value);},
};
const senders={
  android:{async send(target,notification){
    assert.equal(target.deliveryId,'d1');
    assert.match(notification.body,/12,000원/);
    return {outcome:PushOutcome.success,code:'fcm_ok'};
  }},
  ios:{async send(){return {outcome:PushOutcome.invalidToken,code:'apns_unregistered'};}},
};
const summary=await runPriceAlertPushBatch({
  backend,senders,claimLimit:10,
});
assert.deepEqual(summary,{
  evaluated:2,claimed:2,sent:1,retryable:0,invalidToken:1,failed:0,
});
assert.equal(completions.length,2);
assert.equal(completions[0].success,true);
assert.equal(completions[1].invalidToken,true);
assert.equal(JSON.stringify(summary).includes('raw-token'),false);

const transient=[];
await runPriceAlertPushBatch({
  backend:{
    async evaluate(){return 0;},
    async claim(){return [{target_id:'t3',delivery_id:'d3',product_id:'p3',observed_price:1,platform:'android',token:'raw-token-transport-123456'}];},
    async complete(v){transient.push(v);},
  },
  senders:{android:{async send(){throw new Error('network included raw-token-transport-123456');}}},
  platform:'android',
});
assert.equal(transient[0].retryable,true);
assert.equal(transient[0].errorCode,'provider_transport_error');
assert.equal(JSON.stringify(transient).includes('raw-token-transport-123456'),false);
console.log('price alert push worker PASS');
