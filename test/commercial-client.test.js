import assert from 'node:assert/strict';
import {commercialEvent,campaignIsVisible,validHttpUrl} from '../src/commercial-client.js';
assert.equal(validHttpUrl('https://example.com/a'),true);
assert.equal(validHttpUrl('javascript:alert(1)'),false);
assert.equal(commercialEvent({campaignId:'c',type:'click'}).event_type,'click');
assert.equal(commercialEvent({campaignId:'c',type:'bad'}),null);
assert.equal(commercialEvent({campaignId:'c',type:'conversion',revenue:-1}),null);
assert.equal(campaignIsVisible({starts_at:'2026-09-01T00:00:00Z',ends_at:'2026-10-01T00:00:00Z'},{now:new Date('2026-09-28T00:00:00Z')}),true);
console.log('commercial client tests passed');
