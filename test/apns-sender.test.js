import assert from 'node:assert/strict';
import crypto from 'node:crypto';

import { ApnsSender, createApnsProviderToken } from '../src/apns-sender.js';
import { PushOutcome } from '../src/push-provider-result.js';

const {privateKey}=crypto.generateKeyPairSync('ec',{namedCurve:'P-256'});
const pem=privateKey.export({type:'pkcs8',format:'pem'});
const token=createApnsProviderToken({
  keyId:'ABCDEFGHIJ',
  teamId:'KLMNOPQRST',
  privateKey:pem,
},new Date('2026-10-03T00:00:00Z'));
assert.equal(token.split('.').length,3);

const calls=[];
const transport=async(args)=>{
  calls.push(args);
  assert.equal(args.origin,'https://api.push.apple.com');
  assert.equal(args.path,'/3/device/device-token-secret-value');
  assert.equal(args.headers['apns-topic'],'com.kkokkapick.app');
  assert.equal(args.headers['apns-push-type'],'alert');
  assert.match(args.headers.authorization,/^bearer /);
  assert.equal(args.payload.kkokkapick.deliveryId,'delivery-1');
  return {status:200,body:''};
};
const sender=new ApnsSender({
  keyId:'ABCDEFGHIJ',
  teamId:'KLMNOPQRST',
  bundleId:'com.kkokkapick.app',
  privateKey:pem,
  transport,
  now:()=>new Date('2026-10-03T00:00:00Z'),
});
const result=await sender.send({
  token:'device-token-secret-value',
  deliveryId:'delivery-1',
  productId:'product-1',
  observedPrice:12000,
},{title:'가격이 내려갔어요',body:'테스트'});
assert.equal(result.outcome,PushOutcome.success);
assert.equal(JSON.stringify(result).includes('device-token-secret-value'),false);
assert.equal(calls.length,1);

const invalid=new ApnsSender({
  keyId:'ABCDEFGHIJ',teamId:'KLMNOPQRST',bundleId:'com.kkokkapick.app',
  privateKey:pem,
  transport:async()=>({status:410,body:'{"reason":"Unregistered"}'}),
  now:()=>new Date('2026-10-03T00:00:00Z'),
});
assert.equal((await invalid.send({
  token:'invalid-device-token-123',deliveryId:'d',productId:'p',observedPrice:1,
},{title:'t',body:'b'})).outcome,PushOutcome.invalidToken);
console.log('APNs sender contract PASS');
