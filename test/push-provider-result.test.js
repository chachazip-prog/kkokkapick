import assert from 'node:assert/strict';
import {
  PushOutcome,
  classifyApnsResponse,
  classifyFcmResponse,
} from '../src/push-provider-result.js';

assert.equal(classifyFcmResponse(200,{}).outcome,PushOutcome.success);
assert.equal(classifyFcmResponse(404,{error:{status:'UNREGISTERED'}}).outcome,PushOutcome.invalidToken);
assert.equal(classifyFcmResponse(429,{error:{status:'QUOTA_EXCEEDED'}}).outcome,PushOutcome.retryable);
assert.equal(classifyFcmResponse(503,{error:{status:'UNAVAILABLE'}}).outcome,PushOutcome.retryable);
assert.equal(classifyFcmResponse(400,{error:{status:'INVALID_ARGUMENT'}}).outcome,PushOutcome.terminal);
assert.equal(classifyFcmResponse(401,{error:{status:'UNAUTHENTICATED'}}).outcome,PushOutcome.terminal);

assert.equal(classifyApnsResponse(200).outcome,PushOutcome.success);
assert.equal(classifyApnsResponse(410,'Unregistered').outcome,PushOutcome.invalidToken);
assert.equal(classifyApnsResponse(400,'BadDeviceToken').outcome,PushOutcome.invalidToken);
assert.equal(classifyApnsResponse(429,'TooManyRequests').outcome,PushOutcome.retryable);
assert.equal(classifyApnsResponse(503,'Shutdown').outcome,PushOutcome.retryable);
assert.equal(classifyApnsResponse(403,'InvalidProviderToken').outcome,PushOutcome.terminal);
console.log('push provider result classification PASS');
