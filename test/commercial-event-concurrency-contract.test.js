const fs=require('fs');
const s=fs.readFileSync('supabase/migrations/027_commercial_event_concurrency_guard.sql','utf8');
for(const term of ['pg_advisory_xact_lock','hashtext(v_session)','rate limit exceeded',"interval '10 seconds'",'revenue)\n  values'])if(!s.includes(term))throw new Error('commercial concurrency guard missing '+term);
if(/inet_client_addr|x-forwarded-for|ip_address/i.test(s))throw new Error('privacy regression: network identifier collection');
console.log('commercial concurrency guard PASS');
