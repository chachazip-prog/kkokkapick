import assert from 'node:assert/strict';
import {selectPopup,dismissKey} from '../src/popup-policy.js';
const now=new Date('2026-09-28T12:00:00Z');
const p=[
{id:'a',surface:'app',priority:99},
{id:'b',surface:'all',priority:1,starts_at:'2026-09-28T00:00:00Z',ends_at:'2026-09-29T00:00:00Z'},
{id:'c',surface:'web',priority:3}
];
assert.equal(selectPopup(p,{surface:'web',now}).id,'c');
assert.equal(selectPopup(p,{surface:'web',now,dismissed:x=>x.id==='c'}).id,'b');
assert.equal(dismissKey({id:'x',dismiss_policy:'forever'},now),'kk_popup_forever_x');
assert.match(dismissKey({id:'x',dismiss_policy:'daily'},now),/^kk_popup_daily_x_/);
console.log('popup policy tests passed');
