import assert from 'node:assert/strict';
import crypto from 'node:crypto';

import { FcmSender, createGoogleServiceAccountAssertion } from '../src/fcm-sender.js';
import { PushOutcome } from '../src/push-provider-result.js';

const {privateKey}=crypto.generateKeyPairSync('rsa',{modulusLength:2048});
const pem=privateKey.export({type:'pkcs8',format:'pem'});
const account={
  project_id:'project-1',
  client_email:'push@example.iam.gserviceaccount.com',
  private_key:pem,
  token_uri:'https://oauth2.googleapis.com/token',
};
const assertion=createGoogleServiceAccountAssertion({
  projectId:account.project_id,
  clientEmail:account.client_email,
  privateKey:pem,
  tokenUri:account.token_uri,
},new Date('2026-10-03T00:00:00Z'));
assert.equal(assertion.split('.').length,3);

const calls=[];
const fetchImpl=async(url,options)=>{
  calls.push({url:String(url),options});
  if(String(url).includes('oauth2.googleapis.com/token')){
    assert.match(String(options.body),/jwt-bearer/);
    return new Response(JSON.stringify({access_token:'access-token',expires_in:3600}),{
      status:200,headers:{'content-type':'application/json'},
    });
  }
  assert.match(String(url),/projects\/project-1\/messages:send$/);
  assert.equal(options.headers.authorization,'Bearer access-token');
  const body=JSON.parse(options.body);
  assert.match(body.message.token,/^device-token-secret-value(?:-2)?$/);
  assert.equal(body.message.data.deliveryId,'delivery-1');
  assert.equal('productId' in body.message.data,false);
  assert.equal('observedPrice' in body.message.data,false);
  return new Response(JSON.stringify({name:'projects/project-1/messages/1'}),{
    status:200,headers:{'content-type':'application/json'},
  });
};

const sender=new FcmSender({
  serviceAccount:JSON.stringify(account),
  fetchImpl,
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
assert.equal(calls.length,2);

// Access token is reused without a second OAuth request.
await sender.send({
  token:'device-token-secret-value-2',
  deliveryId:'delivery-2',
  productId:'product-2',
  observedPrice:9000,
},{title:'가격이 내려갔어요',body:'테스트'});
assert.equal(calls.filter(c=>c.url.includes('oauth2.googleapis.com/token')).length,1);
console.log('FCM sender contract PASS');
