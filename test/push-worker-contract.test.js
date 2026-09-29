const fs=require('fs');
const migrations=['supabase/migrations/020_price_alert_delivery_foundation.sql','supabase/migrations/024_price_alert_retry_policy.sql'].map(p=>fs.readFileSync(p,'utf8')).join('\n');
for(const term of ['unique(alert_id,observed_price)','for update skip locked','p_max_attempts','next_attempt_at','p_retryable'])if(!migrations.toLowerCase().includes(term.toLowerCase()))throw new Error('push worker DB contract missing '+term);
const d=fs.readFileSync('docs/push-worker-contract.md','utf8');
for(const term of ['delivery_id','never log raw tokens','Invalid-token cleanup','server-side/protected'])if(!d.toLowerCase().includes(term.toLowerCase()))throw new Error('push worker operating contract missing '+term);
console.log('push worker contract PASS');
